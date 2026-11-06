import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateStorefront } from "@/lib/revalidate";

const discountSettingsSchema = z.object({
  enabled: z.boolean(),
  type: z.enum(["none", "percent", "fixed", "buy_get"]),
  value: z.number().finite().min(0).max(99_999_999.99),
  buyQuantity: z.number().int().min(1).max(1_000_000),
  getQuantity: z.number().int().min(1).max(1_000_000),
  productIds: z.array(z.string().min(1)).max(500),
  giftMode: z.enum(["same_product", "any_product", "specific_products"]),
  giftProductIds: z.array(z.string().min(1)).max(500),
});

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = discountSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid discount settings" }, { status: 400 });
  }

  const { enabled, type, value, buyQuantity, getQuantity, productIds, giftMode, giftProductIds } = parsed.data;
  if (type === "percent" && value > 100) {
    return NextResponse.json({ error: "Percentage discount cannot exceed 100%" }, { status: 400 });
  }

  if ((productIds.length || giftProductIds.length) &&
      await prisma.product.count({ where: { id: { in: [...new Set([...productIds, ...giftProductIds])] } } }) !== new Set([...productIds, ...giftProductIds]).size) {
    return NextResponse.json({ error: "One or more selected products do not exist" }, { status: 400 });
  }
  if (type === "buy_get" && giftMode === "specific_products" && giftProductIds.length === 0) {
    return NextResponse.json({ error: "Select at least one gift product" }, { status: 400 });
  }

  const data = {
    discountEnabled: enabled,
    discountType: type,
    discountValue: value,
    discountBuyQuantity: buyQuantity,
    discountGetQuantity: getQuantity,
  };

  const settings = await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  await prisma.$executeRaw`
    UPDATE "SiteSetting" SET "discountProductIds" = ${JSON.stringify(productIds)},
      "discountGiftMode" = ${giftMode}, "discountGiftProductIds" = ${JSON.stringify(giftProductIds)}
    WHERE id = 'singleton'
  `;

  revalidateStorefront();
  return NextResponse.json({ settings });
}

