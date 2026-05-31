const Anthropic = require("@anthropic-ai/sdk");
const crypto = require("crypto");
const retry = require("async-retry");
const { PROMPTS, VALID_PROOF_TYPES } = require("./prompts");

// ── Errors ─────────────

class ExtractionError extends Error {
  constructor(message) {
    super(message);
    this.name = "ExtractionError";
  }
}

class PermanentAPIError extends ExtractionError {
  constructor(message) {
    super(message);
    this.name = "PermanentAPIError";
  }
}

class TransientAPIError extends ExtractionError {
  constructor(message) {
    super(message);
    this.name = "TransientAPIError";
  }
}

// ── In-memory cache ─────

const _CACHE = new Map();

function _imageHash(fileBuffer) {
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

// ── Helpers ─────────────

/**
 * Normalise MIME type to something Claude accepts.
 * Falls back to inferring from file extension.
 */
function resolveMimeType(mimeType = "", filename = "") {
  const allowed = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ]);

  if (allowed.has(mimeType)) return mimeType;

  const ext = filename.split(".").pop().toLowerCase();
  const extMap = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    pdf: "application/pdf",
  };

  return extMap[ext] || "image/jpeg";
}

/**
 * Strip markdown fences that the model occasionally wraps JSON in, then parse.
 */
function parseJSON(raw) {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/m, "")
    .replace(/^```\s*/m, "")
    .replace(/```\s*$/m, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new PermanentAPIError(
      `Model returned invalid JSON: ${err.message}\nRaw output: ${raw}`
    );
  }
}

/**
 * Return field names whose confidence score is below `threshold`.
 */
function lowConfidenceFields(result, threshold = 0.5) {
  const scores = result.confidence || {};
  return Object.entries(scores)
    .filter(([, score]) => (score ?? 0) < threshold)
    .map(([field]) => field);
}

/**
 * For skill proof type: calculate overall confidence from breakdown if missing.
 */
function normaliseSkillConfidence(result) {
  if (result.proof_type !== "skill") return result;
  if (typeof result.confidence === "number") return result;

  const breakdown = result.confidence || {};
  const scores = Object.values(breakdown).filter((s) => s != null);
  if (scores.length) {
    result._overall_confidence = +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
  }
  return result;
}

// ── Anthropic API call with retry ─────────────────────────────────────────────

async function callAnthropicAPI(fileBuffer, mimeType, prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new PermanentAPIError("ANTHROPIC_API_KEY environment variable is not set.");
  }

  const client = new Anthropic({ apiKey });
  const b64 = fileBuffer.toString("base64");

  const isPDF = mimeType === "application/pdf";

  const contentItem = isPDF
    ? {
        type: "document",
        source: { type: "base64", media_type: mimeType, data: b64 },
      }
    : {
        type: "image",
        source: { type: "base64", media_type: mimeType, data: b64 },
      };

  return retry(
    async (bail) => {
      try {
        const response = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: [contentItem, { type: "text", text: prompt }],
            },
          ],
        });

        return response.content[0].text;
      } catch (err) {
        // Permanent errors — don't retry
        if (err.status === 401 || err.status === 400) {
          bail(new PermanentAPIError(`Anthropic API error ${err.status}: ${err.message}`));
          return;
        }
        // Transient errors — retry
        if (err.status === 429 || (err.status >= 500 && err.status < 600)) {
          throw new TransientAPIError(`Transient API error ${err.status}: ${err.message}`);
        }
        // Network / SDK errors
        if (err.code === "ETIMEDOUT" || err.code === "ECONNRESET") {
          throw new TransientAPIError(`Network error: ${err.message}`);
        }
        // Anything else is permanent
        bail(new PermanentAPIError(`API error: ${err.message}`));
      }
    },
    {
      retries: 3,
      minTimeout: 2000,
      maxTimeout: 10000,
      factor: 2,
      onRetry: (err, attempt) => {
        console.warn(`Retry ${attempt}/3 after: ${err.message}`);
      },
    }
  );
}

// ── Main extraction function ──────────────────────────────────────────────────

/**
 * Extract structured data from a document file.
 *
 * @param {Buffer}  fileBuffer  - Raw file bytes
 * @param {string}  proofType   - One of: job | certificate | skill | milestone | contribution
 * @param {string}  mimeType    - MIME type from the upload
 * @param {string}  filename    - Original filename (fallback for MIME detection)
 * @returns {Object} Extracted data with confidence scores, needs_review, cache_hit
 */
async function extractProof(fileBuffer, proofType, mimeType = "image/jpeg", filename = "") {
  if (!VALID_PROOF_TYPES.includes(proofType)) {
    throw new PermanentAPIError(
      `Invalid proof_type '${proofType}'. Must be one of: ${VALID_PROOF_TYPES.join(", ")}`
    );
  }

  const cacheKey = _imageHash(fileBuffer);

  // Cache hit
  if (_CACHE.has(cacheKey)) {
    const cached = { ..._CACHE.get(cacheKey), cache_hit: true };
    return cached;
  }

  const resolvedMime = resolveMimeType(mimeType, filename);
  const prompt = PROMPTS[proofType];

  const rawText = await callAnthropicAPI(fileBuffer, resolvedMime, prompt);
  let result = parseJSON(rawText);

  result.proof_type = proofType;
  result = normaliseSkillConfidence(result);

  const low = lowConfidenceFields(result);
  result.needs_review = low.length > 0;
  result.low_confidence_fields = low;
  result.cache_hit = false;

  _CACHE.set(cacheKey, { ...result });

  return result;
}

// ── Cache utilities ─────

function clearCache() {
  _CACHE.clear();
}

function getCacheStats() {
  let sizeBytes = 0;
  for (const v of _CACHE.values()) {
    sizeBytes += Buffer.byteLength(JSON.stringify(v));
  }
  return { cached_entries: _CACHE.size, cache_size_bytes: sizeBytes };
}

module.exports = {
  extractProof,
  clearCache,
  getCacheStats,
  PermanentAPIError,
  TransientAPIError,
  ExtractionError,
};