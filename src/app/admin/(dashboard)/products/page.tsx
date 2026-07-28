import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatEGP } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { images: true, category: true },
    orderBy: { createdAt: "desc" },
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

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-foreground/40 border-b border-brand-light/60">
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Visibility</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-brand-light/40 last:border-0">
                <td className="p-4 flex items-center gap-3">
                  <div className="relative w-10 h-12 overflow-hidden bg-brand-light shrink-0">
                    {p.images[0] && (
                      <Image src={p.images[0].url} alt="" fill className="object-cover" />
                    )}
                  </div>
                  {p.title}
                </td>
                <td className="p-4">{p.category?.name ?? "—"}</td>
                <td className="p-4">{formatEGP(Number(p.price))}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      p.stockStatus === "instock"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.stockStatus}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      p.visible ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {p.visible ? "Visible" : "Hidden"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-brand-dark font-medium">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-foreground/40">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
