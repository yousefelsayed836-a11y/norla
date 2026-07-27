import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const sections = await prisma.homeSection.findMany({
    orderBy: { position: "asc" },
    include: { products: { include: { product: true }, orderBy: { position: "asc" } } },
  });
  return NextResponse.json({ sections });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, slug, productIds } = await req.json();
  const maxPos = await prisma.homeSection.aggregate({ _max: { position: true } });

  const section = await prisma.homeSection.create({
    data: {
      title,
      slug,
      position: (maxPos._max.position ?? -1) + 1,
      products: {
        create: (productIds as string[]).map((productId, i) => ({ productId, position: i })),
      },
    },
    include: { products: true },
  });
  return NextResponse.json({ section });
}
