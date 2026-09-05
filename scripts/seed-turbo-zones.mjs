/**
 * Run on the server:
 *   cd /var/www/norladesigns && node scripts/seed-turbo-zones.mjs
 */

import { createRequire } from "module";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// ── Load .env manually (no dotenv dependency needed) ──────────────────────
const envPath = join(root, ".env");
try {
  const envText = readFileSync(envPath, "utf8");
  for (const line of envText.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  console.warn("No .env file found — relying on environment variables");
}

// ── Prisma client ─────────────────────────────────────────────────────────
const require = createRequire(import.meta.url);
const { PrismaClient } = require(join(root, "src/generated/prisma"));
const prisma = new PrismaClient();

// ── Turbo config ──────────────────────────────────────────────────────────
const BASE_URL = "https://platform.turbo.info/external-api";
const API_KEY = process.env.TURBO_API_KEY;
const CLIENT_CODE = process.env.TURBO_CLIENT_CODE;

const GOVERNORATE_AR = {
  Cairo: "القاهرة", Giza: "الجيزة", Alexandria: "الإسكندرية",
  Qalyubia: "القليوبية", "Port Said": "بورسعيد", Suez: "السويس",
  Dakahlia: "الدقهلية", Sharqia: "الشرقية", Gharbia: "الغربية",
  Monufia: "المنوفية", Beheira: "البحيرة", Ismailia: "الإسماعيلية",
  "Kafr El Sheikh": "كفر الشيخ", Damietta: "دمياط", Faiyum: "الفيوم",
  "Beni Suef": "بني سويف", Minya: "المنيا", Asyut: "أسيوط",
  Sohag: "سوهاج", Qena: "قنا", Luxor: "الأقصر", Aswan: "أسوان",
  "Red Sea": "البحر الأحمر", "New Valley": "الوادي الجديد",
  Matrouh: "مطروح", "North Sinai": "شمال سيناء", "South Sinai": "جنوب سيناء",
};

const TURBO_GOVERNMENT_ID = {
  Cairo: 1, Giza: 2, Sharqia: 3, Dakahlia: 4, Beheira: 5, Minya: 6,
  Qalyubia: 7, Alexandria: 8, Gharbia: 9, Sohag: 10, Asyut: 11,
  Monufia: 12, "Kafr El Sheikh": 13, Faiyum: 14, Qena: 15, "Beni Suef": 16,
  Aswan: 17, Damietta: 18, Ismailia: 19, Luxor: 20, "Port Said": 21,
  Suez: 22, Matrouh: 23, "North Sinai": 24, "Red Sea": 25,
  "New Valley": 26, "South Sinai": 27,
};

async function getAreas(governmentId) {
  const url = new URL(`${BASE_URL}/get-area/${governmentId}`);
  url.searchParams.set("authentication_key", API_KEY);
  url.searchParams.set("main_client_code", CLIENT_CODE);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!data.success) return [];
  return (data.feed || []).map((a) => ({ id: a.id, name: a.name }));
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  if (!API_KEY || !CLIENT_CODE) {
    console.error("❌ TURBO_API_KEY or TURBO_CLIENT_CODE not set");
    process.exit(1);
  }

  let totalCities = 0;
  const entries = Object.entries(TURBO_GOVERNMENT_ID);

  for (const [governorate, governmentId] of entries) {
    process.stdout.write(`  ${GOVERNORATE_AR[governorate]} (${governorate}) ... `);

    try {
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

      const areas = await getAreas(governmentId);

      await prisma.shippingCity.deleteMany({ where: { zoneId: zone.id } });
      if (areas.length > 0) {
        await prisma.shippingCity.createMany({
          data: areas.map((a) => ({ zoneId: zone.id, name: a.name, nameAr: a.name })),
        });
      }

      totalCities += areas.length;
      console.log(`✓ ${areas.length} areas`);
    } catch (err) {
      console.log(`✗ ${err.message}`);
    }
  }

  console.log(`\nDone — ${entries.length} governorates, ${totalCities} cities total`);
}

main().finally(() => prisma.$disconnect());
