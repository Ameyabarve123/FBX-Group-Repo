import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Supabase Storage bucket for enterprise-custom logos */
const BUCKET = "enterprise-logos";

/** 15 MiB — enforced before upload */
const MAX_BYTES = 15 * 1024 * 1024;

/** Allowed upload MIME types (must match bucket policy expectations) */
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

/** `users.role` value for Enterprise accounts (see profile-view / admin dashboard). */
const ROLE_ENTERPRISE = 3;

/** Single object name per enterprise — always overwritten on upload (see POST handler). */
const LOGO_OBJECT_NAME = "logo";

function readUint16BE(buf: Uint8Array, offset: number): number {
  return (buf[offset] << 8) | buf[offset + 1];
}

function readUint16LE(buf: Uint8Array, offset: number): number {
  return buf[offset] | (buf[offset + 1] << 8);
}

function readUint24LE(buf: Uint8Array, offset: number): number {
  return buf[offset] | (buf[offset + 1] << 8) | (buf[offset + 2] << 16);
}

function readUint32BE(buf: Uint8Array, offset: number): number {
  return (
    (buf[offset] << 24) |
    (buf[offset + 1] << 16) |
    (buf[offset + 2] << 8) |
    buf[offset + 3]
  ) >>> 0;
}

function readUint32LE(buf: Uint8Array, offset: number): number {
  return (
    buf[offset] |
    (buf[offset + 1] << 8) |
    (buf[offset + 2] << 16) |
    (buf[offset + 3] << 24)
  ) >>> 0;
}

function parseSvgNumeric(raw: string): number | null {
  const m = raw.trim().match(/^([0-9]*\.?[0-9]+)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function extractImageDimensions(
  buf: Uint8Array,
  mime: string
): { width: number; height: number } | null {
  if (mime === "image/png") {
    if (buf.length < 24) return null;
    const width = readUint32BE(buf, 16);
    const height = readUint32BE(buf, 20);
    return width > 0 && height > 0 ? { width, height } : null;
  }

  if (mime === "image/gif") {
    if (buf.length < 10) return null;
    const width = readUint16LE(buf, 6);
    const height = readUint16LE(buf, 8);
    return width > 0 && height > 0 ? { width, height } : null;
  }

  if (mime === "image/jpeg") {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) {
        i += 1;
        continue;
      }
      const marker = buf[i + 1];
      i += 2;
      if (marker === 0xd8 || marker === 0xd9) continue;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (i + 2 > buf.length) return null;
      const length = readUint16BE(buf, i);
      if (length < 2 || i + length > buf.length) return null;
      const isSof =
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf);
      if (isSof) {
        if (i + 7 >= buf.length) return null;
        const height = readUint16BE(buf, i + 3);
        const width = readUint16BE(buf, i + 5);
        return width > 0 && height > 0 ? { width, height } : null;
      }
      i += length;
    }
    return null;
  }

  if (mime === "image/webp") {
    if (buf.length < 30) return null;
    const chunk = String.fromCharCode(buf[12], buf[13], buf[14], buf[15]);
    if (chunk === "VP8X") {
      if (buf.length < 30) return null;
      const width = 1 + readUint24LE(buf, 24);
      const height = 1 + readUint24LE(buf, 27);
      return width > 0 && height > 0 ? { width, height } : null;
    }
    if (chunk === "VP8 ") {
      if (buf.length < 30) return null;
      const start = 20;
      if (buf[start + 3] !== 0x9d || buf[start + 4] !== 0x01 || buf[start + 5] !== 0x2a) {
        return null;
      }
      const width = readUint16LE(buf, start + 6) & 0x3fff;
      const height = readUint16LE(buf, start + 8) & 0x3fff;
      return width > 0 && height > 0 ? { width, height } : null;
    }
    if (chunk === "VP8L") {
      if (buf.length < 25) return null;
      const b0 = buf[21];
      const b1 = buf[22];
      const b2 = buf[23];
      const b3 = buf[24];
      const width = 1 + (((b1 & 0x3f) << 8) | b0);
      const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
      return width > 0 && height > 0 ? { width, height } : null;
    }
    return null;
  }

  if (mime === "image/svg+xml") {
    const text = new TextDecoder("utf-8", { fatal: false }).decode(
      buf.slice(0, Math.min(buf.length, 128 * 1024))
    );
    const svgTag = text.match(/<svg\b[^>]*>/i)?.[0];
    if (!svgTag) return null;

    const viewBoxMatch = svgTag.match(/\bviewBox\s*=\s*["']([^"']+)["']/i)?.[1];
    if (viewBoxMatch) {
      const parts = viewBoxMatch
        .trim()
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => Number.isFinite(n));
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        return { width: parts[2], height: parts[3] };
      }
    }

    const widthRaw = svgTag.match(/\bwidth\s*=\s*["']([^"']+)["']/i)?.[1];
    const heightRaw = svgTag.match(/\bheight\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!widthRaw || !heightRaw) return null;
    const width = parseSvgNumeric(widthRaw);
    const height = parseSvgNumeric(heightRaw);
    return width && height ? { width, height } : null;
  }

  return null;
}

function binaryMatchesClaimedImage(buf: Uint8Array, mime: string): boolean {
  if (mime === "image/svg+xml") {
    const slice = buf.slice(0, Math.min(buf.length, 16384));
    let text = new TextDecoder("utf-8", { fatal: false }).decode(slice);
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    const head = text.trimStart();
    return /<svg[\s>/]/i.test(head);
  }

  if (buf.length < 12) return false;

  switch (mime) {
    case "image/jpeg":
      return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    case "image/png":
      return (
        buf[0] === 0x89 &&
        buf[1] === 0x50 &&
        buf[2] === 0x4e &&
        buf[3] === 0x47
      );
    case "image/gif":
      return (
        buf[0] === 0x47 &&
        buf[1] === 0x49 &&
        buf[2] === 0x46 &&
        buf[3] === 0x38
      );
    case "image/webp":
      return (
        buf[0] === 0x52 &&
        buf[1] === 0x49 &&
        buf[2] === 0x46 &&
        buf[3] === 0x46 &&
        buf[8] === 0x57 &&
        buf[9] === 0x45 &&
        buf[10] === 0x42 &&
        buf[11] === 0x50
      );
    default:
      return false;
  }
}

/**
 * POST multipart/form-data with field `file` (single image).
 * Caller must be an authenticated Enterprise user (`users.role === 3`).
 */
export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("user_uuid", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      { error: "Unable to verify account role" },
      { status: 500 }
    );
  }

  const role = profile?.role;
  if (role == null || Number(role) !== ROLE_ENTERPRISE) {
    return NextResponse.json(
      { error: "Forbidden: enterprise account required" },
      { status: 403 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid or unreadable multipart body" },
      { status: 400 }
    );
  }

  const entry = formData.get("file");
  if (!entry || !(entry instanceof File)) {
    return NextResponse.json(
      { error: 'Expected a file in the "file" field' },
      { status: 400 }
    );
  }

  if (entry.size === 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }

  if (entry.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File exceeds the maximum size of 15 MB" },
      { status: 413 }
    );
  }

  const mime = entry.type.trim().toLowerCase();
  if (!mime || !ALLOWED_MIME.has(mime)) {
    return NextResponse.json(
      {
        error:
          "Unsupported media type; allowed types: JPEG, PNG, GIF, WebP, SVG",
      },
      { status: 415 }
    );
  }

  const buf = new Uint8Array(await entry.arrayBuffer());

  if (!binaryMatchesClaimedImage(buf, mime)) {
    return NextResponse.json(
      {
        error:
          "File content is not a valid image for the declared type",
      },
      { status: 415 }
    );
  }

  const dimensions = extractImageDimensions(buf, mime);
  if (!dimensions) {
    return NextResponse.json(
      { error: "Unable to determine image dimensions" },
      { status: 415 }
    );
  }

  if (dimensions.width !== dimensions.height) {
    return NextResponse.json(
      { error: "Logo image must be square (equal width and height)" },
      { status: 400 }
    );
  }

  const folder = user.id;
  const objectPath = `${folder}/${LOGO_OBJECT_NAME}`;

  const { data, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, buf, {
      contentType: mime,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: uploadError.message },
      { status: 500 }
    );
  }

  // Drop any other objects in this folder (legacy paths); canonical key is always `logo`.
  const { data: afterList } = await supabase.storage.from(BUCKET).list(folder);
  if (afterList?.length) {
    const toRemove = afterList
      .filter((f) => f.name && f.name !== LOGO_OBJECT_NAME)
      .map((f) => `${folder}/${f.name}`);
    if (toRemove.length) {
      await supabase.storage.from(BUCKET).remove(toRemove);
    }
  }

  return NextResponse.json({
    path: data.path,
    bucket: BUCKET,
  });
}
