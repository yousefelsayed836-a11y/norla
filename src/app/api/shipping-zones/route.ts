import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const zones = await prisma.shippingZone.findMany({
    orderBy: { position: "asc" },
    include: { cities: { orderBy: { name: "asc" } } },
  });
  return NextResponse.json({ zones });
}
