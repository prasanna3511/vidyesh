import { Router } from "express";
import path from "node:path";

import { getRelativeUploadPath, resolveUploadedFile } from "../utils/uploadResolver.js";

const router = Router();

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

    if (!resolvedFile) {
      return res.status(404).json({
        success: false,
        message: "Image not found in local uploads",
      });
    }

    const s3Url = buildS3Url(resolvedFile);
    if (s3Url) {
      return res.redirect(302, s3Url);
    }

    return res.sendFile(resolvedFile);
  } catch (error) {
    return next(error);
  }
});

export default router;
