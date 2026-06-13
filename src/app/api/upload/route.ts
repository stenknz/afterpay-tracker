import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { writeFile, mkdir, access } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    console.error("Upload auth failure - session is null. Headers:", Object.fromEntries(req.headers.entries()));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = (formData.get("type") as string) || "store";
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop() || "png";
  const subdir = type === "avatar" ? "avatars" : type === "vendor" ? "vendors" : type === "site" ? "site" : type === "subscription" ? "subscriptions" : "stores";
  const prefix = subdir === "avatars" ? "avatar" : subdir === "vendors" ? "vendor" : subdir === "site" ? "site" : subdir === "subscriptions" ? "subscription" : "store";
  const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", subdir);
  try {
    await mkdir(dir, { recursive: true });
  } catch (e) {
    console.error("Failed to create upload directory:", dir, e);
    return NextResponse.json({ error: "Server error creating directory" }, { status: 500 });
  }

  const bytes = await file.arrayBuffer();
  const fullPath = path.join(dir, filename);
  try {
    await writeFile(fullPath, Buffer.from(bytes));
    await access(fullPath);
  } catch (e) {
    console.error("Failed to write upload file:", fullPath, e);
    return NextResponse.json({ error: "Server error writing file" }, { status: 500 });
  }

  return NextResponse.json({ path: `/api/uploads/${subdir}/${filename}` });
}
