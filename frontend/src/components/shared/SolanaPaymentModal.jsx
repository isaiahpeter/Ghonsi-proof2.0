'use client';
// ─────────────────────────────────────────────────────────────────────────────
// SolanaPaymentModal
//
// Shown before any payment-gated action (proof upload, premium profile, etc).
// User pays USDT on Solana, gets back a tx signature, modal calls onSuccess(sig).
// "Get Test Tokens" opens the faucet page in a new tab.
// ─────────────────────────────────────────────────────────────────────────────
 
import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useConnection } from '@solana/wallet-adapter-react';
import { Loader2, AlertCircle, Wallet, CheckCircle, RefreshCw } from 'lucide-react';
import {
    sendUsdtPayment,
    getUsdtBalance,
    formatUsdt,
    PAYMENT_AMOUNTS,
} from '@/utils/solanaPaymentApi';
 
// ── Payment states ───────────────────────────────────────────────────────────
 
const STATE = {
    IDLE:       'idle',
    CHECKING:   'checking',
    SIGNING:    'signing',
    CONFIRMING: 'confirming',
    SUCCESS:    'success',
    ERROR:      'error',
};
 
// ── Component ────────────────────────────────────────────────────────────────
 
/**
 * @param {Object}   props
 * @param {boolean}  props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSuccess         - called with confirmed tx signature
 * @param {'request'|'upload'} props.type    - price tier
 * @param {string}   [props.description]     - what this payment is for
 */
const SolanaPaymentModal = ({
    isOpen,
    onClose,
    onSuccess,
    type = 'request',
    description,
}) => {
    const { publicKey, signTransaction, connected } = useWallet();
    const { connection } = useConnection();
 
    const amount        = PAYMENT_AMOUNTS[type] ?? PAYMENT_AMOUNTS.request;
    const displayAmount = formatUsdt(amount);
    const defaultDesc   = type === 'upload'
        ? `Proof upload — ${displayAmount} USDT`
        : `API access — ${displayAmount} USDT`;
 
    const [state,             setState]             = useState(STATE.IDLE);
    const [error,             setError]             = useState(null);
    const [usdtBalance,       setUsdtBalance]       = useState(null);
    const [signature,         setSignature]         = useState(null);
    const [balanceCheckEpoch, setBalanceCheckEpoch] = useState(0);
 
    // ── Fetch balance on open / after faucet closes ───────────────────────────
 
    useEffect(() => {
        if (!isOpen || !publicKey) return;
 
        setState(STATE.CHECKING);
        setError(null);
        setSignature(null);
 
        getUsdtBalance(connection, publicKey)
            .then(bal => {
                setUsdtBalance(bal);
                setState(STATE.IDLE);
 
                if (bal === null) {
                    setError({
                        message: 'No USDT token account found. Get test USDT to continue.',
                        action: 'get_tokens',
                    });
                }
            })
            .catch(err => {
                console.warn('[SolanaPaymentModal] Balance check failed:', err.message);
                setUsdtBalance(null);
                setState(STATE.IDLE);
                setError({
                    message: 'Unable to check USDT balance. Please retry.',
                    action: 'retry',
                });
            });
    }, [isOpen, publicKey, connection, balanceCheckEpoch]);
 
    // ── Payment handler ───────────────────────────────────────────────────────
 
    const handlePay = useCallback(async () => {
        if (!connected || !publicKey) {
            setError({ message: 'Connect your wallet first.' });
            return;
        }
        if (usdtBalance === null) {
            setError({ message: 'No USDT token account found. Get test USDT first.', action: 'get_tokens' });
            return;
        }
        if (usdtBalance < amount) {
            setError({ message: `Insufficient USDT. You have ${formatUsdt(usdtBalance)} but need ${displayAmount}.`, action: 'get_tokens' });
            return;
        }
 
        setError(null);
        setState(STATE.SIGNING);
 
        try {
            const sig = await sendUsdtPayment(connection, publicKey, signTransaction, amount);
            setState(STATE.CONFIRMING);
            setSignature(sig);
            setState(STATE.SUCCESS);
            setTimeout(() => onSuccess(sig), 800);
        } catch (err) {
            const msg = err.message || '';
            setState(STATE.ERROR);
 
            if (
                msg.includes('4001') ||
                msg.toLowerCase().includes('user rejected') ||
                msg.toLowerCase().includes('rejected the request')
            ) {
                setError({ message: 'Payment cancelled. Click Pay to try again.' });
            } else if (msg.toLowerCase().includes('insufficient')) {
                setError({ message: msg, action: 'get_tokens' });
            } else {
                setError({ message: msg || 'Payment failed. Please try again.' });
            }
        }
    }, [connected, publicKey, connection, signTransaction, amount, displayAmount, usdtBalance, onSuccess]);
 
    // ── Helpers ───────────────────────────────────────────────────────────────
 
    const handleRetry = () => {
        setState(STATE.IDLE);
        setError(null);
        setBalanceCheckEpoch(e => e + 1);
    };
 
    const handleClose = () => {
        setState(STATE.IDLE);
        setError(null);
        setSignature(null);
        onClose();
    };
 
    const handleGetTokens = () => {
        window.open('/faucet', '_blank');
    };
 
    const shortenKey = k => (k ? `${k.slice(0, 6)}...${k.slice(-6)}` : '—');
 
    // ── Derived flags ─────────────────────────────────────────────────────────
 
    const noAccount           = usdtBalance === null;
    const insufficientBalance = !noAccount && usdtBalance < amount;
    const isLoading           = [STATE.CHECKING, STATE.SIGNING, STATE.CONFIRMING].includes(state);
    const payDisabled         = !connected || noAccount || insufficientBalance || isLoading;
 
    // ── Render ────────────────────────────────────────────────────────────────
 
    if (!isOpen) return null;
 
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-[#0B0F1B] to-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl max-w-sm w-full p-6">
 
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-white">USDT Payment</h2>
                    {!isLoading && state !== STATE.SUCCESS && (
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    )}
                </div>
 
                {/* Loading */}
                {isLoading && (
                    <div className="text-center py-8 space-y-3">
                        <div className="flex justify-center">
                            <Loader2 size={36} className="text-[#C19A4A] animate-spin" />
                        </div>
                        <p className="text-white font-medium">
                            {state === STATE.CHECKING   && 'Checking your USDT balance...'}
                            {state === STATE.SIGNING    && 'Waiting for wallet approval...'}
                            {state === STATE.CONFIRMING && 'Confirming on Solana...'}
                        </p>
                        {state === STATE.SIGNING && (
                            <p className="text-xs text-gray-400">
                                Please approve the transaction in your wallet
                            </p>
                        )}
                    </div>
                )}
 
                {/* Success */}
                {state === STATE.SUCCESS && (
                    <div className="text-center py-8 space-y-3">
                        <div className="flex justify-center">
                            <CheckCircle size={40} className="text-green-400" />
                        </div>
                        <p className="text-white font-medium">Payment confirmed!</p>
                        <p className="text-xs font-mono text-gray-400 break-all">
                            {signature?.slice(0, 32)}...
                        </p>
                    </div>
                )}
 
                {/* Main content */}
                {!isLoading && state !== STATE.SUCCESS && (
                    <>
                        {/* Error banner */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <div className="flex gap-2">
                                    <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-xs text-red-200">{error.message}</p>
 
                                        {error.action === 'get_tokens' && (
                                            <button
                                                onClick={handleGetTokens}
                                                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#C19A4A]/20 border border-[#C19A4A]/40 rounded-lg text-[#C19A4A] hover:bg-[#C19A4A]/30 transition-colors"
                                            >
                                                <Wallet size={12} />
                                                Get Test Tokens
                                            </button>
                                        )}
 
                                        {(!error.action || error.action === 'retry') && (
                                            <button
                                                onClick={handleRetry}
                                                className="mt-1.5 flex items-center gap-1 text-xs text-[#C19A4A] hover:text-[#d4a855]"
                                            >
                                                <RefreshCw size={11} /> Retry
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
 
                        {/* Insufficient / no-account warning */}
                        {!error && (insufficientBalance || noAccount) && (
                            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <div className="flex gap-2">
                                    <Wallet size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-xs text-yellow-200">
                                            {noAccount
                                                ? 'No USDT token account found. Get test USDT to continue.'
                                                : `Insufficient USDT. You have ${formatUsdt(usdtBalance)} but need ${displayAmount}.`}
                                        </p>
                                        <button
                                            onClick={handleGetTokens}
                                            className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-200 hover:bg-yellow-500/30 transition-colors"
                                        >
                                            <Wallet size={11} />
                                            Get Test Tokens
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
 
                        {/* Payment details */}
                        <div className="space-y-3 bg-[#1a1f2e] border border-white/10 rounded-lg p-4 mb-5">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">For</span>
                                <span className="text-sm text-white">{description || defaultDesc}</span>
                            </div>
                            <div className="border-t border-white/5" />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Amount</span>
                                <span className="text-lg font-bold text-[#C19A4A]">{displayAmount} USDT</span>
                            </div>
                            <div className="border-t border-white/5" />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Network</span>
                                <span className="text-sm text-white">Solana</span>
                            </div>
                            <div className="border-t border-white/5" />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Your wallet</span>
                                <span className="text-xs font-mono text-white">
                                    {shortenKey(publicKey?.toString())}
                                </span>
                            </div>
                            <div className="border-t border-white/5" />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Your USDT</span>
                                <span className={`text-sm font-medium ${
                                    noAccount           ? 'text-gray-500'  :
                                    insufficientBalance ? 'text-red-400'   : 'text-green-400'
                                }`}>
                                    {noAccount ? 'No account' : formatUsdt(usdtBalance)}
                                </span>
                            </div>
                        </div>
 
                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePay}
                                disabled={payDisabled}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-[#C19A4A] text-black font-semibold hover:bg-[#d4a855] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {!connected ? 'Connect Wallet' : `Pay ${displayAmount}`}
                            </button>
                        </div>
                    </>
                )}
 
            </div>
        </div>
    );
};
 
export default SolanaPaymentModal;