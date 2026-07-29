import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reviews = await prisma.review.findMany({
    include: { product: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  const { productId, authorName, rating, comment } = await req.json();

  if (!productId || !authorName?.trim() || !comment?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const review = await prisma.review.create({
    data: {
      productId,
      authorName: authorName.trim().slice(0, 100),
      rating: ratingNum,
      comment: comment.trim().slice(0, 2000),
      approved: false,
    },
  });
  return NextResponse.json({ review });
}
