// Creates an admin user, or promotes/resets an existing one.
// Usage: DATABASE_URL=... npx tsx script/create-admin.ts <email> <password> [firstName] [lastName]
import pg from "pg";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  const [email, password, firstName = "Site", lastName = "Admin"] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Usage: create-admin.ts <email> <password> [firstName] [lastName]");
    process.exit(1);
  }
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const hash = await hashPassword(password);
  const username = email.split("@")[0];
  const res = await client.query(
    `INSERT INTO users (username, email, password, first_name, last_name, is_admin)
     VALUES ($1, $2, $3, $4, $5, true)
     ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, is_admin = true
     RETURNING id, email`,
    [username, email, hash, firstName, lastName],
  );
  console.log("Admin ready:", res.rows[0].email);
  await client.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
