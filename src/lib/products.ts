import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const productWithRelations: any = {
  include: {
    images: { orderBy: { position: "asc" } },
    category: true,
    variants: { orderBy: [{ position: "asc" }, { id: "asc" }] },
    reviews: { where: { approved: true }, orderBy: { createdAt: "desc" } },
  },
};

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: true;
    category: true;
    variants: true;
    reviews: true;
  };
}>;

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orderBy: [{ position: "asc" }, { createdAt: "desc" }] as any,
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
