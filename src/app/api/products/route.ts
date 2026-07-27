import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { images: true, category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      title: body.title,
      slug: body.slug,
      description: body.description || "",
      shortDescription: body.shortDescription || "",
      careInstructions: body.careInstructions || "",
      rating: body.rating ?? 5,
      reviewCount: body.reviewCount ?? 0,
      price: body.price,
      regularPrice: body.regularPrice || null,
      sku: body.sku || null,
      stockStatus: body.stockStatus || "instock",
      stockQty: body.stockQty ?? null,
      categoryId: body.categoryId || null,
      images: body.images
        ? { create: body.images.map((url: string, i: number) => ({ url, position: i })) }
        : undefined,
    },
    include: { images: true, category: true },
  });
  return NextResponse.json({ product });
}
