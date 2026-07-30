import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AnnouncementBar from "@/components/AnnouncementBar";
import { getSiteSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { LanguageProvider } from "@/lib/i18n";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    prisma.category.findMany({ orderBy: { position: "asc" } }),
  ]);

  return (
    <LanguageProvider>
      <div className="public-site flex flex-col flex-1">
        <AnnouncementBar text={settings.announcementText} textAr={settings.announcementTextAr} />
        <SiteHeader categories={categories.map((c) => ({ name: c.name, slug: c.slug }))} />
        <main className="flex-1">{children}</main>
        <SiteFooter
          instagramUrl={settings.instagramUrl}
          tiktokUrl={settings.tiktokUrl}
          whatsappUrl={settings.whatsappUrl}
          facebookUrl={settings.facebookUrl}
        />
      </div>
    </LanguageProvider>
  );
}
