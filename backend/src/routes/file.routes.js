import { Router } from "express";
import path from "node:path";

import { pool } from "../config/db.js";
import { getRelativeUploadPath, resolveUploadedFile } from "../utils/uploadResolver.js";

const router = Router();
const UUID_SEARCH_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

const normalizeBaseUrl = (value) => String(value || "").trim().replace(/\/+$/, "");
const normalizePrefix = (value) =>
  String(value || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");

const buildS3Url = (absolutePath) => {
  const baseUrl = normalizeBaseUrl(process.env.S3_PUBLIC_BASE_URL);
  if (!baseUrl) return "";

  const relativePath = getRelativeUploadPath(absolutePath);
  const fileName = path.basename(relativePath);
  const folderAwareKey = normalizePrefix(process.env.S3_UPLOADS_PREFIX)
    ? `${normalizePrefix(process.env.S3_UPLOADS_PREFIX)}/${relativePath}`
    : relativePath;
  const flatKey = normalizePrefix(process.env.S3_UPLOADS_PREFIX)
    ? `${normalizePrefix(process.env.S3_UPLOADS_PREFIX)}/${fileName}`
    : fileName;

  const objectKey = process.env.S3_PRESERVE_UPLOAD_PATH === "true" ? folderAwareKey : flatKey;
  return `${baseUrl}/${objectKey.split("/").map(encodeURIComponent).join("/")}`;
};

const buildS3UrlFromObjectKey = (objectKey) => {
  const baseUrl = normalizeBaseUrl(process.env.S3_PUBLIC_BASE_URL);
  if (!baseUrl || !objectKey) return "";

  const normalizedKey = objectKey
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");

  return `${baseUrl}/${normalizedKey}`;
};

const extractUuid = (value) => {
  const match = String(value || "").match(UUID_SEARCH_PATTERN);
  return match ? match[0].toLowerCase() : "";
};

const buildObjectKey = (relativePath) => {
  const normalizedPath = String(relativePath || "")
    .split("/")
    .filter(Boolean)
    .join("/");
  if (!normalizedPath) return "";

  if (process.env.S3_PRESERVE_UPLOAD_PATH === "true") {
    const prefix = normalizePrefix(process.env.S3_UPLOADS_PREFIX);
    return prefix ? `${prefix}/${normalizedPath}` : normalizedPath;
  }

  const fileName = path.basename(normalizedPath);
  const prefix = normalizePrefix(process.env.S3_UPLOADS_PREFIX);
  return prefix ? `${prefix}/${fileName}` : fileName;
};

const maybeS3Exists = async (objectKey) => {
  const url = buildS3UrlFromObjectKey(objectKey);
  if (!url) return "";

  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
    });

    return response.ok ? url : "";
  } catch {
    return "";
  }
};

const getCandidateRelativePaths = async (uuid) => {
  const candidates = new Set();
  if (!uuid) return [];

  const murtiHistoryResult = await pool.query(
    `SELECT id, image, paid_amount_sc
     FROM murti_history
     WHERE image ILIKE $1 OR paid_amount_sc ILIKE $1`,
    [`%${uuid}%`]
  );

  for (const row of murtiHistoryResult.rows) {
    for (const extension of IMAGE_EXTENSIONS) {
      candidates.add(`murtis/murti_${row.id}_${uuid}${extension}`);
      candidates.add(`payments/payment_${row.id}_${uuid}${extension}`);
    }
  }

  const murtiImagesResult = await pool.query(
    `SELECT murti_history_id
     FROM murti_images
     WHERE image_ref = $1`,
    [uuid]
  );

  for (const row of murtiImagesResult.rows) {
    for (const extension of IMAGE_EXTENSIONS) {
      candidates.add(`murtis/murti-image_${row.murti_history_id}_${uuid}${extension}`);
    }
  }

  return [...candidates];
};

const resolveS3UrlFromValue = async (value) => {
  const uuid = extractUuid(value);
  if (!uuid) return "";

  const candidateRelativePaths = await getCandidateRelativePaths(uuid);

  for (const relativePath of candidateRelativePaths) {
    const objectKey = buildObjectKey(relativePath);
    const url = await maybeS3Exists(objectKey);
    if (url) return url;
  }

  return "";
};

router.get("/by-ref", async (req, res, next) => {
  try {
    const value = String(req.query.value || "").trim();

    if (!value) {
      return res.status(400).json({
        success: false,
        message: "Image reference is required",
      });
    }

    const resolvedFile = await resolveUploadedFile(value);

    if (resolvedFile) {
      const s3Url = buildS3Url(resolvedFile);
      if (s3Url) {
        return res.redirect(302, s3Url);
      }

      return res.sendFile(resolvedFile);
    }

    const directS3Url = await resolveS3UrlFromValue(value);
    if (directS3Url) {
      return res.redirect(302, directS3Url);
    }

    return res.status(404).json({
      success: false,
      message: "Image not found in local uploads or S3",
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
