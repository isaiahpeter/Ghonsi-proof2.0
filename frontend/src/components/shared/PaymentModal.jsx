'use client';
// ─────────────────────────────────────────────────────────────────────────────
// X402 Payment Modal
//
// React component that displays payment requirements and handles
// the complete payment flow for x402-gated content.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import { parsePaymentRequirements, formatUSDCAmount, initiatePayment } from '@/utils/x402Api';

// ── Payment States ────────────────────────────────────────────────────────────

const PAYMENT_STATE = {
    IDLE: 'idle',
    INITIATING: 'initiating',
    SIGNING: 'signing',
    CONFIRMING: 'confirming',
    COMPLETED: 'completed',
    FAILED: 'failed',
};

// ── Default Props ────────────────────────────────────────────────────────────

const defaultStyles = {
    overlay: 'fixed inset-0 bg-black/70 flex items-center justify-center z-50',
    modal: 'bg-gray-900 border border-gold/30 rounded-xl p-6 max-w-md w-full mx-4',
    title: 'text-xl font-bold text-gold mb-2',
    description: 'text-gray-300 text-sm mb-4',
    amountBox: 'bg-gray-800 rounded-lg p-4 mb-4',
    amountLabel: 'text-gray-400 text-xs uppercase mb-1',
    amount: 'text-2xl font-bold text-white',
    network: 'text-gray-500 text-xs mt-2',
   button: 'w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200',
    primaryButton: 'bg-gold text-gray-900 hover:bg-yellow-500 disabled:opacity-50',
    secondaryButton: 'bg-gray-700 text-gray-300 hover:bg-gray-600',
    errorBox: 'bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4',
    errorText: 'text-red-400 text-sm',
    loadingSpinner: 'animate-spin h-5 w-5 border-2 border-gold border-t-transparent rounded-full',
};

// ── Main Component ────────────────────────────────────────────────────────────────

export function X402PaymentModal({
    paymentRequirements,
    wallet,
    onSuccess,
    onCancel,
    styles = defaultStyles,
    t,
}) {
    const [state, setState] = useState(PAYMENT_STATE.IDLE);
    const [error, setError] = useState(null);
    const [paymentData, setPaymentData] = useState(null);

    // Format amount for display
    const displayAmount = formatUSDCAmount(paymentRequirements?.maxAmountRequired || '0');
    const network = paymentRequirements?.network || 'base-sepolia';
    const payTo = paymentRequirements?.payTo;
    const description = paymentRequirements?.description || 'Payment required to access this content';

    // Handle payment initiation
    const handleInitiatePayment = useCallback(async () => {
        if (!wallet) {
            setError(t?.noWallet || 'Please connect your wallet first');
            setState(PAYMENT_STATE.FAILED);
            return;
        }

        setState(PAYMENT_STATE.INITIATING);
        setError(null);

        try {
            const data = await initiatePayment(paymentRequirements, wallet);
            setPaymentData(data);
            setState(PAYMENT_STATE.COMPLETED);
            
            if (onSuccess) {
                onSuccess(data);
            }
        } catch (err) {
            console.error('[PaymentModal] Payment failed:', err);
            setError(err.message || 'Payment failed');
            setState(PAYMENT_STATE.FAILED);
        }
    }, [paymentRequirements, wallet, onSuccess]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        if (onCancel) {
            onCancel();
        }
    }, [onCancel]);

    // Loading state component
    const LoadingSpinner = () => (
        <div className={styles.loadingSpinner} />
    );

    // Don't render if no payment requirements
    if (!paymentRequirements) {
        return null;
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {/* Title */}
                <h2 className={styles.title}>
                    {t?.title || 'Payment Required'}
                </h2>

                {/* Description */}
                <p className={styles.description}>
                    {description}
                </p>

                {/* Amount Display */}
                <div className={styles.amountBox}>
                    <div className={styles.amountLabel}>
                        {t?.amountLabel || 'Amount'}
                    </div>
                    <div className={styles.amount}>
                        {displayAmount} USDC
                    </div>
                    <div className={styles.network}>
                        {t?.network || 'Network'}: {network}
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className={styles.errorBox}>
                        <p className={styles.errorText}>{error}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    {state === PAYMENT_STATE.IDLE && (
                        <>
                            <button
                                onClick={handleInitiatePayment}
                                disabled={!wallet}
                                className={`${styles.button} ${styles.primaryButton}`}
                            >
                                {t?.payButton || 'Pay Now'}
                            </button>
                            <button
                                onClick={handleCancel}
                                className={`${styles.button} ${styles.secondaryButton}`}
                            >
                                {t?.cancelButton || 'Cancel'}
                            </button>
                        </>
                    )}

                    {(state === PAYMENT_STATE.INITIATING || state === PAYMENT_STATE.SIGNING) && (
                        <button
                            disabled
                            className={`${styles.button} ${styles.primaryButton} flex items-center justify-center gap-2`}
                        >
                            <LoadingSpinner />
                            {state === PAYMENT_STATE.INITIATING 
                                ? (t?.preparing || 'Preparing payment...')
                                : (t?.signing || 'Please sign in your wallet...')
                            }
                        </button>
                    )}

                    {state === PAYMENT_STATE.COMPLETED && (
                        <div className="text-center">
                            <p className="text-green-400 mb-3">
                                {t?.success || '✓ Payment successful!'}
                            </p>
                            <button
                                onClick={handleCancel}
                                className={`${styles.button} ${styles.secondaryButton}`}
                            >
                                {t?.continueButton || 'Continue'}
                            </button>
                        </div>
                    )}

                    {state === PAYMENT_STATE.FAILED && (
                        <>
                            <button
                                onClick={handleInitiatePayment}
                                className={`${styles.button} ${styles.primaryButton}`}
                            >
                                {t?.retryButton || 'Try Again'}
                            </button>
                            <button
                                onClick={handleCancel}
                                className={`${styles.button} ${styles.secondaryButton}`}
                            >
                                {t?.cancelButton || 'Cancel'}
                            </button>
                        </>
                    )}
                </div>

                {/* Payment recipient */}
                {payTo && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-gray-500 text-xs">
                            {t?.recipient || 'Payment recipient'}: 
                            <span className="text-gray-400 ml-1 font-mono">
                                {payTo.slice(0, 6)}...{payTo.slice(-4)}
                            </span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Hook for managing payment modal state ────────────────────────────────────────

export function usePaymentFlow(wallet = null) {
    const [isOpen, setIsOpen] = useState(false);
    const [paymentRequirements, setPaymentRequirements] = useState(null);
    const [paymentData, setPaymentData] = useState(null);
    const [error, setError] = useState(null);

    // Open modal with payment requirements
    const openPaymentModal = useCallback((requirements) => {
        setPaymentRequirements(requirements);
        setPaymentData(null);
        setError(null);
        setIsOpen(true);
    }, []);

    // Close modal
    const closePaymentModal = useCallback(() => {
        setIsOpen(false);
        setPaymentRequirements(null);
    }, []);

    // Handle successful payment
    const handlePaymentSuccess = useCallback((data) => {
        setPaymentData(data);
        setIsOpen(false);
    }, []);

    // Render the modal component
    const renderModal = useCallback((props = {}) => {
        if (!isOpen || !paymentRequirements) {
            return null;
        }

        return (
            <X402PaymentModal
                paymentRequirements={paymentRequirements}
                wallet={wallet}
                onSuccess={handlePaymentSuccess}
                onCancel={closePaymentModal}
                {...props}
            />
        );
    }, [isOpen, paymentRequirements, wallet, handlePaymentSuccess, closePaymentModal]);

    return {
        isOpen,
        paymentRequirements,
        paymentData,
        error,
        openPaymentModal,
        closePaymentModal,
        handlePaymentSuccess,
        renderModal,
    };
}

// ── Higher-order component for automatic payment handling ────────────────────────────────

export function withX402Payment(WrappedComponent, fetchFn, walletGetter) {
    return function X402PaymentWrapper(props) {
        const [showPayment, setShowPayment] = useState(false);
        const [requirements, setRequirements] = useState(null);
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState(null);

        const handleDataFetch = useCallback(async (...args) => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await fetchFn(...args);
                
                // Check if we got a 402 response
                if (result?.response?.status === 402) {
                    const reqs = parsePaymentRequirements(result.data);
                    if (reqs) {
                        setRequirements(reqs);
                        setShowPayment(true);
                        return null;
                    }
                }

                return result;
            } catch (err) {
                setError(err.message);
                throw err;
            } finally {
                setIsLoading(false);
            }
        }, [fetchFn]);

        const handlePaymentSuccess = useCallback((paymentData) => {
            setShowPayment(false);
            // Retry the original request with payment
            if (props.onPaymentSuccess) {
                props.onPaymentSuccess(paymentData);
            }
        }, [props]);

        const wallet = walletGetter?.();

        return (
            <>
                <WrappedComponent
                    {...props}
                    fetchWithPayment={handleDataFetch}
                    isLoading={isLoading}
                    error={error}
                />
                {showPayment && (
                    <X402PaymentModal
                        paymentRequirements={requirements}
                        wallet={wallet}
                        onSuccess={handlePaymentSuccess}
                        onCancel={() => setShowPayment(false)}
                    />
                )}
            </>
        );
    };
}

// ── Export all components ────────────────────────────────────────────────────────

export default X402PaymentModal;
