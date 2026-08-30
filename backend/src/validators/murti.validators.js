import { z } from "zod";

const nullableString = z.string().trim().min(1).nullable().optional();
const nullableNumber = z.coerce.number().nullable().optional();

export const createMurtiSchema = z.object({
  murti_id: z.string().trim().min(1),
  size: z.string().trim().min(1),
  final_price: z.coerce.number().nonnegative(),
  booking_status: z.enum(["available", "pending", "booked", "delivered"]).optional(),
  image: z.string().trim().optional(),
  customer_name: nullableString,
  customer_phone: nullableString,
  customer_email: nullableString,
  address: nullableString,
  paid_amount: nullableNumber,
  discount_price: nullableNumber,
  paid_amount_sc: nullableString,
  payment_mode: nullableString,
  suggestions: nullableString,
  booked_by: nullableString,
  booking_date: z.string().date().nullable().optional(),
  supplier: nullableString,
  murti_design: nullableString,
  stored_at: nullableString,
  roundup_amount: nullableNumber,
  images: z
    .array(
      z.object({
        image_ref: z.string().trim().min(1),
        sort_order: z.coerce.number().int().min(0).optional(),
      })
    )
    .optional(),
});

export const updateMurtiSchema = createMurtiSchema.partial();

export const bookingSchema = z.object({
  booked_by: z.string().trim().min(1),
  booking_status: z.enum(["pending", "booked"]),
  address: nullableString,
  customer_email: nullableString,
  customer_name: z.string().trim().min(1),
  customer_phone: z.string().trim().min(1),
  booking_date: z.string().date(),
  discount_price: nullableNumber,
  paid_amount: z.coerce.number().nonnegative(),
  payment_mode: z.string().trim().min(1),
  suggestions: nullableString,
  stored_at: nullableString,
});

export const deliverySchema = z.object({
  booking_status: z.literal("delivered"),
  roundup_amount: nullableNumber,
});

export const murtiImageSchema = z.object({
  image_ref: z.string().trim().min(1),
  sort_order: z.coerce.number().int().min(0).optional(),
});
