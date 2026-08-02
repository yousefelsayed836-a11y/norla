import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { EGYPT_GOVERNORATES } from "./egypt-locations";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  let zonesUpdated = 0;
  let citiesUpdated = 0;

  for (const g of EGYPT_GOVERNORATES) {
    const zone = await prisma.shippingZone.findUnique({
      where: { governorate: g.name },
      include: { cities: true },
    });
    if (!zone) {
      console.warn(`No ShippingZone found for governorate "${g.name}" - skipping`);
      continue;
    }

    await prisma.shippingZone.update({
      where: { id: zone.id },
      data: { governorateAr: g.nameAr },
    });
    zonesUpdated++;

    for (const c of g.cities) {
      const match = zone.cities.find((existing) => existing.name === c.name);
      if (!match) {
        console.warn(`  No ShippingCity "${c.name}" under "${g.name}" - skipping`);
        continue;
      }
      await prisma.shippingCity.update({
        where: { id: match.id },
        data: { nameAr: c.nameAr },
      });
      citiesUpdated++;
    }
  }

  console.log(`Backfilled Arabic names: ${zonesUpdated} zones, ${citiesUpdated} cities.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
