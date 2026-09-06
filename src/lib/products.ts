import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const productInclude = {
  images: { orderBy: { position: "asc" as const } },
  category: true,
  variants: { orderBy: { id: "asc" as const } },
  reviews: { where: { approved: true }, orderBy: { createdAt: "desc" as const } },
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { position: "asc" } });
}

export async function getProducts(opts?: { categorySlug?: string; search?: string }) {
  const products = await prisma.product.findMany({
    where: {
      status: { not: "trash" },
      visible: true,
      ...(opts?.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
      ...(opts?.search ? { title: { contains: opts.search, mode: "insensitive" } } : {}),
    },
    include: productInclude,
    orderBy: { createdAt: "desc" as const },
  });
  // Sort by position field once it exists in the DB (after migration + prisma generate)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products.sort((a, b) => ((a as any).position ?? 0) - ((b as any).position ?? 0));
  return products.map(serializeProduct);
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });
  if (!product || !product.visible || product.status === "trash") return null;
  return serializeProduct(product);
}

export function serializeProduct(p: ProductWithRelations) {
  const approvedReviews = p.reviews ?? [];
  const rating =
    approvedReviews.length > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
      : p.rating;
  const reviewCount = approvedReviews.length > 0 ? approvedReviews.length : p.reviewCount;

  // Sort variants by position if available (column added via migration)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants = [...p.variants].sort((a, b) => ((a as any).position ?? 0) - ((b as any).position ?? 0));

  return {
    ...p,
    price: Number(p.price),
    regularPrice: p.regularPrice ? Number(p.regularPrice) : null,
    rating,
    reviewCount,
    variants: variants.map((v) => ({
      ...v,
      price: v.price ? Number(v.price) : null,
      regularPrice: v.regularPrice ? Number(v.regularPrice) : null,
    })),
  };
}
