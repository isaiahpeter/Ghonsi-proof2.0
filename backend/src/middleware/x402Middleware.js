// ─────────────────────────────────────────────────────────────────────────────
// x402 Payment Middleware
//
// Reusable Express middleware that gates routes behind an HTTP 402
// micro-payment (x402 protocol v2).
//
// Flow:
//   1. Client hits a protected route without payment → 402 + accepts array
//   2. Client pays via their wallet / agent and retries with X-PAYMENT header
//   3. Middleware verifies payment via the facilitator
//   4. On success → next()  |  On failure → 402
// ─────────────────────────────────────────────────────────────────────────────

const x402Config = require('../config/x402Config');

// ── Build the 402 response payload ──────────────────────────────────────────

function build402Response(overrides = {}) {
    const config = { ...x402Config, ...overrides };

    return {
        x402Version: config.x402Version,
        accepts: [
            {
                scheme: 'exact',
                network: config.network,
                maxAmountRequired: config.amount,
                resource: config.payTo,
                description: overrides.description || 'Payment required to access this resource',
                mimeType: 'application/json',
                payTo: config.payTo,
                maxTimeoutSeconds: 300,
                asset: config.asset,
                extra: {
                    name: 'Ghonsi Proof Premium Access',
                    ...(overrides.extra || {}),
                },
            },
        ],
        facilitatorUrl: config.facilitatorUrl,
        error: 'Payment required',
    };
}

// ── Verify payment with the facilitator ─────────────────────────────────────

async function verifyPayment(paymentHeader, payload) {
    try {
        const response = await fetch(x402Config.facilitatorUrl + '/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                x402Version: x402Config.x402Version,
                paymentHeader,
                payload,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.warn('[x402] Facilitator rejected payment:', response.status, errorBody);
            return { valid: false, error: `Facilitator returned ${response.status}` };
        }

        const result = await response.json();
        return { valid: result.valid === true, result };
    } catch (err) {
        console.error('[x402] Facilitator verification error:', err.message);
        return { valid: false, error: err.message };
    }
}

// ── Middleware factory ──────────────────────────────────────────────────────

/**
 * Creates an x402 payment middleware.
 *
 * @param {Object} [options]                  Route-specific overrides
 * @param {string} [options.amount]           Override default price
 * @param {string} [options.description]      Human-readable description
 * @param {string} [options.payTo]            Override receiving address
 * @param {Object} [options.extra]            Extra metadata for the accepts entry
 * @returns {Function} Express middleware
 *
 * @example
 *   // Default config (0.001 USDC)
 *   app.get('/api/gigs/premium/:id', createX402Middleware(), handler);
 *
 *   // Custom price
 *   app.get('/api/reports/:id', createX402Middleware({ amount: '5000', description: 'Premium report' }), handler);
 */
function createX402Middleware(options = {}) {
    // Validate that payTo is configured
    const payTo = options.payTo || x402Config.payTo;
    if (!payTo) {
        console.warn('[x402] WARNING: X402_PAY_TO_ADDRESS is not set. Payment middleware will reject all requests.');
    }

    return async function x402Middleware(req, res, next) {
        // ── 1. Check for payment header ─────────────────────────────────────
        const paymentHeader =
            req.headers['x-payment'] ||
            req.headers['payment'] ||
            req.headers['payment-signature'];

        if (!paymentHeader) {
            // No payment provided → return 402 with payment requirements
            console.log(`[x402] No payment header on ${req.method} ${req.path} — returning 402`);
            return res.status(402).json(build402Response(options));
        }

        // ── 2. payTo must be configured ─────────────────────────────────────
        if (!payTo) {
            console.error('[x402] Cannot verify payment: X402_PAY_TO_ADDRESS not configured');
            return res.status(500).json({ error: 'Payment verification not configured on this server' });
        }

        // ── 3. Verify with facilitator ──────────────────────────────────────
        const payload = {
            scheme: 'exact',
            network: options.network || x402Config.network,
            payTo,
            maxAmountRequired: options.amount || x402Config.amount,
            asset: options.asset || x402Config.asset,
            resource: `${req.method} ${req.originalUrl}`,
        };

        const { valid, error, result } = await verifyPayment(paymentHeader, payload);

        if (!valid) {
            console.warn(`[x402] Payment verification failed for ${req.path}:`, error || 'invalid');
            return res.status(402).json({
                ...build402Response(options),
                error: 'Payment verification failed',
                details: error || 'The payment could not be verified',
            });
        }

        // ── 4. Payment valid → continue ─────────────────────────────────────
        console.log(`[x402] ✅ Payment verified for ${req.method} ${req.path}`);

        // Attach payment info to request for downstream use
        req.x402 = {
            verified: true,
            payment: result,
            payTo,
        };

        next();
    };
}

// ── Convenience: default middleware with standard config ─────────────────────

const x402Middleware = createX402Middleware();

module.exports = {
    x402Middleware,
    createX402Middleware,
    build402Response,
};
