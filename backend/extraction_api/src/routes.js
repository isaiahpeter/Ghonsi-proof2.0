const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const { extractProof, PermanentAPIError, TransientAPIError } = require("./ocr");
const { VALID_PROOF_TYPES } = require("./prompts");

const router = express.Router();

// ── Multer: store uploads in memory (no disk I/O needed) ─────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          `Unsupported file type: ${file.mimetype}. Allowed: jpeg, png, gif, webp, pdf`
        )
      );
    }
  },
});

// ── Hash helper ─────────

function hashResult(data) {
  const skip = new Set([
    "needs_review",
    "low_confidence_fields",
    "confidence",
    "cache_hit",
    "proof_type",
    "_overall_confidence",
  ]);
  const clean = Object.fromEntries(Object.entries(data).filter(([k]) => !skip.has(k)));
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(clean, Object.keys(clean).sort()))
    .digest("hex");
}

// ── POST /api/extract ───

/**
 * @route  POST /api/extract
 * @desc   Upload a document and extract structured proof data
 * @access Public
 *
 * Body (multipart/form-data):
 *   file       — the document (JPG, PNG, GIF, WEBP, PDF)
 *   proof_type — one of: job | certificate | skill | milestone | contribution
 */
router.post("/extract", upload.single("file"), async (req, res) => {
  // Validation
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { proof_type: proofType } = req.body;

  if (!proofType) {
    return res.status(400).json({ error: "proof_type is required" });
  }

  if (!VALID_PROOF_TYPES.includes(proofType)) {
    return res.status(400).json({
      error: `Invalid proof_type '${proofType}'. Must be one of: ${VALID_PROOF_TYPES.join(", ")}`,
    });
  }

  try {
    const result = await extractProof(
      req.file.buffer,
      proofType,
      req.file.mimetype,
      req.file.originalname
    );

    const validationHash = result.needs_review ? null : hashResult(result);

    return res.status(200).json({
      proof_type: proofType,
      extracted_data: result,
      needs_review: result.needs_review,
      flagged_fields: result.low_confidence_fields,
      validation_hash: validationHash,
      cached: result.cache_hit,
    });
  } catch (err) {
    if (err instanceof PermanentAPIError) {
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof TransientAPIError) {
      return res.status(503).json({ error: `Service temporarily unavailable: ${err.message}` });
    }
    console.error("Unhandled extraction error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/debug ──────

/**
 * @route  GET /api/debug
 * @desc   Confirm environment is wired up correctly
 * @access Public
 */
router.get("/debug", (_req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY || "";
  return res.json({
    api_key_exists: Boolean(apiKey),
    api_key_prefix: apiKey ? `${apiKey.slice(0, 10)}...` : "NOT SET",
    valid_proof_types: VALID_PROOF_TYPES,
    node_version: process.version,
  });
});

// ── Multer error handler 

router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File size exceeds the 10 MB limit" });
    }
    return res.status(400).json({ error: err.message });
  }
  return res.status(500).json({ error: "Unexpected error" });
});

module.exports = router;