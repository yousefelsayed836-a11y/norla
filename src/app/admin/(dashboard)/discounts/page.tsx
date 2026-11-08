import { getSiteSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { formatEGP } from "@/lib/format";
import { parseDiscountRules, parseProductIds, type DiscountOfferRule } from "@/lib/discounts";
import DiscountRulesForm from "@/components/DiscountRulesForm";

export default async function AdminDiscountsPage() {
  const [settings, products, report, reportConfig] = await Promise.all([
    getSiteSettings(),
    prisma.product.findMany({ where: { visible: true }, select: { id: true, title: true, titleAr: true }, orderBy: { title: "asc" } }),
    prisma.$queryRaw<{ discountType: string; orders: bigint; discountTotal: unknown; gifts: number }[]>`
      SELECT "discountType", COUNT(*)::bigint AS orders,
        COALESCE(SUM("discountAmount"), 0) AS "discountTotal",
        COALESCE(SUM("discountGiftQuantity"), 0)::int AS gifts
      FROM "Order" WHERE "status" <> 'CANCELLED' AND "discountAmount" > 0
      GROUP BY "discountType" ORDER BY "discountType"
    `.catch(() => []),
    prisma.$queryRaw<{
      discountRulesJson: string | null;
      discountProductIds: string;
      discountGiftMode: string;
      discountGiftProductIds: string;
      discountGiftDiscountType: string;
      discountGiftDiscountValue: unknown;
    }[]>`
      SELECT "discountRulesJson", "discountProductIds", "discountGiftMode",
        "discountGiftProductIds", "discountGiftDiscountType", "discountGiftDiscountValue"
      FROM "SiteSetting" WHERE id = 'singleton' LIMIT 1
    `.then((rows) => rows[0] ?? {
      discountRulesJson: "[]", discountProductIds: "[]", discountGiftMode: "same_product",
      discountGiftProductIds: "[]", discountGiftDiscountType: "free", discountGiftDiscountValue: 100,
    })
      .catch(() => ({
        discountRulesJson: "[]", discountProductIds: "[]", discountGiftMode: "same_product",
        discountGiftProductIds: "[]", discountGiftDiscountType: "free", discountGiftDiscountValue: 100,
      })),
  ]);

  let initialRules = parseDiscountRules(reportConfig.discountRulesJson);
  if (!initialRules.length && settings.discountEnabled && ["percent", "fixed", "buy_get"].includes(settings.discountType)) {
    initialRules = [{
      id: "legacy-main-offer", name: "", nameAr: "", enabled: true, type: settings.discountType,
      value: Number(settings.discountValue) || 0, buyQuantity: settings.discountBuyQuantity || 2,
      getQuantity: settings.discountGetQuantity || 1, productIds: parseProductIds(reportConfig.discountProductIds),
      giftMode: reportConfig.discountGiftMode as DiscountOfferRule["giftMode"] || "same_product",
      giftProductIds: parseProductIds(reportConfig.discountGiftProductIds),
      giftDiscountType: reportConfig.discountGiftDiscountType as DiscountOfferRule["giftDiscountType"] || "free",
      giftDiscountValue: Number(reportConfig.discountGiftDiscountValue) || 100, shippingQuantity: 0,
    } as DiscountOfferRule];
  }

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-display text-3xl mb-2">Discounts</h1>
        <p className="text-sm text-foreground/60 mb-8">Configure automatic offers and choose which products qualify.</p>
        <DiscountRulesForm initialRules={initialRules} products={products} />
      </section>
      <section className="max-w-3xl">
        <h2 className="font-display text-2xl mb-1">Discount report</h2>
        <p className="text-sm text-foreground/60 mb-4">Non-cancelled orders with a discount applied.</p>
        <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
          <table className="w-full text-sm text-left">
            <thead><tr className="border-b border-brand-light text-foreground/60"><th className="p-4">Offer type</th><th className="p-4">Orders</th><th className="p-4">Discount value</th><th className="p-4">Reward units</th></tr></thead>
            <tbody>
              {report.length ? report.map((row) => <tr key={row.discountType} className="border-b last:border-0 border-brand-light/70">
                <td className="p-4">{row.discountType === "buy_get" ? "Buy X, get Y" : row.discountType === "percent" ? "Percentage" : row.discountType === "fixed" ? "Fixed amount" : row.discountType === "multiple" ? "Multiple offers" : row.discountType}</td>
                <td className="p-4">{Number(row.orders)}</td><td className="p-4">{formatEGP(Number(row.discountTotal))}</td><td className="p-4">{row.discountType === "buy_get" ? row.gifts : "—"}</td>
              </tr>) : <tr><td colSpan={4} className="p-5 text-foreground/50">No discounted orders recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

