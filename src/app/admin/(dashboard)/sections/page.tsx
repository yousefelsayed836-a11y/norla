import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminSectionsPage() {
  const sections = await prisma.homeSection.findMany({
    orderBy: { position: "asc" },
    include: { products: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Homepage Sections</h1>
        <Link
          href="/admin/sections/new"
          className="bg-brand-dark text-white px-5 py-2.5 rounded-full text-sm font-medium"
        >
          + Add Section
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-foreground/40 border-b border-brand-light/60">
              <th className="p-4 font-medium">Order</th>
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Slug</th>
              <th className="p-4 font-medium">Products</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {sections.map((s) => (
              <tr key={s.id} className="border-b border-brand-light/40 last:border-0">
                <td className="p-4">{s.position}</td>
                <td className="p-4">{s.title}</td>
                <td className="p-4 text-foreground/50">/collections/{s.slug}</td>
                <td className="p-4">{s.products.length}</td>
                <td className="p-4 text-right">
                  <Link href={`/admin/sections/${s.id}`} className="text-brand-dark font-medium">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {sections.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-foreground/40">
                  No sections yet. Add one to start building the homepage.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
