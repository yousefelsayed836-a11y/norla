import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const EXTRA = [
  { governorate: "Cairo", name: "أطراف القاهرة" },
  { governorate: "Giza", name: "أطراف الجيزة" },
];

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const added: string[] = [];

  for (const { governorate, name } of EXTRA) {
    const zone = await prisma.shippingZone.findFirst({ where: { governorate } });
    if (!zone) continue;
    const exists = await prisma.shippingCity.findFirst({ where: { zoneId: zone.id, name } });
    if (!exists) {
      await prisma.shippingCity.create({ data: { zoneId: zone.id, name, nameAr: name } });
      added.push(name);
    }
  }

  return NextResponse.json({ ok: true, added });
}
