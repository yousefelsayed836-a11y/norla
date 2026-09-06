import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductReorderList from "@/components/ProductReorderList";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orderBy: { position: "asc" } as any,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-brand-dark text-white px-5 py-2.5 rounded-full text-sm font-medium"
        >
          + Add Product
        </Link>
      </div>
      <ProductReorderList
        initial={products.map((p) => ({
          id: p.id,
          title: p.title,
          position: p.position,
          price: String(p.price),
          stockStatus: p.stockStatus,
          visible: p.visible,
          category: p.category ? { name: p.category.name } : null,
          images: p.images.map((img) => ({ url: img.url })),
        }))}
      />
    </div>
  );
}
