import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import PDFDocument from "pdfkit";
import * as fs from "fs";
import * as path from "path";
import { PassThrough } from "node:stream";

type InvoiceLineItem = {
  name: string;
  description: string;
  price: number;
  quantity: number;
};

function getFormString(formData: FormData, ...keys: string[]): string {
  for (const key of keys) {
    const v = formData.get(key);
    if (typeof v !== "string") continue;
    const t = v.trim();
    if (t !== "") return t;
  }
  return "";
}

function formatDefaultInvoiceDate(): string {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDueDateOneMonthAhead(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const DEFAULT_INVOICE_TERMS = "Paid by the Due Date";

const DEFAULT_TO_NAME = "FBX Technologies";
const DEFAULT_TO_EMAIL = "your@email.com";
const DEFAULT_TO_ADDRESS = "Your address";
const DEFAULT_TO_PHONE = "(123) 456 7890";
const DEFAULT_TAX_RATE = 0.07;

function envOrDefault(key: string, fallback: string): string {
  const v = process.env[key];
  return typeof v === "string" && v.trim() !== "" ? v.trim() : fallback;
}

/**
 * Reads `INVOICE_TAX_RATE`, then `TAX_RATE`, then `TAX`.
 * Accepts a decimal rate (0.07 = 7%) or a whole number percent (7 → 0.07).
 * Optional trailing `%` is stripped.
 */
function taxRateFromEnv(): number {
  const raw =
    process.env.INVOICE_TAX_RATE ??
    process.env.TAX_RATE ??
    process.env.TAX;
  if (raw === undefined || String(raw).trim() === "") return DEFAULT_TAX_RATE;
  const cleaned = String(raw).trim().replace(/%$/, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return DEFAULT_TAX_RATE;
  if (n > 1) return Math.min(n / 100, 1);
  return Math.min(n, 1);
}

function formatTaxPercentForLabel(rate: number): string {
  const p = Math.round(rate * 10000) / 100;
  if (Math.abs(p - Math.round(p)) < 1e-6) return String(Math.round(p));
  return p.toFixed(2).replace(/\.?0+$/, "");
}

/** Prefix with `P: ` unless the value already looks like a phone label line. */
function billingPhoneLineFromEnv(raw: string): string {
  const t = raw.trim();
  if (!t) return `P: ${DEFAULT_TO_PHONE}`;
  if (/^P\s*:/i.test(t)) return t;
  return `P: ${t}`;
}

function defaultInvoiceNumber(): string {
  return `INV-${Date.now().toString(36).toUpperCase()}`;
}

function normalizeLineItem(raw: unknown): InvoiceLineItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const name = String(o.name ?? o.itemName ?? "").trim();
  const description = String(
    o.details ?? o.description ?? o.itemDetails ?? "",
  ).trim();
  const price = Number(o.price);
  const quantity = Number(o.quantity ?? o.qty);
  if (!Number.isFinite(price) || price < 0) return null;
  if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isInteger(quantity)) return null;
  if (!name) return null;
  return { name, description, price, quantity };
}

function parseLineItemsFromForm(formData: FormData): InvoiceLineItem[] | null {
  const itemsJson = getFormString(formData, "items");
  if (itemsJson) {
    try {
      const parsed = JSON.parse(itemsJson) as unknown;
      if (!Array.isArray(parsed)) return null;
      const lines = parsed
        .map(normalizeLineItem)
        .filter((x): x is InvoiceLineItem => x !== null);
      return lines.length ? lines : null;
    } catch {
      return null;
    }
  }

  const out: InvoiceLineItem[] = [];
  for (let i = 0; i < 500; i++) {
    const name = getFormString(
      formData,
      `item_${i}_name`,
      `items[${i}][name]`,
      `items[${i}][itemName]`,
    );
    const details = getFormString(
      formData,
      `item_${i}_details`,
      `items[${i}][details]`,
      `items[${i}][description]`,
    );
    const priceRaw = getFormString(
      formData,
      `item_${i}_price`,
      `items[${i}][price]`,
    );
    const qtyRaw = getFormString(
      formData,
      `item_${i}_quantity`,
      `items[${i}][quantity]`,
      `items[${i}][qty]`,
    );
    if (!name && !details && !priceRaw && !qtyRaw) break;

    const line = normalizeLineItem({
      name,
      details,
      price: priceRaw === "" ? NaN : Number(priceRaw),
      quantity: qtyRaw === "" ? NaN : Number(qtyRaw),
    });
    if (!line) return null;
    out.push(line);
  }
  return out.length ? out : null;
}

export async function POST(req: NextRequest) {
  try {
    // Admin gate: require authenticated user with users.is_admin === 1
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminCheck, error: adminError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("user_uuid", user.id)
      .single();

    if (adminError) {
      return NextResponse.json(
        { error: "Failed to verify admin privileges" },
        { status: 500 },
      );
    }

    if (!adminCheck || Number(adminCheck.is_admin) !== 1) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const formData = await req.formData();

    const clientName = getFormString(formData, "name", "clientName", "client_name");
    const email = getFormString(formData, "email", "emailAddress", "email_address");
    const address = getFormString(formData, "address");
    const phone = getFormString(formData, "phone", "phoneNumber", "phone_number");
    const dueDateRaw = getFormString(formData, "dueDate", "due_date");
    const termsRaw = getFormString(formData, "terms");
    const dueDate = dueDateRaw || formatDueDateOneMonthAhead();
    const terms = termsRaw || DEFAULT_INVOICE_TERMS;
    const notes = getFormString(formData, "notes");
    const invoiceNumber = getFormString(
      formData,
      "invoiceNumber",
      "invoice_number",
    ) || defaultInvoiceNumber();
    const invoiceDate =
      getFormString(formData, "invoiceDate", "invoice_date", "date") ||
      formatDefaultInvoiceDate();

    if (!clientName) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 },
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Missing required field: email" },
        { status: 400 },
      );
    }
    if (!address) {
      return NextResponse.json(
        { error: "Missing required field: address" },
        { status: 400 },
      );
    }
    if (!phone) {
      return NextResponse.json(
        { error: "Missing required field: phone" },
        { status: 400 },
      );
    }

    const lineItems = parseLineItemsFromForm(formData);
    if (!lineItems) {
      return NextResponse.json(
        {
          error:
            "Invalid or missing items. Use a JSON array in field \"items\", or indexed fields item_0_name, item_0_details, item_0_price, item_0_quantity (and items[i][*] variants).",
        },
        { status: 400 },
      );
    }
    if (lineItems.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required." },
        { status: 400 },
      );
    }

    const client = {
      name: clientName,
      email: email || "—",
      address: address || "—",
      phone: phone || "—",
    };

    const metaRows: [string, string][] = [
      ["Number", invoiceNumber],
      ["Date", invoiceDate],
      ["Terms", terms],
      ["Due", dueDate],
    ];

    const notesBlock =
      notes.trim() !== ""
        ? `Notes: ${notes}`
        : "Notes: —";

    const logoPath = path.join(process.cwd(), "app", "FBX_LOGO_DARK.png");
    if (!fs.existsSync(logoPath)) {
      return NextResponse.json(
        { error: "Logo asset not found (expected app/FBX_LOGO_DARK.png)" },
        { status: 500 },
      );
    }

    const billingName = envOrDefault("TO_NAME", DEFAULT_TO_NAME);
    const billingEmail = envOrDefault("TO_EMAIL", DEFAULT_TO_EMAIL);
    const billingAddress = envOrDefault("TO_ADDRESS", DEFAULT_TO_ADDRESS);
    const billingPhoneLine = billingPhoneLineFromEnv(
      envOrDefault("TO_PHONE", DEFAULT_TO_PHONE),
    );
    const taxRate = taxRateFromEnv();

    // PDF GENERATION — stream into memory; no temp file on disk.
    const colors = {
      text: "#040316",
      background: "#FFFFFF",
      primary: "#800017",
      secondary: "#1739a1",
      accent: "#ab99ad",
    };

    // Currency formatter
    const currency = (n: number) =>
      `$${(Math.round(n * 100) / 100).toFixed(2)}`;

  const pass = new PassThrough();
  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ size: "LETTER", margin: 30 });

  const pdfBufferPromise = new Promise<Buffer>((resolve, reject) => {
    pass.on("data", (chunk: Buffer | Uint8Array | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    pass.once("finish", () => resolve(Buffer.concat(chunks)));
    pass.once("error", reject);
    doc.once("error", reject);
  });

  doc.pipe(pass);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  const left = 45;
  const right = pageWidth - 45;
  const contentWidth = right - left;
  /** Inset for table / totals / balance amounts from the page edge (inside the blue header bar). */
  const tableRightPad = 20;
  const innerRight = right - tableRightPad;

  doc.rect(0, 0, pageWidth, pageHeight).fill(colors.background);

  // Top accent line
  doc.rect(0, 0, pageWidth, 10).fill(colors.secondary);

  // Header
  doc.fillColor(colors.text).font('Helvetica-Bold').fontSize(34).text('Invoice', left, 52);

  // Logo image
  const logoX = right - 145;
  const logoY = 36;
  doc.image(logoPath, logoX - 5, logoY - 2, {
    fit: [85, 85],
    align: 'center',
    valign: 'center',
  });

  doc.fillColor(colors.text).font('Helvetica-Bold').fontSize(16).text(billingName, right - 190, 126, {
    width: 190,
    align: 'right',
    lineBreak: false,
  });
  doc.fillColor(colors.primary).font('Helvetica').fontSize(9).text('THE ULTIMATE KICKSTARTER TO BECOMING A ROBOTICIST', right - 190, 146, {
    width: 190,
    align: 'right',
    lineBreak: false,
  });

  // From / For columns
  const sectionTop = 205;
  const colGap = 60;
  const colWidth = (contentWidth - colGap) / 2;

  doc.fillColor(colors.accent).font('Helvetica').fontSize(12).text('From', left, sectionTop);
  doc.fillColor(colors.text).font('Helvetica-Bold').fontSize(21).text(billingName, left, sectionTop + 20, {
    lineBreak: false,
  });
  doc.fillColor(colors.text).font('Helvetica').fontSize(11).text(billingEmail, left, sectionTop + 52, {
    lineBreak: false,
  });
  doc.text(billingAddress, left, sectionTop + 69, { lineBreak: false });
  doc.text(billingPhoneLine, left, sectionTop + 86, { lineBreak: false });

  const forX = left + colWidth + colGap;
  doc.fillColor(colors.accent).font('Helvetica').fontSize(12).text('For', forX, sectionTop);
  doc.fillColor(colors.text).font('Helvetica-Bold').fontSize(21).text(client.name, forX, sectionTop + 20, { lineBreak: false });
  doc.fillColor(colors.text).font('Helvetica').fontSize(11).text(client.email, forX, sectionTop + 52, { lineBreak: false });
  doc.text(client.address, forX, sectionTop + 69, { lineBreak: false });
  doc.text(client.phone, forX, sectionTop + 86, { lineBreak: false });

  // Divider
  const dividerY = sectionTop + 130;
  doc.lineWidth(1).strokeColor('#D8D8D8').moveTo(left, dividerY).lineTo(right, dividerY).stroke();

  // Meta info
  const metaTop = dividerY + 24;
  const keyX = left;
  const valX = left + 68;
  metaRows.forEach((row, i) => {
    const y = metaTop + i * 20;
    doc.fillColor(colors.accent).font('Helvetica').fontSize(10).text(row[0], keyX, y);
    doc.fillColor(colors.text).font('Helvetica').fontSize(10).text(row[1], valX, y);
  });

  // Items table — wide right-aligned numeric cells, inset from page right
  const priceColW = 56;
  const qtyColW = 50;
  const amtColW = 78;
  const numColGap = 22;
  const amtX = innerRight - amtColW;
  const qtyX = amtX - numColGap - qtyColW;
  const priceX = qtyX - numColGap - priceColW;
  const descMaxWidth = Math.max(120, priceX - left - 28);

  const tableTop = metaTop + 104;
  doc.rect(left, tableTop, contentWidth, 30).fill(colors.secondary);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10);
  doc.text('Description', left + 12, tableTop + 10);
  doc.text('Price', priceX, tableTop + 10, {
    width: priceColW,
    align: 'right',
    lineBreak: false,
  });
  doc.text('Qty', qtyX, tableTop + 10, {
    width: qtyColW,
    align: 'right',
    lineBreak: false,
  });
  doc.text('Amount', amtX, tableTop + 10, {
    width: amtColW,
    align: 'right',
    lineBreak: false,
  });

  // Item row
  const firstRowTop = tableTop + 36;
  const rowHeight = 34;
  let runningY = firstRowTop;
  let subTotalAmount = 0;

  lineItems.forEach((it) => {
    const lineAmount = (it.price || 0) * (it.quantity || 0);
    subTotalAmount += lineAmount;

    // Description (name + description) — keep within columns left of Price
    doc.fillColor(colors.text).font('Helvetica').fontSize(10).text(it.name || '', left + 12, runningY, {
      width: descMaxWidth,
      lineBreak: false,
    });
    if (it.description) {
      doc.fillColor(colors.accent).font('Helvetica').fontSize(9).text(String(it.description), left + 12, runningY + 13, {
        width: descMaxWidth,
        lineBreak: false,
      });
    }

    // Numeric columns (Price, Qty, Amount) — same layout as header
    doc.fillColor(colors.text).font('Helvetica').fontSize(10).text(currency(it.price || 0), priceX, runningY + 2, {
      width: priceColW,
      align: 'right',
      lineBreak: false,
    });
    doc.text(String(it.quantity || 0), qtyX, runningY + 2, {
      width: qtyColW,
      align: 'right',
      lineBreak: false,
    });
    doc.text(currency(lineAmount), amtX, runningY + 2, {
      width: amtColW,
      align: 'right',
      lineBreak: false,
    });

    runningY += rowHeight;
  });

  const afterItemsY = runningY;
  doc.lineWidth(1).strokeColor(colors.secondary).moveTo(left, afterItemsY).lineTo(right, afterItemsY).stroke();

  // Totals — label column and value column separated (no horizontal overlap)
  const totalsTop = afterItemsY + 22;
  const totalsRowHeight = 22;
  const totalsValueColW = 100;
  const totalsLabelColW = 220;
  const totalsLabelValueGap = 36;
  const totalsValueX = innerRight - totalsValueColW;
  const totalsLabelX = totalsValueX - totalsLabelValueGap - totalsLabelColW;
  const taxAmount = subTotalAmount * taxRate;
  const grandTotal = subTotalAmount + taxAmount;
  const totals = [
    ['Subtotal', currency(subTotalAmount)],
    [`Tax (${formatTaxPercentForLabel(taxRate)}%)`, `+${currency(taxAmount)}`],
    ['Total', currency(grandTotal)],
  ];

  totals.forEach((row, i) => {
    const y = totalsTop + i * totalsRowHeight;
    doc.fillColor(colors.text).font('Helvetica').fontSize(10);
    doc.text(row[0], totalsLabelX, y, {
      width: totalsLabelColW,
      align: 'right',
      lineBreak: false,
    });
    doc.text(row[1], totalsValueX, y, {
      width: totalsValueColW,
      align: 'right',
      lineBreak: false,
    });
  });

  // Balance due — same two-column idea; reserve vertical space if text ever wraps
  const dueY = totalsTop + totals.length * totalsRowHeight + 22;
  const dueValueColW = 110;
  const dueLabelColW = 240;
  const dueLabelValueGap = 28;
  const dueValueX = innerRight - dueValueColW;
  const dueLabelX = dueValueX - dueLabelValueGap - dueLabelColW;
  const dueGrandStr = currency(grandTotal);

  doc.fillColor(colors.text).font('Helvetica-Bold').fontSize(25);
  const dueOptsLabel = {
    width: dueLabelColW,
    align: "right" as const,
    lineBreak: false,
  };
  const dueOptsValue = {
    width: dueValueColW,
    align: "right" as const,
    lineBreak: false,
  };
  const docMeasure = doc as unknown as {
    heightOfString?: (text: string, options: object) => number;
  };
  let dueBlockH = 40;
  if (typeof docMeasure.heightOfString === "function") {
    dueBlockH =
      Math.max(
        docMeasure.heightOfString("Balance Due", dueOptsLabel),
        docMeasure.heightOfString(dueGrandStr, dueOptsValue),
      ) + 18;
  } else {
    dueBlockH = Math.ceil(25 * 1.35) + 20;
  }

  doc.text("Balance Due", dueLabelX, dueY, dueOptsLabel);
  doc.text(dueGrandStr, dueValueX, dueY, dueOptsValue);

  const finalDividerY = dueY + dueBlockH;
  doc.lineWidth(1).strokeColor(colors.secondary).moveTo(left, finalDividerY).lineTo(right, finalDividerY).stroke();

  doc.fillColor('#666666').font('Helvetica').fontSize(9).text(notesBlock, left, finalDividerY + 24, {
    width: contentWidth,
  });

  doc.end();

    const pdfBuffer = await pdfBufferPromise;

    return new NextResponse(new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" }), {
      headers: {
        "Content-Disposition": 'attachment; filename="invoice.pdf"',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

