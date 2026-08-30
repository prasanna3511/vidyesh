import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "../..");

const uploadsRoot = path.join(backendRoot, "uploads");
const uploadDirs = [
  path.join(uploadsRoot, "murtis"),
  path.join(uploadsRoot, "payments"),
  path.join(uploadsRoot, "misc"),
];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const toLookupKey = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  if (UUID_PATTERN.test(raw)) {
    return raw;
  }

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      return path.basename(url.pathname);
    } catch {
      return raw;
    }
  }

  return path.basename(raw);
};

const findMatchingFile = async (directory, lookupKey) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const fullPath = path.join(directory, entry.name);
    const parsed = path.parse(entry.name);

    if (
      entry.name === lookupKey ||
      parsed.name === lookupKey ||
      entry.name.endsWith(`_${lookupKey}`) ||
      parsed.name.endsWith(`_${lookupKey}`)
    ) {
      return fullPath;
    }
  }

  return null;
};

export const resolveUploadedFile = async (value) => {
  const lookupKey = toLookupKey(value);
  if (!lookupKey) return null;

  for (const directory of uploadDirs) {
    try {
      const match = await findMatchingFile(directory, lookupKey);
      if (match) return match;
    } catch {
      // Skip missing upload directories and continue checking the rest.
    }
  }

  return null;
};

export { uploadsRoot };
