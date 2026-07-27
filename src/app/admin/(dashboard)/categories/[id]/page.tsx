import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CategoryForm from "@/components/CategoryForm";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Edit Category</h1>
      <CategoryForm
        initial={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          imageUrl: category.imageUrl ?? "",
          position: category.position,
        }}
      />
    </div>
  );
}
