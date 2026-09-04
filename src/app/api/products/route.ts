import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { uniqueProductSlug } from "@/lib/unique-slug";
import { revalidateStorefront } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  const limit = Number(req.nextUrl.searchParams.get("limit")) || undefined;

  const products = await prisma.product.findMany({
    where: q
      ? { title: { contains: q, mode: "insensitive" } }
      : undefined,
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: true,
      variants: { select: { id: true, label: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const slug = await uniqueProductSlug(body.slug);
  const product = await prisma.product.create({
    data: {
      title: body.title,
      titleAr: body.titleAr || null,
      slug,
      description: body.description || "",
      descriptionAr: body.descriptionAr || null,
      shortDescription: body.shortDescription || "",
      shortDescriptionAr: body.shortDescriptionAr || null,
      careInstructions: body.careInstructions || "",
      rating: body.rating ?? 5,
      reviewCount: body.reviewCount ?? 0,
      visible: body.visible ?? true,
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
  revalidateStorefront();
  return NextResponse.json({ product });
}
