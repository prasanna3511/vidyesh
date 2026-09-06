import { pool } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  bookingSchema,
  createMurtiSchema,
  deliverySchema,
  murtiImageSchema,
  updateMurtiSchema,
} from "../validators/murti.validators.js";

const buildMurtiResponse = (row) => ({
  ...row,
  final_price: row.final_price === null ? null : Number(row.final_price),
  paid_amount: row.paid_amount === null ? null : Number(row.paid_amount),
  discount_price: row.discount_price === null ? null : Number(row.discount_price),
  roundup_amount: row.roundup_amount === null ? null : Number(row.roundup_amount),
});

const getMurtiByIdQuery = `
  SELECT *
  FROM murti_history
  WHERE id = $1
`;

const ensureMurtiExists = async (id) => {
  const result = await pool.query(getMurtiByIdQuery, [id]);
  const murti = result.rows[0];

  if (!murti) {
    throw new ApiError(404, "Murti not found");
  }

  return murti;
};

export const listMurtis = asyncHandler(async (req, res) => {
  const { status, size, design, storedAt, search } = req.query;
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`booking_status = $${values.length}`);
  }

  if (size) {
    values.push(size);
    conditions.push(`size = $${values.length}`);
  }

  if (design) {
    values.push(design);
    conditions.push(`murti_design = $${values.length}`);
  }

  if (storedAt) {
    values.push(storedAt);
    conditions.push(`stored_at = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(murti_id ILIKE $${values.length} OR customer_email ILIKE $${values.length} OR size ILIKE $${values.length})`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT *
    FROM murti_history
    ${whereClause}
    ORDER BY created_at DESC, id DESC
  `;

  const result = await pool.query(query, values);

  res.json({
    success: true,
    data: result.rows.map(buildMurtiResponse),
  });
});

export const getMurtiById = asyncHandler(async (req, res) => {
  const murti = await ensureMurtiExists(req.params.id);

  const imagesResult = await pool.query(
    `SELECT id, murti_history_id, image_ref, sort_order, created_at
     FROM murti_images
     WHERE murti_history_id = $1
     ORDER BY sort_order ASC, id ASC`,
    [req.params.id]
  );

  res.json({
    success: true,
    data: {
      ...buildMurtiResponse(murti),
      images: imagesResult.rows,
    },
  });
});

export const createMurti = asyncHandler(async (req, res) => {
  const payload = createMurtiSchema.parse(req.body);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const insertMurtiResult = await client.query(
      `INSERT INTO murti_history (
        murti_id, size, final_price, booking_status, image, customer_name,
        customer_phone, customer_email, address, paid_amount, discount_price,
        paid_amount_sc, payment_mode, suggestions, booked_by, booking_date,
        supplier, murti_design, stored_at, roundup_amount
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16,
        $17, $18, $19, $20
      )
      RETURNING *`,
      [
        payload.murti_id,
        payload.size,
        payload.final_price,
        payload.booking_status || "available",
        payload.image || null,
        payload.customer_name ?? null,
        payload.customer_phone ?? null,
        payload.customer_email ?? null,
        payload.address ?? null,
        payload.paid_amount ?? null,
        payload.discount_price ?? null,
        payload.paid_amount_sc ?? null,
        payload.payment_mode ?? null,
        payload.suggestions ?? null,
        payload.booked_by ?? null,
        payload.booking_date ?? null,
        payload.supplier ?? null,
        payload.murti_design ?? null,
        payload.stored_at ?? null,
        payload.roundup_amount ?? null,
      ]
    );

    const murti = insertMurtiResult.rows[0];

    if (payload.images?.length) {
      for (const image of payload.images) {
        await client.query(
          `INSERT INTO murti_images (murti_history_id, image_ref, sort_order)
           VALUES ($1, $2, $3)`,
          [murti.id, image.image_ref, image.sort_order || 0]
        );
      }
    }

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      data: buildMurtiResponse(murti),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505") {
      throw new ApiError(409, "A murti with this murti_id already exists");
    }
    throw error;
  } finally {
    client.release();
  }
});

export const updateMurti = asyncHandler(async (req, res) => {
  await ensureMurtiExists(req.params.id);
  const payload = updateMurtiSchema.parse(req.body);
  const entries = Object.entries(payload).filter(([key]) => key !== "images");

  if (!entries.length) {
    throw new ApiError(400, "No murti fields provided to update");
  }

  const values = [];
  const setClauses = entries.map(([key, value], index) => {
    values.push(value ?? null);
    return `${key} = $${index + 1}`;
  });
  values.push(req.params.id);

  const result = await pool.query(
    `UPDATE murti_history
     SET ${setClauses.join(", ")}
     WHERE id = $${values.length}
     RETURNING *`,
    values
  );

  res.json({
    success: true,
    data: buildMurtiResponse(result.rows[0]),
  });
});

export const deleteMurti = asyncHandler(async (req, res) => {
  await ensureMurtiExists(req.params.id);

  await pool.query(`DELETE FROM murti_history WHERE id = $1`, [req.params.id]);

  res.json({
    success: true,
    message: "Murti deleted successfully",
  });
});

export const updateBooking = asyncHandler(async (req, res) => {
  await ensureMurtiExists(req.params.id);
  const payload = bookingSchema.parse(req.body);

  const result = await pool.query(
    `UPDATE murti_history
     SET booked_by = $1,
         booking_status = $2,
         address = $3,
         customer_email = $4,
         customer_name = $5,
         customer_phone = $6,
         booking_date = $7,
         discount_price = $8,
         paid_amount = $9,
         payment_mode = $10,
         suggestions = $11,
         stored_at = $12
     WHERE id = $13
     RETURNING *`,
    [
      payload.booked_by,
      payload.booking_status,
      payload.address ?? null,
      payload.customer_email ?? null,
      payload.customer_name,
      payload.customer_phone,
      payload.booking_date,
      payload.discount_price ?? null,
      payload.paid_amount,
      payload.payment_mode,
      payload.suggestions ?? null,
      payload.stored_at ?? null,
      req.params.id,
    ]
  );

  res.json({
    success: true,
    data: buildMurtiResponse(result.rows[0]),
  });
});

export const updateDelivery = asyncHandler(async (req, res) => {
  await ensureMurtiExists(req.params.id);
  const payload = deliverySchema.parse(req.body);

  const result = await pool.query(
    `UPDATE murti_history
     SET booking_status = $1,
         roundup_amount = $2,
         paid_amount = COALESCE(paid_amount, 0) - COALESCE(roundup_amount, 0) + COALESCE($2, 0)
     WHERE id = $3
     RETURNING *`,
    [payload.booking_status, payload.roundup_amount ?? null, req.params.id]
  );

  res.json({
    success: true,
    data: buildMurtiResponse(result.rows[0]),
  });
});

export const listMurtiImages = asyncHandler(async (req, res) => {
  await ensureMurtiExists(req.params.id);

  const result = await pool.query(
    `SELECT id, murti_history_id, image_ref, sort_order, created_at
     FROM murti_images
     WHERE murti_history_id = $1
     ORDER BY sort_order ASC, id ASC`,
    [req.params.id]
  );

  res.json({
    success: true,
    data: result.rows,
  });
});

export const addMurtiImage = asyncHandler(async (req, res) => {
  await ensureMurtiExists(req.params.id);
  const payload = murtiImageSchema.parse(req.body);

  const result = await pool.query(
    `INSERT INTO murti_images (murti_history_id, image_ref, sort_order)
     VALUES ($1, $2, $3)
     RETURNING id, murti_history_id, image_ref, sort_order, created_at`,
    [req.params.id, payload.image_ref, payload.sort_order || 0]
  );

  res.status(201).json({
    success: true,
    data: result.rows[0],
  });
});

export const deleteMurtiImage = asyncHandler(async (req, res) => {
  await ensureMurtiExists(req.params.id);

  const result = await pool.query(
    `DELETE FROM murti_images
     WHERE murti_history_id = $1 AND id = $2
     RETURNING id`,
    [req.params.id, req.params.imageId]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Murti image not found");
  }

  res.json({
    success: true,
    message: "Murti image deleted successfully",
  });
});
