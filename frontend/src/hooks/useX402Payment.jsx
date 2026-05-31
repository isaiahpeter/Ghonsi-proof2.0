// ─────────────────────────────────────────────────────────────────────────────
// useX402Payment Hook
//
// React hook for handling x402 payment flows in components.
// Provides automatic payment detection, modal management, and retry logic.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from 'react';
import { parsePaymentRequirements, fetchWithX402, isPaymentRequired } from '@/utils/x402Api';
import PaymentModal from '../components/PaymentModal';

// ── Hook Factory ────────────────────────────────────────────────────────────────

/**
 * Hook for managing x402 payment flows
 * 
 * @param {Object} options - Configuration options
 * @param {Object} options.wallet - Connected wallet instance
 * @param {string} options.baseUrl - Base API URL (optional)
 * @returns {Object} Payment management API
 * 
 * @example
 * const { pay, requirements, isPaying, error, modal } = useX402Payment({ wallet });
 */
export function useX402Payment(options = {}) {
    const { wallet: initialWallet } = options;
    
    const [wallet, setWallet] = useState(initialWallet);
    const [isOpen, setIsOpen] = useState(false);
    const [requirements, setRequirements] = useState(null);
    const [isPaying, setIsPaying] = useState(false);
    const [error, setError] = useState(null);
    const [lastPayment, setLastPayment] = useState(null);

    // Update wallet if it changes
    useEffect(() => {
        if (initialWallet) {
            setWallet(initialWallet);
        }
    }, [initialWallet]);

    // Open payment modal with requirements
    const openPayment = useCallback((reqs) => {
        setRequirements(reqs);
        setError(null);
        setIsOpen(true);
    }, []);

    // Close payment modal
    const closePayment = useCallback(() => {
        setIsOpen(false);
    }, []);

    // Handle successful payment
    const onPaymentSuccess = useCallback((data) => {
        setLastPayment(data);
        setIsOpen(false);
        setIsPaying(false);
        return data;
    }, []);

    // Handle payment error
    const onPaymentError = useCallback((err) => {
        setError(err.message || 'Payment failed');
        setIsPaying(false);
    }, []);

    // Fetch data with automatic payment handling
    const fetchWithPayment = useCallback(async (url, fetchOptions = {}) => {
        setIsPaying(false);
        setError(null);

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                headers: {
                    'Content-Type': 'application/json',
                    ...fetchOptions.headers,
                },
            });

            // Check for 402
            if (response.status === 402) {
                const data = await response.json();
                const reqs = parsePaymentRequirements(data);
                
                if (reqs) {
                    openPayment(reqs);
                    return { requiresPayment: true, requirements: reqs, response };
                }
            }

            // Handle 404 and other non-OK responses
            if (!response.ok) {
                const errorText = await response.text();
                const err = new Error(`Request failed: ${response.status} ${response.statusText}`);
                setError(err.message);
                console.error('fetchWithPayment error:', response.status, url, errorText);
                throw err;
            }

            // Success - return parsed data
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                return { data: await response.json(), response };
            }
            
            return { data: await response.text(), response };
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [openPayment]);

    // Execute a protected API call with payment retry
    const executeWithPayment = useCallback(async (apiCall) => {
        setIsPaying(true);
        setError(null);

        try {
            const result = await apiCall();
            return result;
        } catch (err) {
            // Check if it's a 402 error (axios-style or fetch-style)
            const is402 = isPaymentRequired(err) || err.status === 402 || err.message?.includes('402');
            
            if (is402) {
                const responseData = err.response?.data || err.data;
                const reqs = parsePaymentRequirements(responseData);
                if (reqs) {
                    openPayment(reqs);
                    return { requiresPayment: true, requirements: reqs };
                }
            }
            setError(err.message);
            throw err;
        } finally {
            setIsPaying(false);
        }
    }, [openPayment]);

    // Get payment modal component props
    const modalProps = {
        paymentRequirements: requirements,
        wallet,
        onSuccess: onPaymentSuccess,
        onCancel: closePayment,
    };

    return {
        // State
        wallet,
        isOpen,
        requirements,
        isPaying,
        error,
        lastPayment,
        
        // Actions
        setWallet,
        openPayment,
        closePayment,
        fetchWithPayment,
        executeWithPayment,
        
        // Modal
        modalProps,
        
        // Helpers
        hasPayment: !!lastPayment,
        needsPayment: !!requirements,
    };
}

// ── Async Hook Variant ────────────────────────────────────────────────────────────

/**
 * Hook for handling async API calls with automatic x402 payment retry
 * 
 * @param {Function} fetcher - Async function that returns a Promise
 * @param {Object} options - Configuration
 * @returns {Object} API with loading, error, and payment handling
 * 
 * @example
 * const { data, loading, error, retry } = useX402Fetch(fetchPremiumGig);
 */
export function useX402Fetch(fetcher, options = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const payment = useX402Payment(options);

    // Execute fetch with payment handling
    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetcher(...args);
            setData(result);
            return result;
        } catch (err) {
            // Check for 402
            if (isPaymentRequired(err)) {
                const reqs = parsePaymentRequirements(err.response?.data);
                if (reqs) {
                    payment.openPayment(reqs);
                    // Don't set error - we're showing payment modal
                    return null;
                }
            }
            setError(err.message || 'Request failed');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetcher, payment]);

    // Retry after payment
    const retry = useCallback(async (...args) => {
        // Use the payment data from the last successful payment
        if (payment.lastPayment) {
            return execute(...args);
        }
        return execute(...args);
    }, [execute, payment]);

    return {
        data,
        loading,
        error,
        execute,
        retry,
        ...payment,
    };
}

// ── Component-ready HOC ─────────────────────────────────────────────────────────

/**
 * Higher-order component for adding x402 payment handling
 * 
 * @param {React.Component} Component - Component to wrap
 * @param {Function} getWallet - Function returning wallet instance
 * @returns {React.Component} Wrapped component with payment handling
 * 
 * @example
 * const PremiumGigContent = withX402Payment(GigContent, () => wallet);
 */
export function withX402Payment(Component, getWallet) {
    return function X402WrappedComponent(props) {
        const payment = useX402Payment({ wallet: getWallet?.() });
        
        // Inject payment props into component
        const enhancedProps = {
            ...props,
            x402: {
                pay: payment.openPayment,
                close: payment.closePayment,
                isPaying: payment.isPaying,
                error: payment.error,
                hasPaid: payment.hasPayment,
            },
        };

        return (
            <>
                <Component {...enhancedProps} />
                {payment.isOpen && <PaymentModal {...payment.modalProps} />}
            </>
        );
    };
}

// ── Export all ─────────────────────────────────────────────────────────────────────────────

export default useX402Payment;
