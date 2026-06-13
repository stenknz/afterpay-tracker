import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const segs = (await params).path;
  const filePath = path.resolve(UPLOAD_DIR, ...segs);
  if (!filePath.startsWith(UPLOAD_DIR + path.sep)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    webp: "image/webp", svg: "image/svg+xml", gif: "image/gif",
  };

  try {
    const data = await readFile(filePath);
    return new NextResponse(data, {
      headers: { "Content-Type": mime[ext] || "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
