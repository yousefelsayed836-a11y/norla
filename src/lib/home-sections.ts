import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/products";

const include = {
  products: {
    orderBy: { position: "asc" as const },
    include: {
      product: {
        include: { images: { orderBy: { position: "asc" as const } }, category: true, variants: true },
      },
    },
  },
};

export async function getHomeSections() {
  const sections = await prisma.homeSection.findMany({
    orderBy: { position: "asc" },
    include,
  });
  return sections.map((s) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    products: s.products
      .filter((sp) => sp.product.visible && sp.product.status !== "trash")
      .map((sp) => serializeProduct(sp.product)),
  }));
}

export async function getHomeSectionBySlug(slug: string) {
  const section = await prisma.homeSection.findUnique({
    where: { slug },
    include,
  });
  if (!section) return null;
  return {
    id: section.id,
    title: section.title,
    slug: section.slug,
    products: section.products
      .filter((sp) => sp.product.visible && sp.product.status !== "trash")
      .map((sp) => serializeProduct(sp.product)),
  };
}
