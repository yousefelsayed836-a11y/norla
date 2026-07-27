import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Add Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
