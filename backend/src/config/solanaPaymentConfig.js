// ─────────────────────────────────────────────────────────────────────────────
// Solana USDT Payment Configuration
//
// Replaces the Base/x402 config. All payments are SPL USDT on Solana.
// USDT on Solana has 6 decimals — same as USDC.
//   150000 = $0.15
//   200000 = $0.20
// ─────────────────────────────────────────────────────────────────────────────

const solanaPaymentConfig = {
    // Wallet that receives USDT payments — set in env
    treasuryWallet: process.env.TREASURY_WALLET || '',

    // USDT SPL token mint on Solana (mainnet)
    // Devnet: use a devnet USDT mint or a mock SPL token for testing
    usdtMint: process.env.USDT_MINT || 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',

    // Payment amounts in USDT smallest unit (6 decimals)
    amounts: {
        request: process.env.PAYMENT_AMOUNT_REQUEST || '150000', // $0.15
        upload: process.env.PAYMENT_AMOUNT_UPLOAD || '200000', // $0.20
    },

    // Solana RPC — reuse the one already in your env
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',

    // Max age of a payment tx in seconds before we reject it (anti-replay)
    // 5 minutes is generous enough for slow connections
    maxTxAgeSeconds: 300,
};

// Validate on startup
if (!solanaPaymentConfig.treasuryWallet) {
    console.warn('[solanaPayment] WARNING: TREASURY_WALLET is not set. Payment middleware will reject all requests.');
}

module.exports = solanaPaymentConfig;