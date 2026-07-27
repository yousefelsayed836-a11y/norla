import { getSiteSettings } from "@/lib/settings";
import SettingsForm from "@/components/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Settings</h1>
      <SettingsForm
        initialText={settings.announcementText}
        initialInstagram={settings.instagramUrl}
        initialTiktok={settings.tiktokUrl}
        initialWhatsapp={settings.whatsappUrl}
        initialReturnPolicy={settings.returnPolicyText}
        initialShippingFee={String(settings.shippingFee)}
        initialDepositPercent={settings.depositPercent}
        initialFreeShippingEnabled={settings.freeShippingEnabled}
        initialFreeShippingThreshold={String(settings.freeShippingThreshold)}
      />
    </div>
  );
}
