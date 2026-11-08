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
  const discountDetails = await prisma.$queryRaw<{ discountProductIds: string; discountGiftMode: string; discountGiftProductIds: string }[]>`
    SELECT "discountProductIds", "discountGiftMode", "discountGiftProductIds",
      "discountGiftDiscountType", "discountGiftDiscountValue"
    FROM "SiteSetting" WHERE id = 'singleton' LIMIT 1
  `.then((rows) => rows[0] ?? null);
  return NextResponse.json({ settings: { ...settings, ...discountDetails } });
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
    checkoutPaymentNote,
    checkoutPaymentNoteAr,
    whatsappMessageTemplate,
    checkoutTransferPhone,
    checkoutAccountName,
    checkoutDeliveryNote,
  } = await req.json();
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
    checkoutPaymentNote: checkoutPaymentNote || "",
    checkoutPaymentNoteAr: checkoutPaymentNoteAr || "",
    whatsappMessageTemplate: whatsappMessageTemplate || "",
    checkoutTransferPhone: checkoutTransferPhone || "01027096110",
    checkoutAccountName: checkoutAccountName || "",
    checkoutDeliveryNote: checkoutDeliveryNote ?? "",
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await (prisma.siteSetting.upsert as any)({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  revalidateStorefront();
  return NextResponse.json({ settings });
}

