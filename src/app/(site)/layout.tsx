import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AnnouncementBar from "@/components/AnnouncementBar";
import { getSiteSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

// The whole public site reads live data from the admin dashboard (products,
// sections, categories, settings) — never let Next.js freeze it as a static
// build-time snapshot, or admin edits won't show up until the next deploy.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, navLinks] = await Promise.all([
    getSiteSettings(),
    prisma.navLink.findMany({ orderBy: { position: "asc" } }),
  ]);

  return (
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
  );
}
