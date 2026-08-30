import { Router } from "express";

import { resolveUploadedFile } from "../utils/uploadResolver.js";

const router = Router();

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

    return res.sendFile(resolvedFile);
  } catch (error) {
    return next(error);
  }
});

export default router;
