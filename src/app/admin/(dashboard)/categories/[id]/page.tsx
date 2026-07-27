import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CategoryForm from "@/components/CategoryForm";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, products] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.product.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, categoryId: true },
    }),
  ]);
  if (!category) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Edit Category</h1>
      <CategoryForm
        allProducts={products}
        initial={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          imageUrl: category.imageUrl ?? "",
          position: category.position,
          productIds: products.filter((p) => p.categoryId === category.id).map((p) => p.id),
        }}
      />
    </div>
  );
}
