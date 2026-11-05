import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate";

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
    announcementTextAr,
    instagramUrl,
    tiktokUrl,
    whatsappUrl,
    facebookUrl,
    contactPhone,
    contactEmail,
    contactAddress,
    contactAddressAr,
    contactHours,
    contactHoursAr,
    returnPolicyText,
    careInstructionsText,
    careInstructionsTextAr,
    shippingFee,
    depositPercent,
    freeShippingEnabled,
    freeShippingThreshold,
    discountEnabled,
    discountType,
    discountValue,
    discountBuyQuantity,
    discountGetQuantity,
  } = await req.json();
  const normalizedDiscountType = ["none", "percent", "fixed", "buy_get"].includes(discountType)
    ? discountType
    : "none";
  const data = {
    announcementText,
    announcementTextAr: announcementTextAr || null,
    instagramUrl,
    tiktokUrl,
    whatsappUrl,
    facebookUrl,
    contactPhone,
    contactEmail,
    contactAddress,
    contactAddressAr: contactAddressAr || null,
    contactHours,
    contactHoursAr: contactHoursAr || null,
    returnPolicyText,
    careInstructionsText,
    careInstructionsTextAr: careInstructionsTextAr || null,
    shippingFee,
    depositPercent: Math.min(100, Math.max(0, Math.floor(Number(depositPercent) || 0))),
    freeShippingEnabled,
    freeShippingThreshold,
    discountEnabled: !!discountEnabled,
    discountType: normalizedDiscountType,
    discountValue: Math.min(normalizedDiscountType === "percent" ? 100 : 99_999_999.99, Math.max(0, Number(discountValue) || 0)),
    discountBuyQuantity: Math.min(1_000_000, Math.max(1, Math.floor(Number(discountBuyQuantity) || 1))),
    discountGetQuantity: Math.min(1_000_000, Math.max(1, Math.floor(Number(discountGetQuantity) || 1))),
  };
  const settings = await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  revalidateStorefront();
  return NextResponse.json({ settings });
}
