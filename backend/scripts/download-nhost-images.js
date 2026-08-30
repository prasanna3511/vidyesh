import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(backendRoot, ".env") });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_SEARCH_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

const uploadsRoot = path.join(backendRoot, "uploads");
const murtiDir = path.join(uploadsRoot, "murtis");
const paymentDir = path.join(uploadsRoot, "payments");
const miscDir = path.join(uploadsRoot, "misc");
const downloadsDir = path.join(os.homedir(), "Downloads");

const sanitizeFilename = (value) =>
  String(value)
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getExtensionFromContentType = (contentType) => {
  if (!contentType) return ".bin";
  if (contentType.includes("jpeg")) return ".jpg";
  if (contentType.includes("jpg")) return ".jpg";
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";
  if (contentType.includes("pdf")) return ".pdf";
  return ".bin";
};

const normalizeBaseUrl = (url) => {
  if (!url) return "";
  return String(url).replace(/\/+$/, "");
};

const extractUuid = (value) => {
  const match = String(value || "").match(UUID_SEARCH_PATTERN);
  return match ? match[0].toLowerCase() : "";
};

const parseCsvLine = (line) => {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
};

const readCsvRows = async (filePath) => {
  const content = await fs.readFile(filePath, "utf8");
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] ?? "";
      return row;
    }, {});
  });
};

const findLatestExport = async (prefix) => {
  try {
    const entries = await fs.readdir(downloadsDir);
    const matches = entries
      .filter((name) => name.startsWith(prefix) && name.endsWith(".csv"))
      .sort()
      .reverse();

    return matches.length ? path.join(downloadsDir, matches[0]) : null;
  } catch {
    return null;
  }
};

const getBaseStorageUrl = (rows) => {
  const explicitBase = normalizeBaseUrl(process.env.NHOST_STORAGE_BASE_URL);
  if (explicitBase) return explicitBase;

  const firstUrl = rows.find((row) => typeof row.source_value === "string" && row.source_value.startsWith("http"));
  if (!firstUrl) return "";

  const match = firstUrl.source_value.match(/^(https:\/\/.+?\/v1\/files)/i);
  return match ? match[1] : "";
};

const toDownloadUrl = (value, baseStorageUrl) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (UUID_PATTERN.test(value) && baseStorageUrl) {
    return `${baseStorageUrl}/${value}`;
  }
  return null;
};

const collectReferences = async () => {
  const queries = [
    {
      kind: "murti",
      folder: murtiDir,
      sql: `
        SELECT
          id::text AS record_id,
          'murti_history.image' AS source_field,
          image AS source_value
        FROM murti_history
        WHERE image IS NOT NULL AND BTRIM(image) <> ''
      `,
    },
    {
      kind: "payment",
      folder: paymentDir,
      sql: `
        SELECT
          id::text AS record_id,
          'murti_history.paid_amount_sc' AS source_field,
          paid_amount_sc AS source_value
        FROM murti_history
        WHERE paid_amount_sc IS NOT NULL AND BTRIM(paid_amount_sc) <> ''
      `,
    },
    {
      kind: "murti-image",
      folder: murtiDir,
      sql: `
        SELECT
          murti_history_id::text AS record_id,
          'murti_images.image_ref' AS source_field,
          image_ref AS source_value
        FROM murti_images
        WHERE image_ref IS NOT NULL AND BTRIM(image_ref) <> ''
      `,
    },
  ];

  const all = [];
  for (const query of queries) {
    const result = await pool.query(query.sql);
    for (const row of result.rows) {
      all.push({
        ...row,
        kind: query.kind,
        folder: query.folder,
      });
    }
  }

  return all;
};

const collectCsvReferences = async () => {
  const murtiImagesCsv =
    process.env.MURTI_IMAGES_CSV_PATH ||
    (await findLatestExport("export_public_murti_images_"));
  const murtiHistoryCsv =
    process.env.MURTI_HISTORY_CSV_PATH ||
    (await findLatestExport("export_public_murti_history_"));

  const references = [];

  if (murtiImagesCsv) {
    const rows = await readCsvRows(murtiImagesCsv);
    for (const row of rows) {
      const sourceValue = extractUuid(row.image_id);
      if (!sourceValue) continue;

      references.push({
        record_id: String(row.murti_id || row.id || "").trim(),
        source_field: "csv.murti_images.image_id",
        source_value: sourceValue,
        kind: "murti-image",
        folder: murtiDir,
      });
    }
  }

  if (murtiHistoryCsv) {
    const rows = await readCsvRows(murtiHistoryCsv);
    for (const row of rows) {
      const recordId = String(row.id || row.murti_id || "").trim();
      const murtiImage = extractUuid(row.image);
      const paymentImage = extractUuid(row.paid_amount_sc);

      if (murtiImage) {
        references.push({
          record_id: recordId,
          source_field: "csv.murti_history.image",
          source_value: murtiImage,
          kind: "murti",
          folder: murtiDir,
        });
      }

      if (paymentImage) {
        references.push({
          record_id: recordId,
          source_field: "csv.murti_history.paid_amount_sc",
          source_value: paymentImage,
          kind: "payment",
          folder: paymentDir,
        });
      }
    }
  }

  return {
    references,
    murtiImagesCsv,
    murtiHistoryCsv,
  };
};

const getExistingLocalIds = async () => {
  const existingIds = new Set();

  for (const directory of [murtiDir, paymentDir, miscDir]) {
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile()) continue;
        const uuid = extractUuid(entry.name);
        if (uuid) existingIds.add(uuid);
      }
    } catch {
      // Ignore missing folders.
    }
  }

  return existingIds;
};

const downloadOne = async ({ url, folder, filenameBase }) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const extension = getExtensionFromContentType(contentType);
  const targetPath = path.join(folder, `${filenameBase}${extension}`);
  const bytes = Buffer.from(await response.arrayBuffer());

  await fs.writeFile(targetPath, bytes);

  return {
    targetPath,
    contentType,
    bytes: bytes.length,
  };
};

const run = async () => {
  await fs.mkdir(murtiDir, { recursive: true });
  await fs.mkdir(paymentDir, { recursive: true });
  await fs.mkdir(miscDir, { recursive: true });

  const dbReferences = await collectReferences();
  const csvResult = await collectCsvReferences();
  const references = [...dbReferences, ...csvResult.references];
  const baseStorageUrl = getBaseStorageUrl(references);
  const existingLocalIds = await getExistingLocalIds();

  const uniqueDownloads = new Map();

  for (const ref of references) {
    const sourceValue = String(ref.source_value || "").trim();
    const url = toDownloadUrl(sourceValue, baseStorageUrl);
    const sourceUuid = extractUuid(sourceValue);

    if (!url) continue;
    if (sourceUuid && existingLocalIds.has(sourceUuid)) continue;

    const rawNamePart =
      UUID_PATTERN.test(sourceValue)
        ? sourceValue
        : sourceValue.split("/").pop()?.split("?")[0] || `${ref.kind}_${ref.record_id}`;

    const filenameBase = sanitizeFilename(
      `${ref.kind}_${ref.record_id}_${rawNamePart || "file"}`
    );

    if (!uniqueDownloads.has(url)) {
      uniqueDownloads.set(url, {
        url,
        folder: ref.folder || miscDir,
        filenameBase,
        sources: [],
      });
    }

    uniqueDownloads.get(url).sources.push({
      record_id: ref.record_id,
      source_field: ref.source_field,
      source_value: sourceValue,
    });
  }

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of uniqueDownloads.values()) {
    try {
      const result = await downloadOne(item);
      downloaded += 1;
      console.log(
        JSON.stringify({
          status: "downloaded",
          url: item.url,
          saved_to: result.targetPath,
          bytes: result.bytes,
          sources: item.sources,
        })
      );
    } catch (error) {
      failed += 1;
      console.error(
        JSON.stringify({
          status: "failed",
          url: item.url,
          reason: error.message,
          sources: item.sources,
        })
      );
    }
  }

  skipped = references.length - uniqueDownloads.size;

  console.log(
    JSON.stringify({
      summary: {
        totalReferences: references.length,
        dbReferences: dbReferences.length,
        csvReferences: csvResult.references.length,
        uniqueDownloadUrls: uniqueDownloads.size,
        downloaded,
        failed,
        skippedNonDownloadable: skipped,
        skippedAlreadyPresent: existingLocalIds.size,
        uploadsRoot,
        baseStorageUrl: baseStorageUrl || null,
        murtiImagesCsv: csvResult.murtiImagesCsv,
        murtiHistoryCsv: csvResult.murtiHistoryCsv,
      },
    })
  );
};

run()
  .catch((error) => {
    console.error("Download script failed:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
