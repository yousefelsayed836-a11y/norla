import { getSiteSettings } from "@/lib/settings";
import DiscountSettingsForm from "@/components/DiscountSettingsForm";

export default async function AdminDiscountsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Discounts</h1>
      <p className="text-sm text-foreground/60 mb-8">
        Configure the automatic offer customers see in their cart and checkout.
      </p>
      <DiscountSettingsForm
        initialEnabled={settings.discountEnabled}
        initialType={settings.discountType}
        initialValue={String(settings.discountValue)}
        initialBuyQuantity={settings.discountBuyQuantity}
        initialGetQuantity={settings.discountGetQuantity}
      />
    </div>
  );
}

