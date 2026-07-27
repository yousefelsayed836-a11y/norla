import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, category: true, variants: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (Array.isArray(body.images)) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      title: body.title,
      slug: body.slug,
      description: body.description,
      shortDescription: body.shortDescription,
      careInstructions: body.careInstructions,
      rating: body.rating,
      reviewCount: body.reviewCount,
      visible: body.visible,
      price: body.price,
      regularPrice: body.regularPrice || null,
      sku: body.sku || null,
      stockStatus: body.stockStatus,
      stockQty: body.stockQty ?? null,
      status: body.status,
      categoryId: body.categoryId || null,
      images: Array.isArray(body.images)
        ? { create: body.images.map((url: string, i: number) => ({ url, position: i })) }
        : undefined,
    },
    include: { images: true, category: true },
  });
  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
