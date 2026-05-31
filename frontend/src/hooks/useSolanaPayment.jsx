// ─────────────────────────────────────────────────────────────────────────────
// useSolanaPayment Hook
//
// Manages the full Solana USDT payment flow for a component.
//
// Usage:
//   const { pay, isPaying, error, lastSignature } = useSolanaPayment('upload');
//   const sig = await pay();
//   // then attach sig to your API call via withPaymentHeader(sig, fetchOptions)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useConnection } from '@solana/wallet-adapter-react';
import {
    sendUsdtPayment,
    getUsdtBalance,
    formatUsdt,
    PAYMENT_AMOUNTS,
} from '@/utils/solanaPaymentApi';

/**
 * @param {'request' | 'upload'} type - which price tier to use
 */
export function useSolanaPayment(type = 'request') {
    const { publicKey, signTransaction, connected } = useWallet();
    const { connection } = useConnection();

    const amount = PAYMENT_AMOUNTS[type] ?? PAYMENT_AMOUNTS.request;

    const [isPaying,       setIsPaying]       = useState(false);
    const [error,          setError]          = useState(null);
    const [lastSignature,  setLastSignature]  = useState(null);
    const [usdtBalance,    setUsdtBalance]    = useState(null);

    // ── Fetch and cache USDT balance ─────────────────────────────────────────

    const fetchBalance = useCallback(async () => {
        if (!publicKey) return null;
        try {
            const bal = await getUsdtBalance(connection, publicKey);
            setUsdtBalance(bal);
            return bal;
        } catch (err) {
            console.warn('[useSolanaPayment] Balance fetch failed:', err.message);
            return null;
        }
    }, [connection, publicKey]);

    // ── Pay ──────────────────────────────────────────────────────────────────

    /**
     * Triggers the full payment flow:
     *  1. Verifies wallet is connected
     *  2. Fetches USDT balance (null = no token account)
     *  3. Guards against missing account and insufficient balance
     *  4. Builds, signs, and submits the USDT transfer
     *  5. Returns the confirmed tx signature
     *
     * Throws on failure so the caller can handle it.
     */
    const pay = useCallback(async () => {
        if (!connected || !publicKey) {
            throw new Error('Wallet not connected');
        }

        setIsPaying(true);
        setError(null);

        try {
            const bal = await fetchBalance();

            // null means the token account doesn't exist yet
            if (bal === null) {
                throw new Error(
                    `No USDT token account found. ` +
                    `Get test USDT from https://t.me/ghonsiproofhub`
                );
            }

            if (bal < amount) {
                throw new Error(
                    `Insufficient USDT. ` +
                    `You have ${formatUsdt(bal)} but need ${formatUsdt(amount)}.`
                );
            }

            const signature = await sendUsdtPayment(
                connection,
                publicKey,
                signTransaction,
                amount
            );

            setLastSignature(signature);
            return signature;
        } catch (err) {
            const msg = err.message || 'Payment failed';
            setError(msg);
            throw err;
        } finally {
            setIsPaying(false);
        }
    }, [connected, publicKey, connection, signTransaction, amount, fetchBalance]);

    // ── Helpers ───────────────────────────────────────────────────────────────

    const clearError     = useCallback(() => setError(null),        []);
    const clearSignature = useCallback(() => setLastSignature(null), []);

    // ── Public API ────────────────────────────────────────────────────────────

    return {
        // Actions
        pay,
        fetchBalance,
        clearError,
        clearSignature,
        // State
        isPaying,
        error,
        lastSignature,
        usdtBalance,
        amount,
        amountFormatted: formatUsdt(amount),
        // Derived
        hasPaid:  !!lastSignature,
        isReady:  connected && !!publicKey,
        noAccount: usdtBalance === null,
        insufficientBalance: usdtBalance !== null && usdtBalance < amount,
    };
}

export default useSolanaPayment;