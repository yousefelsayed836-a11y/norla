import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { getUploadDirectories } from "@/lib/upload-storage";

export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (filename.includes("/") || filename.includes("..")) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  let data: Buffer | null = null;
  for (const directory of getUploadDirectories()) {
    try {
      data = await fs.readFile(path.join(directory, filename));
      break;
    } catch {
      // Check the previous in-app location while existing uploads are migrated.
    }
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
