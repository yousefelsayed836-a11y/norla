import { prisma } from "@/lib/prisma";
import CategoryForm from "@/components/CategoryForm";

export default async function NewCategoryPage() {
  const products = await prisma.product.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Add Category</h1>
      <CategoryForm allProducts={products} />
    </div>
  );
}
