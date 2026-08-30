import { Router } from "express";

import advertisementRoutes from "./advertisement.routes.js";
import authRoutes from "./auth.routes.js";
import fileRoutes from "./file.routes.js";
import healthRoutes from "./health.routes.js";
import murtiRoutes from "./murti.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/files", fileRoutes);
router.use("/murtis", murtiRoutes);
router.use("/advertisements", advertisementRoutes);

export default router;
