import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Production: use Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`products/${Date.now()}-${file.name}`, file, {
      access: "public",
    });
    return NextResponse.json({ url: blob.url });
  }

  // Development: save locally
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${Date.now()}-${safeName}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);
  return NextResponse.json({ url: `/uploads/${fileName}` });
}
