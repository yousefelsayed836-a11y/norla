import { getSiteSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { formatEGP } from "@/lib/format";
import { parseProductIds } from "@/lib/discounts";
import DiscountSettingsForm from "@/components/DiscountSettingsForm";

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
    prisma.$queryRaw<{ discountProductIds: string; discountGiftMode: string; discountGiftProductIds: string }[]>`
      SELECT "discountProductIds", "discountGiftMode", "discountGiftProductIds"
      FROM "SiteSetting" WHERE id = 'singleton' LIMIT 1
    `.then((rows) => rows[0] ?? { discountProductIds: "[]", discountGiftMode: "same_product", discountGiftProductIds: "[]" })
      .catch(() => ({ discountProductIds: "[]", discountGiftMode: "same_product", discountGiftProductIds: "[]" })),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-display text-3xl mb-2">Discounts</h1>
        <p className="text-sm text-foreground/60 mb-8">Configure automatic offers and choose which products qualify.</p>
        <DiscountSettingsForm
          initialEnabled={settings.discountEnabled} initialType={settings.discountType}
          initialValue={String(settings.discountValue)} initialBuyQuantity={settings.discountBuyQuantity}
          initialGetQuantity={settings.discountGetQuantity} products={products}
          initialProductIds={parseProductIds(reportConfig.discountProductIds)}
          initialGiftMode={reportConfig.discountGiftMode}
          initialGiftProductIds={parseProductIds(reportConfig.discountGiftProductIds)}
        />
      </section>
      <section className="max-w-3xl">
        <h2 className="font-display text-2xl mb-1">Discount report</h2>
        <p className="text-sm text-foreground/60 mb-4">Non-cancelled orders with a discount applied.</p>
        <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
          <table className="w-full text-sm text-left">
            <thead><tr className="border-b border-brand-light text-foreground/60"><th className="p-4">Offer type</th><th className="p-4">Orders</th><th className="p-4">Discount value</th><th className="p-4">Gift units</th></tr></thead>
            <tbody>
              {report.length ? report.map((row) => <tr key={row.discountType} className="border-b last:border-0 border-brand-light/70">
                <td className="p-4">{row.discountType === "buy_get" ? "Buy X, get Y" : row.discountType === "percent" ? "Percentage" : row.discountType === "fixed" ? "Fixed amount" : row.discountType}</td>
                <td className="p-4">{Number(row.orders)}</td><td className="p-4">{formatEGP(Number(row.discountTotal))}</td><td className="p-4">{row.discountType === "buy_get" ? row.gifts : "—"}</td>
              </tr>) : <tr><td colSpan={4} className="p-5 text-foreground/50">No discounted orders recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}


