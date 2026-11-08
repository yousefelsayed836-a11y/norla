import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { adjustStock, StockUnavailableError } from "@/lib/inventory";
import { revalidateStorefront } from "@/lib/revalidate";
import { sendAdminOrderNotification, sendCustomerOrderConfirmation } from "@/lib/email";
import { sendPushToAdmins } from "@/lib/push";
import { formatEGP } from "@/lib/format";
import { rateLimit } from "@/lib/rate-limit";
import { calculateDiscount, calculateDiscountOffers, parseDiscountRules, parseProductIds } from "@/lib/discounts";
import { z } from "zod";

const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(1),
    phone: z.string().regex(/^[0-9]{11}$/, "Phone must be exactly 11 English digits"),
    whatsappNumber: z.string().regex(/^[0-9]{11}$/, "WhatsApp must be exactly 11 English digits"),
    email: z.string().optional(),
    address: z.string().min(1),
    governorate: z.string().min(1),
    city: z.string().optional(),
  }),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        quantity: z.number().int().min(1).max(1000),
      })
    )
    .min(1)
    .max(100),
  paymentMethod: z.enum(["instapay", "vodafone_cash"]).optional(),
  depositAmount: z.number().finite().nonnegative().optional(),
});

export async function POST(req: NextRequest) {
  const { allowed } = rateLimit(req, "orders", 10, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many orders. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
  }
  const { customer, items, paymentMethod, depositAmount: requestedDepositAmount } = parsed.data;

  const zone = await prisma.shippingZone.findUnique({
    where: { governorate: customer.governorate },
    include: { cities: true },
  });
  if (!zone || !zone.active) {
    return NextResponse.json(
      { error: "We don't currently ship to this governorate" },
      { status: 400 }
    );
  }

  const resolvedItems: {
    productId: string;
    variantId: string | undefined;
    title: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }[] = [];
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { images: { orderBy: { position: "asc" }, take: 1 }, variants: { select: { id: true } } },
    });
    if (!product) return NextResponse.json({ error: "One or more products are no longer available" }, { status: 400 });
    if (product.variants.length > 0 && !item.variantId) {
      return NextResponse.json({ error: "Choose an available variant for each product" }, { status: 400 });
    }
    let price = Number(product.price);
    let title = product.title;
    let imageUrl = product.images[0]?.url;
    if (item.variantId) {
      const variant = await prisma.productVariant.findFirst({ where: { id: item.variantId, productId: item.productId } });
      if (!variant) return NextResponse.json({ error: "Selected product variant is invalid" }, { status: 400 });
      if (variant.price) price = Number(variant.price);
      title = `${product.title} (${variant.label})`;
      if (variant.imageUrl) imageUrl = variant.imageUrl;
    }
    resolvedItems.push({
      productId: item.productId,
      variantId: item.variantId,
      title,
      price,
      quantity: item.quantity,
      imageUrl,
    });
  }

  if (resolvedItems.length === 0) {
    return NextResponse.json({ error: "No valid items" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings: any = await prisma.$queryRaw`
    SELECT "depositPercent", "freeShippingEnabled", "freeShippingThreshold",
      "discountRulesJson",
      "discountEnabled", "discountType", "discountValue", "discountBuyQuantity", "discountGetQuantity",
      "discountProductIds", "discountGiftMode", "discountGiftProductIds",
      "discountGiftDiscountType", "discountGiftDiscountValue"
    FROM "SiteSetting" WHERE id = 'singleton' LIMIT 1
  `.then((rows: any) => rows[0] ?? {}).catch(() => ({}));

  const depositPercent = Number(settings.depositPercent ?? 50);
  const freeShippingEnabled = !!settings.freeShippingEnabled;
  const freeShippingThreshold = Number(settings.freeShippingThreshold ?? 0);

  const subtotal = resolvedItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const offerRules = parseDiscountRules(settings.discountRulesJson);
  const calculatedOffers = calculateDiscountOffers(resolvedItems, offerRules);
  const legacyDiscount = calculateDiscount(resolvedItems, {
    enabled: !!settings.discountEnabled,
    type: settings.discountType ?? "none",
    value: Number(settings.discountValue) || 0,
    buyQuantity: Number(settings.discountBuyQuantity) || 2,
    getQuantity: Number(settings.discountGetQuantity) || 1,
    productIds: parseProductIds(settings.discountProductIds),
    giftMode: settings.discountGiftMode ?? "same_product",
    giftProductIds: parseProductIds(settings.discountGiftProductIds),
    giftDiscountType: settings.discountGiftDiscountType ?? "free",
    giftDiscountValue: Number(settings.discountGiftDiscountValue) || 100,
  });
  const discountAmount = Math.min(subtotal, Math.max(0, Math.round((offerRules.length ? calculatedOffers.amount : legacyDiscount.amount) * 100) / 100));
  const activePriceRules = offerRules.filter((rule) => rule.enabled && rule.type !== "free_shipping");
  const appliedDiscountType = discountAmount > 0
    ? activePriceRules.length > 1 ? "multiple" : activePriceRules[0]?.type ?? settings.discountType ?? "none"
    : "none";
  const qualifiesFreeShipping =
    (freeShippingEnabled && freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) ||
    (offerRules.length > 0 && calculatedOffers.freeShipping);
  const shippingFee = qualifiesFreeShipping ? 0 : Number(zone.fee);
  const discountedBase = subtotal - discountAmount + shippingFee;
  const expectedServiceFee = paymentMethod === "vodafone_cash"
    ? discountedBase < 1000 ? 5 : Math.floor(discountedBase / 1000) * 10
    : 0;
  const resolvedServiceFee = expectedServiceFee;
  const total = discountedBase + resolvedServiceFee;
  const minimumDeposit = (total * depositPercent) / 100;
  if (requestedDepositAmount !== undefined && requestedDepositAmount + 0.001 < minimumDeposit) {
    return NextResponse.json({ error: "Deposit amount is below the required minimum" }, { status: 400 });
  }
  if (requestedDepositAmount !== undefined && requestedDepositAmount > total) {
    return NextResponse.json({ error: "Deposit amount cannot exceed the order total" }, { status: 400 });
  }
  const depositAmount = requestedDepositAmount ?? minimumDeposit;

  type OrderCustomer = {
    name: string;
    phone: string | null;
    whatsappNumber: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    governorate: string | null;
  };
  let order: { id: string; orderNo: number; paymentMethod: string | null; customer: OrderCustomer | null };
  try {
    order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        subtotal,
        discountAmount,
        shippingFee,
        total,
        depositAmount,
        serviceFee: resolvedServiceFee,
        paymentMethod: paymentMethod || null,
        customer: {
          create: {
            name: customer.name,
            phone: customer.phone,
            whatsappNumber: customer.whatsappNumber || null,
            email: customer.email || null,
            address: customer.address,
            governorate: customer.governorate,
            city: customer.city || "",
          },
        },
        items: {
          create: resolvedItems.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            title: i.title,
            price: i.price,
            quantity: i.quantity,
          })),
        },
      },
      include: { items: true, customer: true },
    });
    await tx.$executeRaw`UPDATE "Order" SET "discountType" = ${appliedDiscountType},
      "discountGiftQuantity" = ${offerRules.length ? calculatedOffers.giftQuantity : legacyDiscount.giftQuantity}
      WHERE id = ${created.id}`;
    await adjustStock(tx, resolvedItems, -1);
    return created;
    });
  } catch (error) {
    if (error instanceof StockUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }

  revalidateStorefront();

  sendAdminOrderNotification({
    to: "orders@norla-designs.com",
    orderNo: order.orderNo,
    customerName: order.customer!.name,
    phone: order.customer!.phone,
    whatsappNumber: order.customer!.whatsappNumber,
    items: resolvedItems.map((i) => ({
      title: i.title,
      quantity: i.quantity,
      imageUrl: i.imageUrl,
    })),
    total,
    depositAmount,
    paymentMethod: order.paymentMethod,
  });
  sendPushToAdmins({
    title: `New order #${order.orderNo}`,
    body: `${order.customer!.name} — ${formatEGP(total)}`,
    url: `/admin/orders/${order.id}`,
  }).catch((err) => console.error("Failed to send push notification", err));
  const orderCustomer = order.customer;
  if (orderCustomer?.email) {
    sendCustomerOrderConfirmation({
      to: orderCustomer.email,
      orderNo: order.orderNo,
      customerName: orderCustomer.name,
      items: resolvedItems.map((i) => ({
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        imageUrl: i.imageUrl,
      })),
      subtotal,
      discountAmount,
      shippingFee,
      total,
      depositPercent: total > 0 ? Math.round((depositAmount / total) * 100) : 0,
      depositAmount,
      paymentMethod: order.paymentMethod,
      address: orderCustomer.address ?? "",
      city: zone.cities.find((c) => c.name === orderCustomer.city)?.nameAr || orderCustomer.city || "",
      governorate: zone.governorateAr || orderCustomer.governorate || "",
    });
  }

  return NextResponse.json({ order });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    include: { items: true, customer: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}
