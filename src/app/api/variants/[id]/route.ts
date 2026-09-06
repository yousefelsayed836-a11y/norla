import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variant = await (prisma.productVariant.update as any)({
    where: { id },
    data: {
      label: body.label,
      color: body.color || null,
      colorHex: body.colorHex || null,
      size: body.size || null,
      imageUrl: body.imageUrl || null,
      position: body.position ?? 0,
      price: body.price || null,
      regularPrice: body.regularPrice || null,
      stockStatus: body.stockStatus,
      stockQty: body.stockQty ?? null,
    },
  });
  revalidateStorefront();
  return NextResponse.json({ variant });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.productVariant.delete({ where: { id } });
  revalidateStorefront();
  return NextResponse.json({ ok: true });
}
