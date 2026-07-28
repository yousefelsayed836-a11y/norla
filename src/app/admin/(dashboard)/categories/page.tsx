import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

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

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-foreground/40 border-b border-brand-light/60">
              <th className="p-4 font-medium">Order</th>
              <th className="p-4 font-medium">Tile</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Products</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-brand-light/40 last:border-0">
                <td className="p-4">{c.position}</td>
                <td className="p-4">
                  <div className="relative w-12 h-14 overflow-hidden bg-brand-light">
                    {c.imageUrl && <Image src={c.imageUrl} alt="" fill className="object-cover" />}
                  </div>
                </td>
                <td className="p-4">{c.name}</td>
                <td className="p-4">{c._count.products}</td>
                <td className="p-4 text-right">
                  <Link href={`/admin/categories/${c.id}`} className="text-brand-dark font-medium">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-foreground/40">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
