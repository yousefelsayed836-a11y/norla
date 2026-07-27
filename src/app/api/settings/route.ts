import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const settings = await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    announcementText,
    instagramUrl,
    tiktokUrl,
    whatsappUrl,
    returnPolicyText,
    shippingFee,
    depositPercent,
    freeShippingEnabled,
    freeShippingThreshold,
  } = await req.json();
  const data = {
    announcementText,
    instagramUrl,
    tiktokUrl,
    whatsappUrl,
    returnPolicyText,
    shippingFee,
    depositPercent,
    freeShippingEnabled,
    freeShippingThreshold,
  };
  const settings = await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  return NextResponse.json({ settings });
}
