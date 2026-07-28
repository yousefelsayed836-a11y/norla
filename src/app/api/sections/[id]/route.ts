import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const section = await prisma.homeSection.findUnique({
    where: { id },
    include: {
      products: { include: { product: true }, orderBy: { position: "asc" } },
    },
  });
  if (!section) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ section });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { title, slug, productIds, position } = await req.json();

  await prisma.homeSectionProduct.deleteMany({ where: { sectionId: id } });

  const section = await prisma.homeSection.update({
    where: { id },
    data: {
      title,
      slug,
      ...(position !== undefined ? { position } : {}),
      products: {
        create: (productIds as string[]).map((productId, i) => ({ productId, position: i })),
      },
    },
    include: { products: true },
  });
  revalidateStorefront();
  return NextResponse.json({ section });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.homeSection.delete({ where: { id } });
  revalidateStorefront();
  return NextResponse.json({ ok: true });
}
