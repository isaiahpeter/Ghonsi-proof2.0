// src/config/swagger.js
'use strict';

const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

// ── Path resolution ────────────────────────────────────────────────────────────
// swagger-jsdoc resolves `apis` relative to process.cwd(), NOT this file.
// Using __dirname-anchored absolute paths guarantees discovery regardless of
// where the server process is started (monorepo root, backend/, etc.).
const ROOT     = path.resolve(__dirname, '../..');   // → backend/
const SRC      = path.resolve(__dirname, '..');      // → backend/src/

const options = {
  definition: {
    openapi: '3.0.3',

    info: {
      title:       'Ghonsi Proof API',
      version:     '1.0.0',
      description:
        'Backend API for Ghonsi Proof — a Solana-based proof-of-work credential platform. ' +
        'Includes proof submission, messaging, jobs marketplace, x402 payment-gated premium ' +
        'content, and Nigerian market intelligence.',
      contact: {
        name: 'Ghonsi Proof Team',
        url:  'https://ghonsiproof.com',
      },
    },

    servers: [
      { url: 'http://localhost:3001',                                          description: 'Local development' },
      { url: 'https://api.ghonsiproof.com',                                    description: 'Production' },
      { url: process.env.RENDER_EXTERNAL_URL ?? 'http://localhost:3001',       description: 'Render (or fallback localhost)' },
    ],

    tags: [
      { name: 'Health',       description: 'Server health checks' },
      { name: 'OTP',          description: 'Email verification / OTP' },
      { name: 'Proofs',       description: 'Solana on-chain proof operations' },
      { name: 'Migration',    description: 'Mainnet migration (admin only)' },
      { name: 'Messages',     description: 'Portfolio request messaging' },
      { name: 'Jobs',         description: 'Job listings marketplace' },
      { name: 'Premium',      description: 'x402 payment-gated endpoints' },
      { name: 'Market Data',  description: 'Nigerian market intelligence endpoints' },
    ],

    components: {

      schemas: {

        Error: {
          type: 'object',
          properties: {
            error:   { type: 'string' },
            details: { type: 'string' },
          },
        },

        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
          },
        },

        Message: {
          type: 'object',
          properties: {
            id:           { type: 'string', format: 'uuid' },
            sender_id:    { type: 'string' },
            receiver_id:  { type: 'string', format: 'uuid' },
            portfolio_id: { type: 'string', format: 'uuid' },
            message:      { type: 'string' },
            sender_name:  { type: 'string' },
            sender_email: { type: 'string', format: 'email' },
            type:         { type: 'string' },
            status:       { type: 'string' },
            read:         { type: 'boolean' },
            created_at:   { type: 'string', format: 'date-time' },
          },
        },

        Job: {
          type: 'object',
          properties: {
            id:           { type: 'string' },
            title:        { type: 'string' },
            description:  { type: 'string' },
            requirements: { type: 'string' },
            budget:       { type: 'number' },
            tags:         { type: 'array', items: { type: 'string' } },
            posted_at:    { type: 'string', format: 'date-time' },
            applicants:   { type: 'array', items: { $ref: '#/components/schemas/Applicant' } },
          },
        },

        Applicant: {
          type: 'object',
          properties: {
            id:          { type: 'string' },
            status:      { type: 'string', enum: ['applied', 'accepted', 'rejected'] },
            applied_at:  { type: 'string', format: 'date-time' },
            coverLetter: { type: 'string' },
            resume:      { type: 'string' },
          },
        },

        x402PaymentRequired: {
          type: 'object',
          description: 'x402 v2 payment required response',
          properties: {
            x402Version: { type: 'integer', example: 2 },
            accepts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  scheme:            { type: 'string', example: 'exact' },
                  network:           { type: 'string', example: 'base-sepolia' },
                  maxAmountRequired: { type: 'string', example: '1000' },
                  payTo:             { type: 'string', example: '0xYourWalletAddress' },
                  asset:             { type: 'string', example: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
                  description:       { type: 'string' },
                },
              },
            },
            facilitatorUrl: { type: 'string', example: 'https://x402.org/facilitator' },
            error:          { type: 'string' },
          },
        },

      }, // end schemas

      parameters: {
        PaymentHeader: {
          name:        'X-PAYMENT',
          in:          'header',
          required:    true,
          description: 'x402 payment signature. Obtain by paying the amount specified in the 402 response.',
          schema:      { type: 'string' },
        },
      },

    }, // end components
  }, // end definition

  // ── API file discovery ───────────────────────────────────────────────────────
  // Absolute paths so discovery works from any CWD (monorepo root, backend/, CI, etc.)
  apis: [
    path.join(ROOT, 'server.js'),          // main Express routes + JSDoc
    path.join(SRC,  'routes/market.js'),   // Market Data / crawler routes
  ],
};

// ── Debug: log resolved paths at startup so you can verify discovery ──────────
if (process.env.NODE_ENV !== 'production') {
  console.log('[swagger] Scanning for JSDoc annotations in:');
  options.apis.forEach(p => console.log('  ', p));
}

const swaggerSpec = swaggerJsdoc(options);

// ── Warn if no paths were generated (annotation discovery failed) ─────────────
if (process.env.NODE_ENV !== 'production') {
  const pathCount = Object.keys(swaggerSpec.paths ?? {}).length;
  if (pathCount === 0) {
    console.warn('[swagger] ⚠️  No paths discovered — check that JSDoc annotations exist in the files above.');
  } else {
    console.log(`[swagger] ✅ ${pathCount} path(s) registered.`);
  }
}

module.exports = { swaggerSpec };