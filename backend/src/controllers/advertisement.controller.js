import { pool } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  advertisementSchema,
  updateAdvertisementSchema,
} from "../validators/advertisement.validators.js";

const normalizeAdvertisement = (row) => row;

const ensureAdvertisementExists = async (id) => {
  const result = await pool.query(
    `SELECT * FROM advertisement_messages WHERE id = $1`,
    [id]
  );

  if (!result.rows[0]) {
    throw new ApiError(404, "Advertisement message not found");
  }

  return result.rows[0];
};

export const listAdvertisements = asyncHandler(async (req, res) => {
  const { placement } = req.query;
  const values = [];
  let whereClause = "";

  if (placement) {
    values.push(placement);
    whereClause = `WHERE placement = $1`;
  }

  const result = await pool.query(
    `SELECT *
     FROM advertisement_messages
     ${whereClause}
     ORDER BY created_at DESC, id DESC`,
    values
  );

  res.json({
    success: true,
    data: result.rows.map(normalizeAdvertisement),
  });
});

export const getLatestAdvertisement = asyncHandler(async (req, res) => {
  const { placement } = req.query;
  const values = [];
  let whereClause = "";

  if (placement) {
    values.push(placement);
    whereClause = `WHERE placement = $1`;
  }

  const result = await pool.query(
    `SELECT *
     FROM advertisement_messages
     ${whereClause}
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
    values
  );

  res.json({
    success: true,
    data: result.rows[0] || null,
  });
});

export const createAdvertisement = asyncHandler(async (req, res) => {
  const payload = advertisementSchema.parse(req.body);

  const result = await pool.query(
    `INSERT INTO advertisement_messages (title, message, placement)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [payload.title, payload.message, payload.placement || "general"]
  );

  res.status(201).json({
    success: true,
    data: normalizeAdvertisement(result.rows[0]),
  });
});

export const updateAdvertisement = asyncHandler(async (req, res) => {
  await ensureAdvertisementExists(req.params.id);
  const payload = updateAdvertisementSchema.parse(req.body);
  const entries = Object.entries(payload);

  if (!entries.length) {
    throw new ApiError(400, "No advertisement fields provided to update");
  }

  const values = [];
  const setClauses = entries.map(([key, value], index) => {
    values.push(value);
    return `${key} = $${index + 1}`;
  });
  values.push(req.params.id);

  const result = await pool.query(
    `UPDATE advertisement_messages
     SET ${setClauses.join(", ")}
     WHERE id = $${values.length}
     RETURNING *`,
    values
  );

  res.json({
    success: true,
    data: normalizeAdvertisement(result.rows[0]),
  });
});

export const deleteAdvertisement = asyncHandler(async (req, res) => {
  await ensureAdvertisementExists(req.params.id);
  await pool.query(`DELETE FROM advertisement_messages WHERE id = $1`, [req.params.id]);

  res.json({
    success: true,
    message: "Advertisement deleted successfully",
  });
});
