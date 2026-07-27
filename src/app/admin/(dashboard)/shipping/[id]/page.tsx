import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ShippingZoneForm from "@/components/ShippingZoneForm";

export default async function EditShippingZonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const zone = await prisma.shippingZone.findUnique({
    where: { id },
    include: { cities: { orderBy: { name: "asc" } } },
  });
  if (!zone) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">{zone.governorate}</h1>
      <ShippingZoneForm
        zoneId={zone.id}
        governorate={zone.governorate}
        initialFee={String(zone.fee)}
        initialActive={zone.active}
        initialCities={zone.cities.map((c) => c.name)}
      />
    </div>
  );
}
