import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CategoryReorderList from "@/components/CategoryReorderList";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="bg-brand-dark text-white px-5 py-2.5 rounded-full text-sm font-medium"
        >
          + Add Category
        </Link>
      </div>
      <CategoryReorderList initial={categories.map((c) => ({ ...c, imageUrl: c.imageUrl ?? null }))} />
    </div>
  );
}
