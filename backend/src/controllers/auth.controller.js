import { pool } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createUserSchema, loginSchema } from "../validators/auth.validators.js";

const sanitizeUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const listUsers = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, email, role, created_at, updated_at
     FROM users
     ORDER BY created_at DESC, id DESC`
  );

  res.json({
    success: true,
    data: result.rows,
  });
});

export const createUser = asyncHandler(async (req, res) => {
  const payload = createUserSchema.parse(req.body);

  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at, updated_at`,
      [payload.name, payload.email, payload.password, payload.role || "admin"]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      throw new ApiError(409, "A user with this email already exists");
    }
    throw error;
  }
});

export const login = asyncHandler(async (req, res) => {
  const payload = loginSchema.parse(req.body);

  const result = await pool.query(`SELECT * FROM users WHERE email = $1 LIMIT 1`, [
    payload.email,
  ]);

  const user = result.rows[0];
  if (!user || user.password !== payload.password) {
    throw new ApiError(401, "Invalid email or password");
  }

  res.json({
    success: true,
    data: sanitizeUser(user),
  });
});
