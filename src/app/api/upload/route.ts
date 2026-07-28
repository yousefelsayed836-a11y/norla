import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const MAX_SIZE = 15 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 15MB)" }, { status: 400 });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let outputBuffer: Buffer;
  try {
    outputBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return NextResponse.json(
      { error: "Couldn't read this image. Try a JPG, PNG, or WebP photo." },
      { status: 400 }
    );
  }

  const filename = `${crypto.randomUUID()}.webp`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), outputBuffer);

  return NextResponse.json({ url: `/api/files/${filename}` });
}
