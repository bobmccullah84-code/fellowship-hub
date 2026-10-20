// Local-disk replacement for the Replit object storage sidecar.
// Public files live in UPLOADS_DIR (default: ./uploads) and are served at /public-objects/<name>.
import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";

export const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || "uploads");

export function ensureUploadsDir() {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/** Resolve a public object name to an absolute path inside UPLOADS_DIR, or null if it escapes the folder. */
export function resolvePublicObject(name: string): string | null {
  const full = path.resolve(UPLOADS_DIR, name);
  if (!full.startsWith(UPLOADS_DIR + path.sep)) return null;
  return full;
}

/** Save an uploaded file buffer and return its public URL. */
export async function savePublicObject(originalName: string, data: Buffer): Promise<{ publicUrl: string; filename: string }> {
  ensureUploadsDir();
  const ext = (path.extname(originalName) || "").toLowerCase().replace(/[^.a-z0-9]/g, "");
  const filename = `${Date.now()}_${randomBytes(4).toString("hex")}${ext}`;
  await fs.promises.writeFile(path.join(UPLOADS_DIR, filename), data);
  return { publicUrl: `/public-objects/${filename}`, filename };
}
