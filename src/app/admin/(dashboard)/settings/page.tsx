import { getSiteSettings } from "@/lib/settings";
import SettingsForm from "@/components/SettingsForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = settings as any;

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Settings</h1>
      <div className="mb-8">
        <ChangePasswordForm />
      </div>
      <SettingsForm
        initialText={settings.announcementText}
        initialTextAr={settings.announcementTextAr ?? ""}
        initialInstagram={settings.instagramUrl}
        initialTiktok={settings.tiktokUrl}
        initialWhatsapp={settings.whatsappUrl}
        initialFacebook={settings.facebookUrl}
        initialContactPhone={settings.contactPhone}
        initialContactEmail={settings.contactEmail}
        initialContactAddress={settings.contactAddress}
        initialContactAddressAr={settings.contactAddressAr ?? ""}
        initialContactHours={settings.contactHours}
        initialContactHoursAr={settings.contactHoursAr ?? ""}
        initialCareInstructions={settings.careInstructionsText}
        initialCareInstructionsAr={settings.careInstructionsTextAr ?? ""}
        initialShippingFee={String(settings.shippingFee)}
        initialDepositPercent={settings.depositPercent}
        initialFreeShippingEnabled={settings.freeShippingEnabled}
        initialFreeShippingThreshold={String(settings.freeShippingThreshold)}
        initialCheckoutPaymentNote={s.checkoutPaymentNote ?? ""}
        initialCheckoutPaymentNoteAr={s.checkoutPaymentNoteAr ?? ""}
        initialWhatsappMessageTemplate={s.whatsappMessageTemplate ?? ""}
      />
    </div>
  );
}
