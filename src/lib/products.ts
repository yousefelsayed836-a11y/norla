import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const productWithRelations = {
  include: {
    images: { orderBy: { position: "asc" as const } },
    category: true,
    variants: { orderBy: [{ position: "asc" as const }, { id: "asc" as const }] },
    reviews: { where: { approved: true }, orderBy: { createdAt: "desc" as const } },
  },
} satisfies Prisma.ProductDefaultArgs;

type ProductWithRelations = Prisma.ProductGetPayload<typeof productWithRelations>;

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
    ...productWithRelations,
    orderBy: [{ position: "asc" as const }, { createdAt: "desc" as const }],
  });
  return products.map(serializeProduct);
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    ...productWithRelations,
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

  return {
    ...p,
    price: Number(p.price),
    regularPrice: p.regularPrice ? Number(p.regularPrice) : null,
    rating,
    reviewCount,
    variants: p.variants.map((v) => ({
      ...v,
      price: v.price ? Number(v.price) : null,
      regularPrice: v.regularPrice ? Number(v.regularPrice) : null,
    })),
  };
}
