/**
 * Adds custom areas not in Turbo (e.g. outskirts) to specific zones.
 * Run on server: cd /var/www/norladesigns && node scripts/add-extra-areas.mjs
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const require = createRequire(import.meta.url);

// Load .env
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

const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Extra areas to add: { governorate (English) => [area names in Arabic] }
const EXTRA_AREAS = {
  Cairo: ["أطراف القاهرة"],
  Giza:  ["أطراف الجيزة"],
};

async function main() {
  const client = await pool.connect();
  try {
    for (const [gov, areas] of Object.entries(EXTRA_AREAS)) {
      const zoneRes = await client.query(
        `SELECT id FROM "ShippingZone" WHERE governorate = $1`,
        [gov]
      );
      if (zoneRes.rows.length === 0) {
        console.log(`⚠️  Zone not found: ${gov}`);
        continue;
      }
      const zoneId = zoneRes.rows[0].id;

      for (const name of areas) {
        // Skip if already exists
        const exists = await client.query(
          `SELECT id FROM "ShippingCity" WHERE "zoneId" = $1 AND name = $2`,
          [zoneId, name]
        );
        if (exists.rows.length > 0) {
          console.log(`  already exists: ${name}`);
          continue;
        }
        await client.query(
          `INSERT INTO "ShippingCity" (id, "zoneId", name, "nameAr") VALUES (gen_random_uuid()::text, $1, $2, $2)`,
          [zoneId, name]
        );
        console.log(`  ✓ added: ${name} → ${gov}`);
      }
    }
    console.log("\nDone.");
  } finally {
    client.release();
    await pool.end();
  }
}

main();
