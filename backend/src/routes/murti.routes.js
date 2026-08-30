import { Router } from "express";
import {
  addMurtiImage,
  createMurti,
  deleteMurti,
  deleteMurtiImage,
  getMurtiById,
  listMurtiImages,
  listMurtis,
  updateBooking,
  updateDelivery,
  updateMurti,
} from "../controllers/murti.controller.js";

const router = Router();

router.get("/", listMurtis);
router.get("/:id", getMurtiById);
router.post("/", createMurti);
router.patch("/:id", updateMurti);
router.delete("/:id", deleteMurti);

router.patch("/:id/booking", updateBooking);
router.patch("/:id/delivery", updateDelivery);

router.get("/:id/images", listMurtiImages);
router.post("/:id/images", addMurtiImage);
router.delete("/:id/images/:imageId", deleteMurtiImage);

export default router;
