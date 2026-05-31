// ─────────────────────────────────────────────────────────────────────────────
// Solana USDT Payment Client
//
// Frontend utilities for sending SPL USDT payments on Solana before
// hitting payment-gated API routes.
// ─────────────────────────────────────────────────────────────────────────────

import {
    PublicKey,
    Transaction,
} from '@solana/web3.js';
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createTransferCheckedInstruction,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

// ── Constants ────────────────────────────────────────────────────────────────

// USDT SPL token — defaults to devnet mint to match the faucet
export const USDT_MINT = new PublicKey(
    process.env.NEXT_PUBLIC_USDT_MINT || '9QR25RvDUtqiTs1ibmVbqrY4V3NgD6VLVtstbwxBdHg'
);

export const USDT_DECIMALS = 6;

export const TREASURY_WALLET = new PublicKey(
    process.env.NEXT_PUBLIC_TREASURY_WALLET || ''
);

export const RPC_URL =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

// Payment amounts in USDT smallest unit (6 decimals)
export const PAYMENT_AMOUNTS = {
    request: BigInt(process.env.NEXT_PUBLIC_PAYMENT_AMOUNT_REQUEST || '150000'), // $0.15
    upload:  BigInt(process.env.NEXT_PUBLIC_PAYMENT_AMOUNT_UPLOAD  || '200000'), // $0.20
};

// ── Get or create the sender's USDT associated token account ─────────────────

/**
 * Returns the sender's ATA for USDT.
 * If it doesn't exist on-chain, appends a createATA instruction to the tx.
 */
export async function getOrCreateSenderAta(connection, senderPublicKey, transaction) {
    const senderAta = await getAssociatedTokenAddress(
        USDT_MINT,
        senderPublicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const ataInfo = await connection.getAccountInfo(senderAta);
    if (!ataInfo) {
        transaction.add(
            createAssociatedTokenAccountInstruction(
                senderPublicKey,
                senderAta,
                senderPublicKey,
                USDT_MINT,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )
        );
    }

    return senderAta;
}

// ── Check the sender's USDT balance ─────────────────────────────────────────

/**
 * Returns the sender's USDT balance in smallest unit (BigInt).
 * Returns null if the ATA doesn't exist — callers must distinguish
 * between "has zero balance" and "has no token account at all".
 */
export async function getUsdtBalance(connection, ownerPublicKey) {
    try {
        const ata = await getAssociatedTokenAddress(
            USDT_MINT,
            ownerPublicKey,
            false,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const accountInfo = await connection.getAccountInfo(ata);
        if (!accountInfo) return null; // Account does not exist

        const balance = await connection.getTokenAccountBalance(ata);
        return BigInt(balance.value.amount);
    } catch (err) {
        console.warn('[getUsdtBalance]', err.message);
        return null;
    }
}

/**
 * Human-readable USDT amount from smallest unit.
 * Handles null gracefully.
 * e.g. 200000n → "$0.20", null → "$0.00"
 */
export function formatUsdt(amount) {
    if (amount === null || amount === undefined) return '$0.00';
    const n = Number(amount) / Math.pow(10, USDT_DECIMALS);
    return `$${n.toFixed(2)}`;
}

// ── Build a USDT SPL transfer transaction ────────────────────────────────────

/**
 * Builds an unsigned Transaction that transfers `amount` USDT from
 * `senderPublicKey` to the treasury wallet.
 *
 * @param {Connection}  connection
 * @param {PublicKey}   senderPublicKey
 * @param {bigint}      amount  - in USDT smallest unit
 * @returns {Transaction}
 */
export async function buildUsdtPaymentTx(connection, senderPublicKey, amount) {
    if (!TREASURY_WALLET || TREASURY_WALLET.toString() === PublicKey.default.toString()) {
        throw new Error('NEXT_PUBLIC_TREASURY_WALLET is not configured');
    }

    const transaction = new Transaction();

    const senderAta = await getOrCreateSenderAta(connection, senderPublicKey, transaction);

    const treasuryAta = await getAssociatedTokenAddress(
        USDT_MINT,
        TREASURY_WALLET,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const treasuryAtaInfo = await connection.getAccountInfo(treasuryAta);
    if (!treasuryAtaInfo) {
        transaction.add(
            createAssociatedTokenAccountInstruction(
                senderPublicKey, // sender pays for treasury ATA creation (one-time)
                treasuryAta,
                TREASURY_WALLET,
                USDT_MINT,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )
        );
    }

    transaction.add(
        createTransferCheckedInstruction(
            senderAta,
            USDT_MINT,
            treasuryAta,
            senderPublicKey,
            amount,
            USDT_DECIMALS,
            [],
            TOKEN_PROGRAM_ID
        )
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = senderPublicKey;

    return transaction;
}

// ── Send the payment and return the confirmed signature ──────────────────────

/**
 * Builds, signs, and submits the USDT payment transaction.
 *
 * @param {Connection}  connection
 * @param {PublicKey}   publicKey       - connected wallet public key
 * @param {Function}    signTransaction - wallet adapter signTransaction
 * @param {bigint}      amount          - USDT amount in smallest unit
 * @returns {Promise<string>} confirmed tx signature
 */
export async function sendUsdtPayment(connection, publicKey, signTransaction, amount) {
    const tx = await buildUsdtPaymentTx(connection, publicKey, amount);

    const signed = await signTransaction(tx);
    if (!signed) throw new Error('Transaction signing was cancelled');

    const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
    });

    const confirmation = await connection.confirmTransaction(
        {
            signature,
            blockhash: tx.recentBlockhash,
            lastValidBlockHeight: tx.lastValidBlockHeight,
        },
        'confirmed'
    );

    if (confirmation.value.err) {
        throw new Error(`Payment tx failed on-chain: ${JSON.stringify(confirmation.value.err)}`);
    }

    console.log('[solanaPayment] Payment confirmed:', signature);
    return signature;
}

// ── Attach payment signature to fetch options ────────────────────────────────

/**
 * Wraps fetch options with the X-PAYMENT-TX header pre-attached.
 *
 * @param {string} txSignature
 * @param {Object} fetchOptions
 * @returns {Object}
 */
export function withPaymentHeader(txSignature, fetchOptions = {}) {
    return {
        ...fetchOptions,
        headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
            'X-PAYMENT-TX': txSignature,
        },
    };
}

export default {
    sendUsdtPayment,
    buildUsdtPaymentTx,
    getUsdtBalance,
    formatUsdt,
    withPaymentHeader,
    USDT_MINT,
    USDT_DECIMALS,
    TREASURY_WALLET,
    PAYMENT_AMOUNTS,
};