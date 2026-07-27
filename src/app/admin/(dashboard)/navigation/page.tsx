import { prisma } from "@/lib/prisma";
import NavLinkManager from "@/components/NavLinkManager";

export default async function AdminNavigationPage() {
  const links = await prisma.navLink.findMany({ orderBy: { position: "asc" } });

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Menu</h1>
      <p className="text-sm text-foreground/50 mb-8">
        Controls what shows in the site&apos;s side menu (the ☰ icon).
      </p>
      <NavLinkManager initialLinks={links} />
    </div>
  );
}
