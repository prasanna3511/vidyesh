import app from "./app.js";
import { pool } from "./config/db.js";

const port = Number(process.env.PORT || 4000);

const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    app.listen(port, () => {
      console.log(`REST API running on http://localhost:${port}/api`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
