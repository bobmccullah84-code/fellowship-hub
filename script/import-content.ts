// Loads deploy/content/*.json (exported from Replit) into PostgreSQL, keeping original IDs.
// Usage: DATABASE_URL=... npx tsx script/import-content.ts [contentDir]
// Replaces existing rows in teachings, courses, lessons, projects and site_settings.
import fs from "fs";
import path from "path";
import pg from "pg";

const dir = path.resolve(process.argv[2] || "deploy/content");
const order = ["site_settings", "teachings", "courses", "lessons", "projects"];

async function main() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query("BEGIN");
    await client.query(`TRUNCATE ${[...order].reverse().join(", ")} CASCADE`);
    for (const table of order) {
      const file = path.join(dir, `${table}.json`);
      if (!fs.existsSync(file)) continue;
      const rows: Record<string, unknown>[] = JSON.parse(fs.readFileSync(file, "utf8"));
      for (const row of rows) {
        const cols = Object.keys(row);
        const vals = cols.map((c) => {
          const v = row[c];
          return v !== null && typeof v === "object" && !Array.isArray(v) ? JSON.stringify(v) : v;
        });
        const sql = `INSERT INTO ${table} (${cols.map((c) => `"${c}"`).join(", ")}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(", ")})`;
        await client.query(sql, vals);
      }
      console.log(`${table}: ${rows.length} rows`);
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    await client.end();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
