/**
 * Blockchain Submission API
 * Handles submission of proofs to the Solana blockchain
 */

import { supabase } from '@/lib/supabaseClient';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

// FIX: use full backend URL, not a relative path (which 404s on Vercel)
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

/**
 * Submit proof to blockchain via backend
 * @param {Object} proofData - Proof information to submit
 * @param {string} proofData.proofId - Unique proof ID
 * @param {string} proofData.title - Proof title
 * @param {string} proofData.description - Proof description
 * @param {string} proofData.proofType - Type of proof
 * @param {string} proofData.ipfsUri - IPFS URI for metadata
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<Object>} Transaction result with hash, PDA, mint, URI
 */
export const submitProofToBlockchain = async (proofData, walletAddress) => {
  try {
    console.log('[v0] Submitting proof to blockchain:', proofData.proofId);

    // FIX: blockchain backend requires proofId max 32 chars.
    // Supabase UUIDs are 36 chars with dashes — strip dashes to get exactly 32 hex chars.
    const blockchainProofId = proofData.proofId.replace(/-/g, '');

    const submissionData = {
      proofId: blockchainProofId,
      title: proofData.title,
      description: proofData.description,
      proofType: proofData.proofType,
      ipfsUri: proofData.ipfsUri,
      walletAddress: walletAddress,
      timestamp: new Date().toISOString(),
    };

    // FIX: full URL so this works in production on Vercel
    const response = await fetch(`${BACKEND_URL}/api/submit-proof`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to submit proof to blockchain');
    }

    const result = await response.json();
    console.log('[v0] Blockchain submission successful:', result);

    return result;
  } catch (error) {
    console.error('[v0] Blockchain submission error:', error);
    throw error;
  }
};

/**
 * Update proof with blockchain transaction data
 * @param {string} proofId - Proof database ID
 * @param {Object} blockchainData - Data from blockchain submission
 */
export const updateProofWithBlockchainData = async (proofId, blockchainData) => {
  try {
    const { data, error } = await supabase
      .from('proofs')
      .update({
        blockchain_tx: blockchainData.tx,
        status: 'submitted_onchain',
        updated_at: new Date().toISOString(),
      })
      .eq('id', proofId)
      .select()
      .single();

    if (error) throw error;
    console.log('[v0] Proof updated with blockchain data:', proofId);
    return data;
  } catch (error) {
    console.error('[v0] Error updating proof with blockchain data:', error);
    throw error;
  }
};

/**
 * Get proof status including blockchain verification
 * @param {string} proofId - Proof database ID
 * @returns {Promise<Object>} Proof with blockchain status
 */
export const getProofBlockchainStatus = async (proofId) => {
  try {
    const { data, error } = await supabase
      .from('proofs')
      .select('id, proof_name, blockchain_tx, status, created_at')
      .eq('id', proofId)
      .single();

    if (error) throw error;

    return {
      ...data,
      isSubmittedOnchain: !!data.blockchain_tx,
      transactionLink: data.blockchain_tx
        ? `https://explorer.solana.com/tx/${data.blockchain_tx}?cluster=devnet`
        : null,
    };
  } catch (error) {
    console.error('[v0] Error fetching proof blockchain status:', error);
    throw error;
  }
};

/**
 * Check wallet balance before submission
 * @param {PublicKey} publicKey - Wallet public key
 * @param {Connection} connection - Solana connection
 * @returns {Promise<number>} Balance in SOL
 */
export const checkWalletBalance = async (publicKey, connection) => {
  try {
    const balance = await connection.getBalance(publicKey);
    const balanceInSol = balance / LAMPORTS_PER_SOL;
    console.log('[v0] Wallet balance:', balanceInSol, 'SOL');
    return balanceInSol;
  } catch (error) {
    console.error('[v0] Error checking wallet balance:', error);
    throw error;
  }
};

/**
 * Verify blockchain transaction
 * @param {string} txHash - Transaction hash to verify
 * @param {Connection} connection - Solana connection
 * @returns {Promise<boolean>} Whether transaction was confirmed
 */
export const verifyBlockchainTransaction = async (txHash, connection) => {
  try {
    const status = await connection.getSignatureStatus(txHash);

    if (
      status.value?.confirmationStatus === 'confirmed' ||
      status.value?.confirmationStatus === 'finalized'
    ) {
      console.log('[v0] Transaction verified as confirmed');
      return true;
    }

    console.log('[v0] Transaction status:', status.value?.confirmationStatus);
    return false;
  } catch (error) {
    console.error('[v0] Error verifying transaction:', error);
    throw error;
  }
};