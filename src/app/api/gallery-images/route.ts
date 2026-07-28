import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate";

export async function GET() {
  const images = await prisma.galleryImage.findMany({ orderBy: { position: "asc" } });
  return NextResponse.json({ images });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = await req.json();
  const maxPos = await prisma.galleryImage.aggregate({ _max: { position: true } });
  const image = await prisma.galleryImage.create({
    data: { url, position: (maxPos._max.position ?? -1) + 1 },
  });
  revalidateStorefront();
  return NextResponse.json({ image });
}
