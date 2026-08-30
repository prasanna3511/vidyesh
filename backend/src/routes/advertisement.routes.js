import { Router } from "express";
import {
  createAdvertisement,
  deleteAdvertisement,
  getLatestAdvertisement,
  listAdvertisements,
  updateAdvertisement,
} from "../controllers/advertisement.controller.js";

const router = Router();

router.get("/", listAdvertisements);
router.get("/latest", getLatestAdvertisement);
router.post("/", createAdvertisement);
router.patch("/:id", updateAdvertisement);
router.delete("/:id", deleteAdvertisement);

export default router;
