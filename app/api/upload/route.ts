import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join, basename } from "path";
import { getSession } from "@/lib/server-session";
import { checkRateLimit } from "@/lib/ratelimit";

// ─── Security Configuration ───────────────────────────────────────────────────

/** Maximum upload size: 10 MB */
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Strict MIME-type allowlist.
 * SVG is intentionally excluded — it can contain inline <script> tags and
 * is served directly from /uploads/, making it an XSS vector.
 */
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "application/pdf",
]);

/** Allowed file extensions (double-checked against MIME type). */
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".pdf"]);

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication — no anonymous uploads
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate limiting — max 20 uploads per minute per IP
    const rl = await checkRateLimit(request, "upload", { limit: 20, windowMs: 60_000 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many uploads. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    // 3. Parse multipart form
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 4. File size limit
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${formatBytes(MAX_BYTES)}.` },
        { status: 413 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file not allowed" }, { status: 400 });
    }

    // 5. MIME type allowlist
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `File type '${file.type}' is not allowed. Allowed types: images (JPEG, PNG, GIF, WebP, AVIF) and PDF.`,
        },
        { status: 415 }
      );
    }

    // 6. Extension check — prevent MIME-spoofing (e.g. a .html renamed to .jpg)
    const originalName = basename(file.name);
    const extMatch = originalName.match(/\.[^.]+$/);
    const ext = extMatch ? extMatch[0].toLowerCase() : "";
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `File extension '${ext}' is not allowed.` },
        { status: 415 }
      );
    }

    // 7. Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Sanitise the original name and generate a unique, safe filename
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;
    const filepath = join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      fileName: file.name,
      fileSize: formatBytes(file.size),
      mimeType: file.type,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
