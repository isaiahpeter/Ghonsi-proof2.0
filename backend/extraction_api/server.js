require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./src/routes");

const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS ────────────────

const allowedOrigins = [
  "https://ghonsiproof.com",
  "https://ghonsi-proof.vercel.app",
  "https://ghonsi-proof2.vercel.app",
  "https://ghonsi-proof2-0.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173", // Vite default
];

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin '${origin}' not allowed`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body parsers (JSON for non-file routes) ───────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────
app.use("/api", routes);

// ── 404 ─────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global error handler 
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ───────────────
app.listen(PORT, () => {
  console.log(`Extraction API running on http://localhost:${PORT}`);
  console.log(`  POST  /api/extract  — extract proof data`);
  console.log(`  GET   /api/debug    — check environment`);
});

module.exports = app;