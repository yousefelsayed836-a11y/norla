/**
 * Run on the server:
 *   cd /var/www/norladesigns && node scripts/seed-turbo-zones.mjs
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const require = createRequire(import.meta.url);

// ── Load .env ─────────────────────────────────────────────────────────────
try {
  const envText = readFileSync(join(root, ".env"), "utf8");
  for (const line of envText.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* rely on env vars */ }

// ── pg client ─────────────────────────────────────────────────────────────
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── Turbo ─────────────────────────────────────────────────────────────────
const BASE_URL = "https://platform.turbo.info/external-api";
const API_KEY   = process.env.TURBO_API_KEY;
const CLIENT_CODE = process.env.TURBO_CLIENT_CODE;

const GOVERNORATE_AR = {
  Cairo:"القاهرة", Giza:"الجيزة", Alexandria:"الإسكندرية",
  Qalyubia:"القليوبية", "Port Said":"بورسعيد", Suez:"السويس",
  Dakahlia:"الدقهلية", Sharqia:"الشرقية", Gharbia:"الغربية",
  Monufia:"المنوفية", Beheira:"البحيرة", Ismailia:"الإسماعيلية",
  "Kafr El Sheikh":"كفر الشيخ", Damietta:"دمياط", Faiyum:"الفيوم",
  "Beni Suef":"بني سويف", Minya:"المنيا", Asyut:"أسيوط",
  Sohag:"سوهاج", Qena:"قنا", Luxor:"الأقصر", Aswan:"أسوان",
  "Red Sea":"البحر الأحمر", "New Valley":"الوادي الجديد",
  Matrouh:"مطروح", "North Sinai":"شمال سيناء", "South Sinai":"جنوب سيناء",
};

const TURBO_IDS = {
  Cairo:1, Giza:2, Sharqia:3, Dakahlia:4, Beheira:5, Minya:6,
  Qalyubia:7, Alexandria:8, Gharbia:9, Sohag:10, Asyut:11,
  Monufia:12, "Kafr El Sheikh":13, Faiyum:14, Qena:15, "Beni Suef":16,
  Aswan:17, Damietta:18, Ismailia:19, Luxor:20, "Port Said":21,
  Suez:22, Matrouh:23, "North Sinai":24, "Red Sea":25,
  "New Valley":26, "South Sinai":27,
};

async function getAreas(govId) {
  const url = new URL(`${BASE_URL}/get-area/${govId}`);
  url.searchParams.set("authentication_key", API_KEY);
  url.searchParams.set("main_client_code", CLIENT_CODE);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!data.success) return [];
  return (data.feed || []).map(a => a.name);
}

async function main() {
  if (!API_KEY || !CLIENT_CODE) {
    console.error("❌ TURBO_API_KEY or TURBO_CLIENT_CODE not set in .env");
    process.exit(1);
  }

  const client = await pool.connect();
  let totalCities = 0;

  try {
    for (const [gov, govId] of Object.entries(TURBO_IDS)) {
      const ar = GOVERNORATE_AR[gov] ?? gov;
      process.stdout.write(`  ${ar} ... `);

      try {
        // Upsert zone
        const zoneRes = await client.query(
          `INSERT INTO "ShippingZone" (id, governorate, "governorateAr", fee, active, position)
           VALUES (gen_random_uuid()::text, $1, $2, 0, true, $3)
           ON CONFLICT (governorate) DO UPDATE SET "governorateAr" = $2
           RETURNING id`,
          [gov, ar, govId]
        );
        const zoneId = zoneRes.rows[0].id;

        // Fetch areas from Turbo
        const areas = await getAreas(govId);

        // Replace cities
        await client.query(`DELETE FROM "ShippingCity" WHERE "zoneId" = $1`, [zoneId]);
        for (const name of areas) {
          await client.query(
            `INSERT INTO "ShippingCity" (id, "zoneId", name, "nameAr") VALUES (gen_random_uuid()::text, $1, $2, $2)`,
            [zoneId, name]
          );
        }

        totalCities += areas.length;
        console.log(`✓ ${areas.length} areas`);
      } catch (err) {
        console.log(`✗ ${err.message}`);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }

  console.log(`\nDone — ${Object.keys(TURBO_IDS).length} governorates, ${totalCities} cities total`);
}

main();
