// ─────────────────────────────────────────────────────────────────────────────
// x402 Protocol Configuration
//
// Centralised config for HTTP 402 payment-gated routes.
// All values are pulled from environment variables with sensible defaults.
// ─────────────────────────────────────────────────────────────────────────────

const x402Config = {
    // Wallet address that receives USDC payments
    payTo: process.env.X402_PAY_TO_ADDRESS || '',

    // Price in the smallest unit of the asset.
    // For USDC (6 decimals): "1000" = 0.001 USDC
    amount: process.env.X402_DEFAULT_AMOUNT || '1000',

    // Network identifier (CAIP-2 style for x402 v2)
    // "base" for mainnet, "base-sepolia" for testnet
    network: process.env.X402_NETWORK || 'base',


    // USDC contract address on Base
    asset: process.env.X402_ASSET || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',

    // Public x402 facilitator URL (Coinbase-hosted)
    facilitatorUrl: process.env.X402_FACILITATOR_URL || 'https://x402.org/facilitator',

    // x402 protocol version
    x402Version: 2,
};

module.exports = x402Config;
