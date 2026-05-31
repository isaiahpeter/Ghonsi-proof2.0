import {
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

/**
 * Creates a transaction to transfer SOL to the treasury wallet
 * Uses devnet by default
 */
export const createTransferTransaction = async (
  fromPublicKey,
  amount,
  toAddress,
  connection
) => {
  try {
    console.log('Creating transfer transaction:', {
      from: fromPublicKey.toString(),
      to: toAddress,
      amount: `${amount} SOL`,
    });

    const toPublicKey = new PublicKey(toAddress);
    const lamports = amount * LAMPORTS_PER_SOL;

    const instruction = SystemProgram.transfer({
      fromPubkey: fromPublicKey,
      toPubkey: toPublicKey,
      lamports: Math.floor(lamports),
    });

    // FIX: getLatestBlockhash() is the correct modern API
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: fromPublicKey,
    });

    transaction.add(instruction);

    // Attach for downstream confirmation use
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    console.log('Transaction created successfully');
    return transaction;
  } catch (error) {
    console.error('Error creating transfer transaction:', error);
    throw error;
  }
};

/**
 * Validates a Solana wallet address
 */
export const isValidSolanaAddress = (address) => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

/**
 * Gets the transaction size in bytes (approximate)
 * Handles unsigned/partially-signed transactions safely
 */
export const getTransactionSize = (transaction) => {
  try {
    return transaction.serialize({ requireAllSignatures: false }).length;
  } catch (error) {
    console.warn('Could not serialize transaction for size check:', error.message);
    return 0;
  }
};

/**
 * Estimates the transaction fee using the modern getFeeForMessage API
 * Falls back to 5000 lamports (~0.000005 SOL) if estimation fails
 */
export const estimateTransactionFee = async (connection, transaction) => {
  try {
    // FIX: getRecentBlockhash + feeCalculator is fully deprecated.
    // Use getFeeForMessage with the transaction's compiled message instead.
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const message = transaction.compileMessage();
    const feeResponse = await connection.getFeeForMessage(message);

    if (feeResponse?.value != null) {
      return feeResponse.value;
    }

    // Fallback
    return 5000;
  } catch (error) {
    console.error('Error estimating fee:', error);
    return 5000;
  }
};

/**
 * Formats lamports to SOL with decimals
 */
export const formatLamportsToSol = (lamports) => {
  return (lamports / LAMPORTS_PER_SOL).toFixed(9);
};