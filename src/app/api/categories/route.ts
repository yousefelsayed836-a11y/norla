import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { position: "asc" } });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, slug, imageUrl, position, productIds } = await req.json();
  const maxPos = await prisma.category.aggregate({ _max: { position: true } });
  const category = await prisma.category.create({
    data: {
      name,
      slug,
      imageUrl: imageUrl || null,
      position: position ?? (maxPos._max.position ?? -1) + 1,
    },
  });

  if (Array.isArray(productIds) && productIds.length > 0) {
    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { categoryId: category.id },
    });
  }

  revalidateStorefront();
  return NextResponse.json({ category });
}
