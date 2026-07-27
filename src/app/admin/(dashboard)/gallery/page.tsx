import { prisma } from "@/lib/prisma";
import ImageListManager from "@/components/ImageListManager";

export default async function AdminGalleryPage() {
  const images = await prisma.galleryImage.findMany({ orderBy: { position: "asc" } });

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">&quot;Made By Us, Styled By You&quot; Gallery</h1>
      <p className="text-sm text-foreground/50 mb-8">
        These photos show side by side on the homepage in this section, in the order below.
      </p>
      <ImageListManager
        initialItems={images.map((i) => ({ id: i.id, url: i.url }))}
        apiBase="/api/gallery-images"
        aspect="aspect-square"
      />
    </div>
  );
}
