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
    const dueDate = getFormString(formData, "dueDate", "due_date");
    const terms = getFormString(formData, "terms");
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

    const lineItems = parseLineItemsFromForm(formData);
    if (!lineItems) {
      return NextResponse.json(
        {
          error:
            "Invalid or missing line items. Use a JSON array in field \"items\", or indexed fields item_0_name, item_0_details, item_0_price, item_0_quantity (and items[i][*] variants).",
        },
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
      ["Terms", terms || "—"],
      ["Due", dueDate || "—"],
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

    // PDF GENERATION — stream into memory; no temp file on disk.
    const colors = {
      text: "#040316",
      background: "#FFFFFF",
      primary: "#800017",
      secondary: "#1739a1",
      accent: "#ab99ad",
    };

  // Tax
  const taxRate = 0.07;
  // Currency formatter
  const currency = (n: number) =>`$${(Math.round(n * 100) / 100).toFixed(2)}`;

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

  doc.fillColor(colors.text).font('Helvetica-Bold').fontSize(16).text('FBX Technologies', right - 190, 126, {
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
  doc.fillColor(colors.text).font('Helvetica-Bold').fontSize(21).text('FBX Technologies', left, sectionTop + 20);
  doc.fillColor(colors.text).font('Helvetica').fontSize(11).text('your@email.com', left, sectionTop + 52);
  doc.text('Your address', left, sectionTop + 69);
  doc.text('P: (123) 456 7890', left, sectionTop + 86);

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

  // Items table header
  const tableTop = metaTop + 104;
  doc.rect(left, tableTop, contentWidth, 30).fill(colors.secondary);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10);
  doc.text('Description', left + 12, tableTop + 10);
  doc.text('Price', right - 120, tableTop + 10, { width: 36, align: 'right' });
  doc.text('Qty', right - 82, tableTop + 10, { width: 30, align: 'right' });
  doc.text('Amount', right - 72, tableTop + 10, { width: 60, align: 'right' });

  // Item row
  const firstRowTop = tableTop + 36;
  const rowHeight = 34;
  let runningY = firstRowTop;
  let subTotalAmount = 0;

  lineItems.forEach((it) => {
    const lineAmount = (it.price || 0) * (it.quantity || 0);
    subTotalAmount += lineAmount;

    // Description (name + description)
    doc.fillColor(colors.text).font('Helvetica').fontSize(10).text(it.name || '', left + 12, runningY);
    if (it.description) {
      doc.fillColor(colors.accent).font('Helvetica').fontSize(9).text(String(it.description), left + 12, runningY + 13, {
        width: contentWidth - 240,
        lineBreak: false,
      });
    }

    // Numeric columns (Price, Qty, Amount)
    doc.fillColor(colors.text).font('Helvetica').fontSize(10).text(currency(it.price || 0), right - 120, runningY + 2, {
      width: 36,
      align: 'right',
      lineBreak: false,
    });
    doc.text(String(it.quantity || 0), right - 82, runningY + 2, {
      width: 30,
      align: 'right',
      lineBreak: false,
    });
    doc.text(currency(lineAmount), right - 72, runningY + 2, {
      width: 60,
      align: 'right',
      lineBreak: false,
    });

    runningY += rowHeight;
  });

  const afterItemsY = runningY;
  doc.lineWidth(1).strokeColor(colors.secondary).moveTo(left, afterItemsY).lineTo(right, afterItemsY).stroke();

  // Totals
  const totalsTop = afterItemsY + 20;
  const totalsLabelX = right - 150;
  const totalsValueX = right - 10;
  const taxAmount = subTotalAmount * taxRate;
  const grandTotal = subTotalAmount + taxAmount;
  const totals = [
    ['Subtotal', currency(subTotalAmount)],
    [`Tax (${(taxRate * 100).toFixed(0)}%)`, `+${currency(taxAmount)}`],
    ['Total', currency(grandTotal)],
  ];

  totals.forEach((row, i) => {
    const y = totalsTop + i * 18;
    doc.fillColor(colors.text).font('Helvetica').fontSize(10).text(row[0], totalsLabelX, y, { width: 90, align: 'right' });
    doc.text(row[1], totalsValueX - 70, y, { width: 70, align: 'right' });
  });

  const dueY = totalsTop + 58;
  doc.fillColor(colors.text).font('Helvetica-Bold').fontSize(25).text('Balance Due', right - 285, dueY, {
    width: 180,
    align: 'right',
    lineBreak: false,
  });
  doc.text(currency(grandTotal), right - 95, dueY, { width: 95, align: 'right', lineBreak: false });

  const finalDividerY = dueY + 36;
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

