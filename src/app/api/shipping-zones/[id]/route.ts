import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const zone = await prisma.shippingZone.findUnique({
    where: { id },
    include: { cities: { orderBy: { name: "asc" } } },
  });
  if (!zone) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ zone });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { fee, active, cityNames } = await req.json();

  const zone = await prisma.shippingZone.update({
    where: { id },
    data: { fee, active },
  });

  if (Array.isArray(cityNames)) {
    await prisma.shippingCity.deleteMany({ where: { zoneId: id } });
    const cleaned = cityNames.map((n: string) => n.trim()).filter(Boolean);
    if (cleaned.length > 0) {
      await prisma.shippingCity.createMany({
        data: cleaned.map((name: string) => ({ zoneId: id, name })),
      });
    }
  }

  return NextResponse.json({ zone });
}
