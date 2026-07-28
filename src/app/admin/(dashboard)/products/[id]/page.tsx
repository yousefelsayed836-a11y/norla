import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/ProductForm";
import VariantManager from "@/components/VariantManager";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [categories, product] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: { orderBy: { id: "asc" } } },
    }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Edit Product</h1>
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          title: product.title,
          titleAr: product.titleAr ?? "",
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription,
          price: String(product.price),
          regularPrice: product.regularPrice ? String(product.regularPrice) : "",
          sku: product.sku ?? "",
          stockStatus: product.stockStatus,
          stockQty: product.stockQty ? String(product.stockQty) : "",
          status: product.status,
          categoryId: product.categoryId ?? "",
          images: product.images.sort((a, b) => a.position - b.position).map((i) => i.url),
          rating: String(product.rating),
          reviewCount: String(product.reviewCount),
          visible: product.visible,
        }}
      />
      <VariantManager
        productId={product.id}
        variants={product.variants.map((v) => ({
          id: v.id,
          label: v.label,
          color: v.color,
          colorHex: v.colorHex,
          size: v.size,
          imageUrl: v.imageUrl,
          price: v.price ? String(v.price) : null,
          stockStatus: v.stockStatus,
          stockQty: v.stockQty,
        }))}
      />
    </div>
  );
}
