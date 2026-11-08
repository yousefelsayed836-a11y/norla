import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateStorefront } from "@/lib/revalidate";

const ruleSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().max(120),
  nameAr: z.string().max(120),
  enabled: z.boolean(),
  type: z.enum(["percent", "fixed", "buy_get", "free_shipping"]),
  value: z.number().finite().min(0).max(99_999_999.99),
  buyQuantity: z.number().int().min(1).max(1000),
  getQuantity: z.number().int().min(1).max(1000),
  productIds: z.array(z.string().min(1)).max(500),
  giftMode: z.enum(["same_product", "any_product", "specific_products"]),
  giftProductIds: z.array(z.string().min(1)).max(500),
  giftDiscountType: z.enum(["free", "percent", "fixed"]),
  giftDiscountValue: z.number().finite().min(0).max(99_999_999.99),
  shippingQuantity: z.number().int().min(0).max(1000),
});

const bodySchema = z.object({ rules: z.array(ruleSchema).max(50) });

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid discount rules" }, { status: 400 });
  const { rules } = parsed.data;
  if (new Set(rules.map((rule) => rule.id)).size !== rules.length) {
    return NextResponse.json({ error: "Offer IDs must be unique" }, { status: 400 });
  }
  for (const rule of rules) {
    if (rule.type === "percent" && rule.value > 100) return NextResponse.json({ error: "Discount cannot exceed 100%" }, { status: 400 });
    if (rule.type === "buy_get" && rule.giftDiscountType === "percent" && rule.giftDiscountValue > 100) {
      return NextResponse.json({ error: "Reward discount cannot exceed 100%" }, { status: 400 });
    }
    if (rule.type === "buy_get" && rule.giftMode === "specific_products" && !rule.giftProductIds.length) {
      return NextResponse.json({ error: "Select at least one reward product" }, { status: 400 });
    }
  }

  const selectedIds = [...new Set(rules.flatMap((rule) => [...rule.productIds, ...rule.giftProductIds]))];
  if (selectedIds.length && await prisma.product.count({ where: { id: { in: selectedIds } } }) !== selectedIds.length) {
    return NextResponse.json({ error: "One or more selected products do not exist" }, { status: 400 });
  }

  const priceRules = rules.filter((rule) => rule.enabled && rule.type !== "free_shipping");
  for (let i = 0; i < priceRules.length; i++) for (let j = i + 1; j < priceRules.length; j++) {
    const left = priceRules[i].productIds;
    const right = priceRules[j].productIds;
    if (!left.length || !right.length || left.some((id) => right.includes(id))) {
      return NextResponse.json({ error: "Active price discounts cannot overlap on the same products. Free shipping can overlap." }, { status: 400 });
    }
  }

  const firstPriceRule = priceRules[0];
  const hasPriceDiscount = priceRules.length > 0;
  const discountType = priceRules.length > 1 ? "multiple" : firstPriceRule?.type ?? "none";
  const data = {
    discountRulesJson: JSON.stringify(rules),
    discountEnabled: hasPriceDiscount,
    discountType,
    discountValue: firstPriceRule?.value ?? 0,
    discountBuyQuantity: firstPriceRule?.buyQuantity ?? 2,
    discountGetQuantity: firstPriceRule?.getQuantity ?? 1,
  };
  const settings = await prisma.siteSetting.upsert({
    where: { id: "singleton" }, update: data, create: { id: "singleton", ...data },
  });
  await prisma.$executeRaw`
    UPDATE "SiteSetting" SET "discountProductIds" = ${JSON.stringify(firstPriceRule?.productIds ?? [])},
      "discountGiftMode" = ${firstPriceRule?.giftMode ?? "same_product"},
      "discountGiftProductIds" = ${JSON.stringify(firstPriceRule?.giftProductIds ?? [])},
      "discountGiftDiscountType" = ${firstPriceRule?.giftDiscountType ?? "free"},
      "discountGiftDiscountValue" = ${firstPriceRule?.giftDiscountValue ?? 100}
    WHERE id = 'singleton'
  `;
  revalidateStorefront();
  return NextResponse.json({ settings, rules });
}
