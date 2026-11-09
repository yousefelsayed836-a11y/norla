import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getTurboAreas, TURBO_GOVERNMENT_ID } from "@/lib/turbo";

// Arabic names for all 27 governorates
const GOVERNORATE_AR: Record<string, string> = {
  Cairo: "القاهرة",
  Giza: "الجيزة",
  Alexandria: "الإسكندرية",
  Qalyubia: "القليوبية",
  "Port Said": "بورسعيد",
  Suez: "السويس",
  Dakahlia: "الدقهلية",
  Sharqia: "الشرقية",
  Gharbia: "الغربية",
  Monufia: "المنوفية",
  Beheira: "البحيرة",
  Ismailia: "الإسماعيلية",
  "Kafr El Sheikh": "كفر الشيخ",
  Damietta: "دمياط",
  Faiyum: "الفيوم",
  "Beni Suef": "بني سويف",
  Minya: "المنيا",
  Asyut: "أسيوط",
  Sohag: "سوهاج",
  Qena: "قنا",
  Luxor: "الأقصر",
  Aswan: "أسوان",
  "Red Sea": "البحر الأحمر",
  "New Valley": "الوادي الجديد",
  Matrouh: "مطروح",
  "North Sinai": "شمال سيناء",
  "South Sinai": "جنوب سيناء",
};

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const results: { governorate: string; cities: number; status: string }[] = [];

  for (const [governorate, governmentId] of Object.entries(TURBO_GOVERNMENT_ID)) {
    try {
      // Upsert the shipping zone
      const zone = await prisma.shippingZone.upsert({
        where: { governorate },
        update: { governorateAr: GOVERNORATE_AR[governorate] ?? null },
        create: {
          governorate,
          governorateAr: GOVERNORATE_AR[governorate] ?? null,
          fee: 0,
          active: true,
          position: governmentId,
        },
      });

      // Fetch areas from Turbo
      const areas = await getTurboAreas(governmentId);

      // Delete existing cities and recreate
      await prisma.shippingCity.deleteMany({ where: { zoneId: zone.id } });
      if (areas.length > 0) {
        await prisma.shippingCity.createMany({
          data: areas.map((a) => ({
            zoneId: zone.id,
            name: a.name,
            nameAr: a.name,
          })),
        });
      }

      results.push({ governorate, cities: areas.length, status: "ok" });
    } catch (err) {
      results.push({
        governorate,
        cities: 0,
        status: err instanceof Error ? err.message : "error",
      });
    }
  }

  // Re-add extra cities that should always exist after a sync
  const EXTRA = [
    { governorate: "Cairo", name: "أطراف القاهرة" },
    { governorate: "Giza", name: "أطراف الجيزة" },
  ];
  for (const { governorate, name } of EXTRA) {
    const zone = await prisma.shippingZone.findFirst({ where: { governorate } });
    if (!zone) continue;
    const exists = await prisma.shippingCity.findFirst({ where: { zoneId: zone.id, name } });
    if (!exists) {
      await prisma.shippingCity.create({ data: { zoneId: zone.id, name, nameAr: name } });
    }
  }

  return NextResponse.json({ results });
}
