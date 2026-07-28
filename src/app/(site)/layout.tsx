import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AnnouncementBar from "@/components/AnnouncementBar";
import { getSiteSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { LanguageProvider } from "@/lib/i18n";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, navLinks] = await Promise.all([
    getSiteSettings(),
    prisma.navLink.findMany({ orderBy: { position: "asc" } }),
  ]);

  return (
    <LanguageProvider>
      <div className="public-site flex flex-col flex-1">
        <AnnouncementBar text={settings.announcementText} />
        <SiteHeader navLinks={navLinks.map((n) => ({ label: n.label, href: n.href }))} />
        <main className="flex-1">{children}</main>
        <SiteFooter
          instagramUrl={settings.instagramUrl}
          tiktokUrl={settings.tiktokUrl}
          whatsappUrl={settings.whatsappUrl}
        />
      </div>
    </LanguageProvider>
  );
}
