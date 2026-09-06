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
    depositPercent,
    freeShippingEnabled,
    freeShippingThreshold,
    checkoutPaymentNote: checkoutPaymentNote || "",
    checkoutPaymentNoteAr: checkoutPaymentNoteAr || "",
    whatsappMessageTemplate: whatsappMessageTemplate || "",
    checkoutTransferPhone: checkoutTransferPhone || "01027096110",
    checkoutAccountName: checkoutAccountName || "",
    checkoutDeliveryNote: checkoutDeliveryNote ?? "مدة تنفيذ الاوردر من 4 ل 7 ايام",
  };
  const settings = await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  revalidateStorefront();
  return NextResponse.json({ settings });
}
