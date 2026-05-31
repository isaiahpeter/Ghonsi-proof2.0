// ─────────────────────────────────────────────────────────────────────────────
// x402 Frontend Client
//
// Client-side utilities for x402 payment-gated API requests.
// Handles payment flow, header construction, and automatic retry.
// ─────────────────────────────────────────────────────────────────────────────

const X402_CONFIG = {
    facilitatorUrl: process.env.NEXT_PUBLIC_X402_FACILITATOR_URL || 'https://x402.org/facilitator',
    network: process.env.NEXT_PUBLIC_X402_NETWORK || 'base',
    asset: process.env.NEXT_PUBLIC_X402_ASSET || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
};


// ── Check if response is a 402 payment required ─────────────────────────────────

export function isPaymentRequired(error) {
    return error?.response?.status === 402;
}

// ── Parse 402 response to extract payment requirements ───────────────────────────────

export function parsePaymentRequirements(responseData) {
    if (!responseData?.accepts || !responseData.accepts[0]) {
        return null;
    }

    const accept = responseData.accepts[0];
    return {
        version: responseData.x402Version,
        scheme: accept.scheme,
        network: accept.network,
        payTo: accept.payTo,
        maxAmountRequired: accept.maxAmountRequired,
        asset: accept.asset,
        resource: accept.resource,
        description: accept.description,
        facilitatorUrl: responseData.facilitatorUrl,
        extra: accept.extra,
    };
}

// ── Initiate payment with facilitator ─────────────────────────────────────────

export async function initiatePayment(paymentRequirements, wallet) {
    try {
        const response = await fetch(`${paymentRequirements.facilitatorUrl}/pay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                scheme: paymentRequirements.scheme,
                network: paymentRequirements.network,
                payTo: paymentRequirements.payTo,
                maxAmountRequired: paymentRequirements.maxAmountRequired,
                asset: paymentRequirements.asset,
                resource: paymentRequirements.resource,
            }),
        });

        if (!response.ok) {
            throw new Error(`Facilitator error: ${response.status}`);
        }

        const paymentData = await response.json();
        
        // Sign the payment with user's wallet
        if (wallet) {
            const message = paymentData.signingMessage || JSON.stringify(paymentData);
            const signature = await wallet.signMessage(message);
            paymentData.signature = signature;
        }

        return paymentData;
    } catch (error) {
        console.error('[x402] Payment initiation failed:', error);
        throw error;
    }
}

// ── Build payment header value ─────────────────────────────────────────────────

export function buildPaymentHeader(paymentData) {
    if (!paymentData) return null;
    
    return JSON.stringify({
        signature: paymentData.signature,
        payment: paymentData.payment,
        facilitatorData: paymentData.facilitatorData,
    });
}

// ── Make x402-enabled API request with automatic payment handling ──────────────

export async function fetchWithX402(url, options = {}, wallet = null) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    // First attempt without payment
    let response = await fetch(url, config);

    // If 402, handle payment flow
    if (response.status === 402) {
        const paymentRequirements = parsePaymentRequirements(await response.json());
        
        if (!paymentRequirements) {
            throw new Error('Invalid 402 response - no payment requirements found');
        }

        // Initiate and complete payment
        const paymentData = await initiatePayment(paymentRequirements, wallet);
        
        if (!paymentData) {
            throw new Error('Payment failed - no payment data returned');
        }

        // Retry with payment header
        const paymentHeader = buildPaymentHeader(paymentData);
        config.headers['X-PAYMENT'] = paymentHeader;
        
        response = await fetch(url, config);
    }

    return response;
}

// ── Class-based API client for cleaner usage ────────────────────────────────────────

export class X402Client {
    constructor(baseUrl, wallet = null) {
        this.baseUrl = baseUrl;
        this.wallet = wallet;
    }

    setWallet(wallet) {
        this.wallet = wallet;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        return fetchWithX402(url, options, this.wallet);
    }

    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

// ── Hook for React components ───────────────────────────────────────────────────

export function useX402Client(baseUrl) {
    return new X402Client(baseUrl);
}

// ── Format amount for display ──────────────────────────────────────────────────

export function formatUSDCAmount(amountInSmallestUnit) {
    const amount = parseFloat(amountInSmallestUnit) / Math.pow(10, 6);
    return amount.toFixed(amount % 1 === 0 ? 0 : 6);
}

// ── Constants ────────────────────────────────────────────────────────────────────

export const X402_SCHEMES = {
    EXACT: 'exact',
    MINIMUM: 'minimum',
};

export const ERROR_CODES = {
    PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    FACILITATOR_ERROR: 'FACILITATOR_ERROR',
};

export default {
    X402Client,
    fetchWithX402,
    isPaymentRequired,
    parsePaymentRequirements,
    initiatePayment,
    buildPaymentHeader,
    formatUSDCAmount,
    SCHEMES: X402_SCHEMES,
    ERROR_CODES,
};
