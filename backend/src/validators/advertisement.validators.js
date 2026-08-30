import { z } from "zod";

export const advertisementSchema = z.object({
  title: z.string().trim().min(1),
  message: z.string().trim().min(1),
  placement: z.enum(["general", "upper", "lower"]).optional(),
});

export const updateAdvertisementSchema = advertisementSchema.partial();
