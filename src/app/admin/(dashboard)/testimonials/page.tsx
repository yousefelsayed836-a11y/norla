import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { position: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Testimonials</h1>
        <Link
          href="/admin/testimonials/new"
          className="bg-brand-dark text-white px-5 py-2.5 rounded-full text-sm font-medium"
        >
          + Add Testimonial
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm hidden md:table">
          <thead>
            <tr className="text-left text-foreground/40 border-b border-brand-light/60">
              <th className="p-4 font-medium">Order</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Review</th>
              <th className="p-4 font-medium">Rating</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((t) => (
              <tr key={t.id} className="border-b border-brand-light/40 last:border-0">
                <td className="p-4">{t.position}</td>
                <td className="p-4">{t.customerName}</td>
                <td className="p-4 max-w-xs truncate">{t.quote}</td>
                <td className="p-4">{"★".repeat(t.rating)}</td>
                <td className="p-4 text-right">
                  <Link href={`/admin/testimonials/${t.id}`} className="text-brand-dark font-medium">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-foreground/40">
                  No testimonials yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="md:hidden divide-y divide-brand-light/40">
          {testimonials.map((t) => (
            <Link
              key={t.id}
              href={`/admin/testimonials/${t.id}`}
              className="p-4 flex items-center gap-3 active:bg-brand-light/20"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{t.customerName}</p>
                <p className="text-xs text-foreground/50 truncate">{t.quote}</p>
                <p className="text-xs mt-0.5">{"★".repeat(t.rating)}</p>
              </div>
              <span className="text-brand-dark font-medium text-sm shrink-0">Edit</span>
            </Link>
          ))}
          {testimonials.length === 0 && (
            <p className="p-8 text-center text-foreground/40 text-sm">No testimonials yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
