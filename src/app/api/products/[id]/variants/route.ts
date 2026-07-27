import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const variant = await prisma.productVariant.create({
    data: {
      productId: id,
      label: body.label,
      color: body.color || null,
      colorHex: body.colorHex || null,
      size: body.size || null,
      imageUrl: body.imageUrl || null,
      price: body.price || null,
      regularPrice: body.regularPrice || null,
      stockStatus: body.stockStatus || "instock",
    },
  });
  return NextResponse.json({ variant });
}
