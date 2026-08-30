import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");
const envPath = path.join(backendRoot, ".env");
const schemaPath = path.join(backendRoot, "db", "schema.sql");

if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const buildDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || "5432";
  const database = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;

  if (!host || !database || !user) {
    return null;
  }

  const encodedPassword = encodeURIComponent(password || "");
  return `postgresql://${encodeURIComponent(user)}:${encodedPassword}@${host}:${port}/${database}`;
};

const databaseUrl = buildDatabaseUrl();

if (!databaseUrl) {
  console.error("Database config not found. Add DATABASE_URL or DB_HOST/DB_NAME/DB_USER/DB_PASSWORD to backend/.env");
  process.exit(1);
}

const child = spawn("psql", [databaseUrl, "-f", schemaPath], {
  cwd: backendRoot,
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error("Failed to run psql:", error.message);
  process.exit(1);
});
