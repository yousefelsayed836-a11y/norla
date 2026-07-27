import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { position: "asc" } });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, slug, imageUrl, position } = await req.json();
  const maxPos = await prisma.category.aggregate({ _max: { position: true } });
  const category = await prisma.category.create({
    data: {
      name,
      slug,
      imageUrl: imageUrl || null,
      position: position ?? (maxPos._max.position ?? -1) + 1,
    },
  });
  return NextResponse.json({ category });
}
