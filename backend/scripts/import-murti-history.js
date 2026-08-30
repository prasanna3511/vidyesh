import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(backendRoot, ".env") });

const { Pool } = pg;

const csvPath = process.argv[2];

if (!csvPath) {
  console.error("Usage: npm run db:import:murti-history -- /absolute/path/to/file.csv");
  process.exit(1);
}

const parseCsvLine = (line) => {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
};

const unwrapValue = (value) => {
  if (value === undefined || value === null) return null;

  let next = String(value).trim();

  while (
    (next.startsWith('"') && next.endsWith('"')) ||
    (next.startsWith("'") && next.endsWith("'"))
  ) {
    next = next.slice(1, -1).trim();
  }

  if (next === "" || next.toLowerCase() === "null") {
    return null;
  }

  if (next === "''" || next === "' '" || next === " ") {
    return null;
  }

  return next;
};

const toNumber = (value) => {
  const cleaned = unwrapValue(value);
  if (cleaned === null) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const toStringOrNull = (value) => {
  const cleaned = unwrapValue(value);
  return cleaned === null ? null : cleaned;
};

const toDateOrNull = (value) => {
  const cleaned = unwrapValue(value);
  if (!cleaned) return null;
  return cleaned;
};

const raw = fs.readFileSync(csvPath, "utf8");
const lines = raw.split(/\r?\n/).filter((line) => line.trim() !== "");

if (lines.length < 2) {
  console.error("CSV file is empty or missing data rows");
  process.exit(1);
}

const headers = parseCsvLine(lines[0]);
const rows = lines.slice(1).map((line) => {
  const values = parseCsvLine(line);
  const record = {};
  headers.forEach((header, index) => {
    record[header] = values[index] ?? "";
  });
  return record;
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const run = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let insertedCount = 0;
    let updatedCount = 0;

    for (const row of rows) {
      const params = [
        toNumber(row.id),
        toStringOrNull(row.murti_id),
        toStringOrNull(row.size),
        toNumber(row.final_price),
        toStringOrNull(row.booking_status) || "available",
        toStringOrNull(row.image),
        toStringOrNull(row.customer_name),
        toStringOrNull(row.customer_phone),
        toStringOrNull(row.customer_email),
        toStringOrNull(row.address),
        toNumber(row.paid_amount),
        toNumber(row.discount_price),
        toStringOrNull(row.paid_amount_sc),
        toStringOrNull(row.payment_mode),
        toStringOrNull(row.suggestions),
        toStringOrNull(row.booked_by),
        toDateOrNull(row.date),
        toStringOrNull(row.Supplier),
        toStringOrNull(row.murti_design),
        toStringOrNull(row.stored_at),
        toNumber(row.roundup_amount),
      ];

      try {
        const result = await client.query(
          `INSERT INTO murti_history (
            id,
            murti_id,
            size,
            final_price,
            booking_status,
            image,
            customer_name,
            customer_phone,
            customer_email,
            address,
            paid_amount,
            discount_price,
            paid_amount_sc,
            payment_mode,
            suggestions,
            booked_by,
            booking_date,
            supplier,
            murti_design,
            stored_at,
            roundup_amount
          ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20,
            $21
          )
          ON CONFLICT (id) DO UPDATE SET
            murti_id = EXCLUDED.murti_id,
            size = EXCLUDED.size,
            final_price = EXCLUDED.final_price,
            booking_status = EXCLUDED.booking_status,
            image = EXCLUDED.image,
            customer_name = EXCLUDED.customer_name,
            customer_phone = EXCLUDED.customer_phone,
            customer_email = EXCLUDED.customer_email,
            address = EXCLUDED.address,
            paid_amount = EXCLUDED.paid_amount,
            discount_price = EXCLUDED.discount_price,
            paid_amount_sc = EXCLUDED.paid_amount_sc,
            payment_mode = EXCLUDED.payment_mode,
            suggestions = EXCLUDED.suggestions,
            booked_by = EXCLUDED.booked_by,
            booking_date = EXCLUDED.booking_date,
            supplier = EXCLUDED.supplier,
            murti_design = EXCLUDED.murti_design,
            stored_at = EXCLUDED.stored_at,
            roundup_amount = EXCLUDED.roundup_amount,
            updated_at = NOW()
          RETURNING xmax = 0 AS inserted`,
          params
        );

        if (result.rows[0]?.inserted) {
          insertedCount += 1;
        } else {
          updatedCount += 1;
        }
      } catch (error) {
        console.error(
          JSON.stringify(
            {
              failingRow: row,
              mappedParams: {
                id: params[0],
                murti_id: params[1],
                size: params[2],
                final_price: params[3],
                booking_status: params[4],
                image: params[5],
                customer_name: params[6],
                customer_phone: params[7],
                customer_email: params[8],
                address: params[9],
                paid_amount: params[10],
                discount_price: params[11],
                paid_amount_sc: params[12],
                payment_mode: params[13],
                suggestions: params[14],
                booked_by: params[15],
                booking_date: params[16],
                supplier: params[17],
                murti_design: params[18],
                stored_at: params[19],
                roundup_amount: params[20],
              },
              error: error.message,
            },
            null,
            2
          )
        );
        throw error;
      }
    }

    await client.query(
      `SELECT setval(
        pg_get_serial_sequence('murti_history', 'id'),
        COALESCE((SELECT MAX(id) FROM murti_history), 1),
        true
      )`
    );

    await client.query("COMMIT");

    console.log(
      JSON.stringify({
        totalCsvRows: rows.length,
        insertedCount,
        updatedCount,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Import failed:", error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

run();
