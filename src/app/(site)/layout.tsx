import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AnnouncementBar from "@/components/AnnouncementBar";
import { getSiteSettings } from "@/lib/settings";
import { getCategories } from "@/lib/products";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSiteSettings(), getCategories()]);

  return (
    <div className="public-site flex flex-col flex-1">
      <AnnouncementBar text={settings.announcementText} />
      <SiteHeader categories={categories.map((c) => ({ name: c.name, slug: c.slug }))} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        instagramUrl={settings.instagramUrl}
        tiktokUrl={settings.tiktokUrl}
        whatsappUrl={settings.whatsappUrl}
      />
    </div>
  );
}
