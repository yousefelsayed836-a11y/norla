import { prisma } from "@/lib/prisma";
import ImageListManager from "@/components/ImageListManager";

export default async function AdminHeroPage() {
  const images = await prisma.heroImage.findMany({ orderBy: { position: "asc" } });

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Homepage Hero</h1>
      <p className="text-sm text-foreground/50 mb-8">
        Add one or more photos for the homepage banner. If you add more than one, they rotate
        automatically. Drag order with the arrows — the first one shows first.
      </p>
      <ImageListManager
        initialItems={images.map((i) => ({ id: i.id, url: i.url }))}
        apiBase="/api/hero-images"
        aspect="aspect-[2/3]"
      />
    </div>
  );
}
