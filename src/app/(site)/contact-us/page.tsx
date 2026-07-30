import { getSiteSettings } from "@/lib/settings";
import ContactUsContent from "@/components/ContactUsContent";

export default async function ContactUsPage() {
  const settings = await getSiteSettings();

  return (
    <ContactUsContent
      phone={settings.contactPhone}
      email={settings.contactEmail}
      address={settings.contactAddress}
      addressAr={settings.contactAddressAr}
      hours={settings.contactHours}
      hoursAr={settings.contactHoursAr}
      instagramUrl={settings.instagramUrl}
      tiktokUrl={settings.tiktokUrl}
      facebookUrl={settings.facebookUrl}
      whatsappUrl={settings.whatsappUrl}
    />
  );
}
