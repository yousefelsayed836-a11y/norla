import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const links = await prisma.navLink.findMany({ orderBy: { position: "asc" } });
  return NextResponse.json({ links });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { label, href } = await req.json();
  const maxPos = await prisma.navLink.aggregate({ _max: { position: true } });
  const link = await prisma.navLink.create({
    data: { label, href, position: (maxPos._max.position ?? -1) + 1 },
  });
  return NextResponse.json({ link });
}
