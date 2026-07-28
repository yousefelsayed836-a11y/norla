import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids } = (await req.json()) as { ids: string[] };
  await Promise.all(
    ids.map((id, i) => prisma.galleryImage.update({ where: { id }, data: { position: i } }))
  );
  revalidateStorefront();
  return NextResponse.json({ ok: true });
}
