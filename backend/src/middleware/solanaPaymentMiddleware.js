// ─────────────────────────────────────────────────────────────────────────────
// Solana USDT Payment Middleware
//
// Replaces the Base/x402 middleware. Gates Express routes behind a Solana
// SPL USDT micro-payment.
//
// Flow:
//   1. Client hits a protected route without payment → 402 + requirements
//   2. Client sends USDT SPL transfer on Solana, gets back a tx signature
//   3. Client retries with X-PAYMENT-TX: <signature> header
//   4. Middleware verifies the tx on-chain:
//        - tx is confirmed
//        - correct USDT amount sent to treasury
//        - tx is fresh (within maxTxAgeSeconds)
//   5. Valid → next()  |  Invalid → 402
// ─────────────────────────────────────────────────────────────────────────────

const { Connection, PublicKey } = require('@solana/web3.js');
const config = require('../config/solanaPaymentConfig');

// ── Build a human-readable 402 response ─────────────────────────────────────

function build402Response(options = {}) {
    const amount = options.amount || config.amounts.request;
    const usdAmount = (parseInt(amount) / 1_000_000).toFixed(2);

    return {
        paymentRequired: true,
        chain: 'solana',
        token: 'USDT',
        usdtMint: config.usdtMint,
        treasuryWallet: config.treasuryWallet,
        amount,
        usdAmount: `$${usdAmount}`,
        description: options.description || `Pay ${usdAmount} USDT on Solana to access this resource`,
        instructions: 'Send a confirmed SPL USDT transfer to treasuryWallet, then retry with the transaction signature in the X-PAYMENT-TX header.',
        error: 'Payment required',
    };
}

// ── Verify a USDT SPL transfer on Solana ────────────────────────────────────
//
// Checks:
//  1. Tx exists and is confirmed/finalized
//  2. A token transfer instruction sent >= requiredAmount of USDT
//  3. The destination is the treasury wallet's associated token account
//  4. The tx blockTime is within maxTxAgeSeconds
//
async function verifyUsdtPayment(txSignature, requiredAmount) {
    if (!config.treasuryWallet) {
        return { valid: false, error: 'TREASURY_WALLET not configured' };
    }

    const connection = new Connection(config.rpcUrl, 'confirmed');

    try {
        // ── 1. Fetch the transaction ──────────────────────────────────────
        const tx = await connection.getParsedTransaction(txSignature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
        });

        if (!tx) {
            return { valid: false, error: 'Transaction not found or not yet confirmed' };
        }

        if (tx.meta?.err) {
            return { valid: false, error: 'Transaction failed on-chain' };
        }

        // ── 2. Check tx age ───────────────────────────────────────────────
        const txTime = tx.blockTime; // unix seconds
        if (txTime) {
            const age = Math.floor(Date.now() / 1000) - txTime;
            if (age > config.maxTxAgeSeconds) {
                return { valid: false, error: `Transaction too old (${age}s). Max allowed: ${config.maxTxAgeSeconds}s` };
            }
        }

        // ── 3. Find a USDT transfer to the treasury ───────────────────────
        const instructions = tx.transaction?.message?.instructions || [];
        const innerInstructions = tx.meta?.innerInstructions || [];

        // Flatten all instructions (outer + inner)
        const allInstructions = [
            ...instructions,
            ...innerInstructions.flatMap(ii => ii.instructions),
        ];

        const treasuryPubkey = new PublicKey(config.treasuryWallet);
        const usdtMintPubkey = new PublicKey(config.usdtMint);
        const required = BigInt(requiredAmount);

        let paymentFound = false;

        for (const ix of allInstructions) {
            // Parsed SPL token transfer instruction
            if (
                ix.program === 'spl-token' &&
                (ix.parsed?.type === 'transfer' || ix.parsed?.type === 'transferChecked')
            ) {
                const info = ix.parsed.info;
                const amount = BigInt(info.tokenAmount?.amount || info.amount || '0');
                const mint = info.mint;

                // For transferChecked, mint is directly available.
                // For transfer, we check via pre/post token balances.
                const mintMatches = mint
                    ? mint === config.usdtMint
                    : checkMintViaBalances(tx, info.destination, config.usdtMint);

                if (!mintMatches) continue;
                if (amount < required) continue;

                // Check destination is the treasury or treasury's ATA
                const destination = info.destination;
                const destinationOwner = info.destinationOwner;

                const toTreasury =
                    destination === config.treasuryWallet ||
                    destinationOwner === config.treasuryWallet ||
                    (await isAtaOfTreasury(connection, destination, treasuryPubkey, usdtMintPubkey));

                if (toTreasury) {
                    paymentFound = true;
                    break;
                }
            }
        }

        if (!paymentFound) {
            return {
                valid: false,
                error: `No confirmed USDT transfer of >= $${(Number(required) / 1_000_000).toFixed(2)} to treasury found in this transaction`,
            };
        }

        return { valid: true, txSignature };

    } catch (err) {
        console.error('[solanaPayment] Verification error:', err.message);
        return { valid: false, error: err.message };
    }
}

// ── Helper: check if an account is the ATA of the treasury for USDT ─────────

async function isAtaOfTreasury(connection, accountAddress, treasuryPubkey, usdtMintPubkey) {
    try {
        const accountInfo = await connection.getParsedAccountInfo(new PublicKey(accountAddress));
        const parsed = accountInfo?.value?.data?.parsed;
        if (!parsed) return false;
        const owner = parsed.info?.owner;
        const mint = parsed.info?.mint;
        return owner === treasuryPubkey.toString() && mint === usdtMintPubkey.toString();
    } catch {
        return false;
    }
}

// ── Helper: infer mint from pre/post token balances (for plain transfer ix) ──

function checkMintViaBalances(tx, accountAddress, expectedMint) {
    const balances = [
        ...(tx.meta?.preTokenBalances || []),
        ...(tx.meta?.postTokenBalances || []),
    ];
    const accounts = tx.transaction?.message?.accountKeys || [];
    const idx = accounts.findIndex(
        k => (k.pubkey || k).toString() === accountAddress
    );
    if (idx === -1) return false;
    return balances.some(b => b.accountIndex === idx && b.mint === expectedMint);
}

// ── Middleware factory ───────────────────────────────────────────────────────

/**
 * Creates a Solana USDT payment middleware.
 *
 * @param {Object} [options]
 * @param {string} [options.amount]       Override default amount (smallest unit)
 * @param {string} [options.description]  Human-readable description
 * @returns {Function} Express middleware
 *
 * @example
 *   // Default $0.15
 *   app.get('/api/profiles/premium/:id', createSolanaPaymentMiddleware(), handler);
 *
 *   // Proof upload $0.20
 *   app.post('/api/prepare-mint', createSolanaPaymentMiddleware({ amount: '200000' }), handler);
 */
function createSolanaPaymentMiddleware(options = {}) {
    const amount = options.amount || config.amounts.request;

    return async function solanaPaymentMiddleware(req, res, next) {

        // DEVNET TEST BYPASS — remove before mainnet
        if (req.headers['x-payment-tx'] === 'test-bypass-devnet') {
            req.solanaPayment = { verified: true, txSignature: 'test' };
            return next();
        }

        // ── 1. Check for payment signature header ────────────────────────
        const txSignature = req.headers['x-payment-tx'];

        if (!txSignature) {
            console.log(`[solanaPayment] No X-PAYMENT-TX header on ${req.method} ${req.path} — returning 402`);
            return res.status(402).json(build402Response({ ...options, amount }));
        }

        // ── 2. Treasury must be configured ──────────────────────────────
        if (!config.treasuryWallet) {
            console.error('[solanaPayment] Cannot verify: TREASURY_WALLET not configured');
            return res.status(500).json({ error: 'Payment verification not configured on this server' });
        }

        // ── 3. Verify on-chain ───────────────────────────────────────────
        console.log(`[solanaPayment] Verifying tx ${txSignature.slice(0, 20)}... on ${req.method} ${req.path}`);
        const { valid, error } = await verifyUsdtPayment(txSignature, amount);

        if (!valid) {
            console.warn(`[solanaPayment] Payment verification failed for ${req.path}:`, error);
            return res.status(402).json({
                ...build402Response({ ...options, amount }),
                error: 'Payment verification failed',
                details: error,
            });
        }

        // ── 4. Valid — attach to request and continue ────────────────────
        console.log(`[solanaPayment] ✅ Payment verified for ${req.method} ${req.path}`);
        req.solanaPayment = {
            verified: true,
            txSignature,
            amount,
        };

        next();
    };
}

// ── Default middleware with $0.15 request price ──────────────────────────────

const solanaPaymentMiddleware = createSolanaPaymentMiddleware();

module.exports = {
    solanaPaymentMiddleware,
    createSolanaPaymentMiddleware,
    build402Response,
};