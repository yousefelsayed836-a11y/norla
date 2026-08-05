import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatEGP } from "@/lib/format";

export default async function AdminShippingPage() {
  const zones = await prisma.shippingZone.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { cities: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Shipping Zones</h1>
      <p className="text-sm text-foreground/50 mb-8">
        Set the delivery fee for each governorate, or switch one off if you&apos;re not shipping
        there right now. Free shipping (above a certain order value) is configured in Settings.
      </p>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm hidden md:table">
          <thead>
            <tr className="text-left text-foreground/40 border-b border-brand-light/60">
              <th className="p-4 font-medium">Governorate</th>
              <th className="p-4 font-medium">Cities</th>
              <th className="p-4 font-medium">Fee</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z.id} className="border-b border-brand-light/40 last:border-0">
                <td className="p-4 font-medium">{z.governorate}</td>
                <td className="p-4 text-foreground/50">{z._count.cities}</td>
                <td className="p-4">{formatEGP(Number(z.fee))}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      z.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {z.active ? "Active" : "Closed"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/shipping/${z.id}`} className="text-brand-dark font-medium">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="md:hidden divide-y divide-brand-light/40">
          {zones.map((z) => (
            <Link
              key={z.id}
              href={`/admin/shipping/${z.id}`}
              className="p-4 flex items-center gap-3 active:bg-brand-light/20"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{z.governorate}</p>
                <p className="text-xs text-foreground/50">
                  {z._count.cities} cities · {formatEGP(Number(z.fee))}
                </p>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] ${
                    z.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {z.active ? "Active" : "Closed"}
                </span>
              </div>
              <span className="text-brand-dark font-medium text-sm shrink-0">Edit</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
