import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { resource, items } = await req.json() as {
    resource: "category" | "product";
    items: { id: string; position: number }[];
  };

  if (!Array.isArray(items)) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  if (resource === "category") {
    await Promise.all(
      items.map((item) =>
        prisma.category.update({ where: { id: item.id }, data: { position: item.position } })
      )
    );
  } else if (resource === "product") {
    await Promise.all(
      items.map((item) =>
        prisma.product.update({ where: { id: item.id }, data: { position: item.position } })
      )
    );
  } else {
    return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
  }

  revalidateStorefront();
  return NextResponse.json({ ok: true });
}
