'use client';
import React, { useState, useEffect, useRef } from 'react';

/* eslint-disable no-unused-vars */
import { useWallet } from '@/hooks/useWallet';
import { useConnection } from '@solana/wallet-adapter-react';
import { Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { Loader2, AlertCircle, ShieldCheck, RefreshCw, Wallet } from 'lucide-react';
import '@/app/(professionals)/professionals/upload/upload.css';

const MIN_SOL_REQUIRED = 0.003;

const TransactionSignerModal = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  mintData,
  displayData,
  paymentSignature,   // ← NEW: USDT payment tx sig from SolanaPaymentModal
}) => {
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();

  const [isLoading, setIsLoading] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState(null);
  const [preparedTx, setPreparedTx] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [insufficientBalance, setInsufficientBalance] = useState(false);

  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (!isOpen || !mintData) return;
    isSubmittingRef.current = false;
    setError(null);
    setIsLoading(false);
    setPreparedTx(null);
    setWalletBalance(null);
    setInsufficientBalance(false);
    checkBalanceThenFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mintData]);

  const checkBalanceThenFetch = async () => {
    if (!publicKey) {
      setError('Wallet not connected. Please connect your wallet first.');
      return;
    }
    try {
      const lamports = await connection.getBalance(publicKey);
      const sol = lamports / LAMPORTS_PER_SOL;
      setWalletBalance(sol);
      if (sol < MIN_SOL_REQUIRED) {
        setInsufficientBalance(true);
        return;
      }
    } catch (err) {
      console.warn('[modal] Balance check failed (non-fatal):', err.message);
    }
    fetchPartialTx();
  };

  const fetchPartialTx = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (!backendUrl) {
      setError('Backend URL is not configured. Set NEXT_PUBLIC_API_URL.');
      return;
    }
    console.log('[debug] BACKEND_URL:', backendUrl);
    console.log('[debug] mintData being sent:', mintData);
    console.log('[debug] paymentSignature being sent:', paymentSignature);

    if (!paymentSignature) {
      setError('Payment signature missing. Please complete the USDT payment first.');
      return;
    }

    // ✅ Validate mintData has all required fields
    if (!mintData) {
      setError('Transaction data not ready. Please try again.');
      return;
    }

    // Backend expects non-empty strings (trimmed). Falsy check on strings breaks
    // when fields are '' or whitespace.
    const normalize = (v) => {
      if (v === null || v === undefined) return '';
      return typeof v === 'string' ? v.trim() : v;
    };

    const normalizedMintData = {
      ...mintData,
      ownerWallet: normalize(mintData.ownerWallet),
      proofId: normalize(mintData.proofId),
      ipfsUri: normalize(mintData.ipfsUri),
      title: normalize(mintData.title),
      description: normalize(mintData.description),
      proofType: normalize(mintData.proofType),
    };

    // Quick debug to confirm what we send to /api/prepare-mint.
    // If paymentSignature is empty/expired/malformed or if backend expects
    // different field names, this is where we catch it.
    console.log('FINAL PAYLOAD:', normalizedMintData);
    console.log('PAYMENT SIGNATURE:', paymentSignature);

    const required = ['ownerWallet', 'proofId', 'ipfsUri', 'title', 'description', 'proofType'];
    const missing = required.filter((field) => {
      const v = normalizedMintData[field];
      // treat null/undefined/'' as missing; allow other types (e.g. objects) if backend accepts them
      return v === '' || v === null || v === undefined;
    });

    console.log('[modal] prepare-mint payload validation:', {
      paymentSignaturePresent: !!paymentSignature,
      mintDataPresent: !!mintData,
      normalizedMintData,
      missing,
    });

    if (missing.length > 0) {
      console.error('[modal] Missing fields in mintData:', missing);
      console.error('[modal] Current mintData:', mintData);
      console.error('[modal] Normalized mintData:', normalizedMintData);
      setError(`Transaction data incomplete. Missing: ${missing.join(', ')}`);
      return;
    }

    setIsPreparing(true);
    setError(null);
    try {
      const response = await fetch(
        `${backendUrl}/api/prepare-mint`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-PAYMENT-TX': paymentSignature,   // ← pass the confirmed USDT tx sig
          },
          body: JSON.stringify(normalizedMintData),
        }
      );

      console.log('[debug] Response status:', response.status);
      const text = await response.text();
      console.log('[debug] Response text:', text);

      if (!response.ok) {
        throw new Error(`Server error ${response.status}: ${text.slice(0, 120)}`);
      }

      const data = JSON.parse(text);
      if (!data.success) throw new Error(data.error || 'Failed to prepare transaction');
      setPreparedTx(data.transaction);
    } catch (err) {
      console.error('[modal] prepare-mint error:', err);
      setError(`Could not prepare transaction: ${err.message}`);
    } finally {
      setIsPreparing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setPreparedTx(null);
    setInsufficientBalance(false);
    isSubmittingRef.current = false;
    checkBalanceThenFetch();
  };

  const handleClose = () => {
    setError(null);
    setIsLoading(false);
    setIsPreparing(false);
    setPreparedTx(null);
    setWalletBalance(null);
    setInsufficientBalance(false);
    isSubmittingRef.current = false;
    onClose();
  };

  const handleSign = async () => {
    if (isSubmittingRef.current) return;
    if (!publicKey || !connected) {
      setError('Wallet not connected. Please connect your wallet first.');
      return;
    }
    if (!preparedTx) {
      setError('Transaction not ready yet. Please wait or retry.');
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const txBuffer = Buffer.from(preparedTx, 'base64');
      const transaction = Transaction.from(txBuffer);

      const signedTx = await signTransaction(transaction);
      if (!signedTx) throw new Error('Transaction signing was cancelled or failed.');

      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      if (confirmation.value.err) {
        throw new Error(`Transaction failed on-chain: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('[modal] Proof tx confirmed:', signature);
      isSubmittingRef.current = false;
      onSuccess({ txHash: signature });

    } catch (err) {
      console.error('[modal] Sign error:', err);
      isSubmittingRef.current = false;

      const msg = err.message || '';
      if (
        msg.includes('4001') ||
        msg.toLowerCase().includes('user rejected') ||
        msg.toLowerCase().includes('rejected the request')
      ) {
        setError('Signature cancelled. Click "Sign & Submit" to try again.');
      } else if (msg.includes('already been processed')) {
        setError('This transaction was already submitted. Click Retry to get a fresh transaction.');
        setPreparedTx(null);
      } else if (msg.includes('account') && msg.includes('already in use')) {
        setError('Proof ID conflict. Closing modal to generate a fresh ID...');
        setPreparedTx(null);
        setTimeout(() => { if (onError) onError(); }, 2000);
      } else if (msg.includes('custom program error: 0x0')) {
        setError('Account already exists. Closing modal to generate a fresh proof ID...');
        setPreparedTx(null);
        setTimeout(() => { if (onError) onError(); }, 2000);
      } else if (msg.toLowerCase().includes('insufficient')) {
        setError('Insufficient SOL balance. You need at least 0.003 SOL to cover rent and fees.');
        setInsufficientBalance(true);
      } else {
        setError(msg || 'Failed to sign and send transaction.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const shortenKey = (key) => key ? `${key.slice(0, 8)}...${key.slice(-8)}` : '—';
  const balanceDisplay = walletBalance !== null ? `${walletBalance.toFixed(4)} SOL` : '—';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#0B0F1B] to-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Submit Proof On-Chain</h2>
          {!isLoading && !isPreparing && (
            <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
          )}
        </div>

        {/* Loading / Preparing */}
        {(isLoading || isPreparing) && (
          <div className="space-y-4 text-center py-6">
            <div className="flex justify-center">
              <Loader2 size={40} className="text-[#C19A4A] animate-spin" />
            </div>
            <p className="text-white font-medium">
              {isPreparing ? 'Preparing transaction...' : 'Anchoring your proof on-chain...'}
            </p>
            <p className="text-sm text-gray-400">
              {isPreparing
                ? 'Building and authorising on the backend'
                : 'Please approve in your wallet and wait for confirmation'}
            </p>
          </div>
        )}

        {/* Insufficient balance warning */}
        {insufficientBalance && !isLoading && !isPreparing && (
          <div className="mb-5 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex gap-3">
            <Wallet size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-200 font-medium">Insufficient SOL balance</p>
              <p className="text-xs text-yellow-300/70 mt-1">
                You need at least <span className="font-semibold text-yellow-200">0.003 SOL</span> to
                cover the PDA rent (~0.002 SOL) and transaction fee.
                Your current balance: <span className="font-semibold text-yellow-200">{balanceDisplay}</span>.
                Top up your wallet and click Retry.
              </p>
              <button
                onClick={handleRetry}
                className="mt-2 flex items-center gap-1.5 text-xs text-[#C19A4A] hover:text-[#d4a855] transition-colors"
              >
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          </div>
        )}

       
        {/* Main content — only show when ready */}
        {!isLoading && !isPreparing && !insufficientBalance && (
          <>
            <div className="space-y-4 mb-6">

              {/* Rent info callout */}
              <div className="p-4 bg-[#C19A4A]/10 border border-[#C19A4A]/30 rounded-lg flex gap-3">
                <ShieldCheck size={20} className="text-[#C19A4A] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-[#e8c97a] font-medium">Small SOL deposit required</p>
                  <p className="text-xs text-[#C19A4A]/80 mt-1">
                    ~0.002 SOL covers the on-chain account rent. This is <span className="font-semibold text-[#e8c97a]">fully recoverable</span> —
                    you get it back if the proof is ever rejected or revoked.
                  </p>
                </div>
              </div>

              {/* Proof details */}
              <div className="space-y-3 bg-[#1a1f2e] border border-white/10 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Proof</span>
                  <span className="text-sm text-white font-medium truncate max-w-[200px]">
                    {displayData?.proofName || '—'}
                  </span>
                </div>
                <div className="border-t border-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Type</span>
                  <span className="text-sm text-white capitalize">
                    {displayData?.proofType?.replace(/_/g, ' ') || '—'}
                  </span>
                </div>
                <div className="border-t border-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Owner (you)</span>
                  <span className="text-xs font-mono text-white">
                    {publicKey ? shortenKey(publicKey.toString()) : '—'}
                  </span>
                </div>
                <div className="border-t border-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Your balance</span>
                  <span className="text-sm text-white">{balanceDisplay}</span>
                </div>
                <div className="border-t border-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Rent deposit</span>
                  <span className="text-sm font-semibold text-[#C19A4A]">~0.002 SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Tx fee</span>
                  <span className="text-sm text-gray-300">~0.000005 SOL</span>
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-blue-200">
                  Your wallet signature anchors this proof permanently to your identity on-chain.
                  The proof record and IPFS document are immutable once submitted.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSign}
                disabled={!connected || !preparedTx}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#C19A4A] text-black font-medium hover:bg-[#d4a855] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!connected ? 'Connect Wallet' :
                  !preparedTx ? 'Preparing...' :
                    'Sign & Submit'}
              </button>
            </div>
          </>
        )}

        {/* Show cancel button alone when insufficient balance hides main content */}
        {insufficientBalance && !isLoading && !isPreparing && (
          <div className="flex gap-3 mt-2">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default TransactionSignerModal;