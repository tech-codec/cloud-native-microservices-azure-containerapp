const express = require("express");
const app = express();
const PORT = process.env.PORT;

//require("dotenv").config(); // for local development, not needed in Docker as env vars are set in compose
const { Pool } = require("pg");

app.use(express.json());

// configure pool with DATABASE_URL or individual vars in .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // or use:
  // host: process.env.PGHOST,
  // user: process.env.PGUSER,
  // password: process.env.PGPASSWORD,
  // database: process.env.PGDATABASE,
  // port: process.env.PGPORT,
});

// GET /users -> read from Postgres
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM users ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error("Error querying users:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// optional: create a user
app.post("/users", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });
  try {
    const result = await pool.query(
      "INSERT INTO users (name) VALUES ($1) RETURNING id, name",
      [name],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
