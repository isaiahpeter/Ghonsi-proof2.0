// Authentication utility functions
// Updated to support Solana wallet authentication

import { disconnectWallet } from './walletAdapter';

export const login = (email, walletAddress) => {
  localStorage.setItem('userLoggedIn', 'true');
  if (email) localStorage.setItem('userEmail', email);
  if (walletAddress) {
    localStorage.setItem('wallet_address', walletAddress);
  }
};

export const logout = async () => {
  // Disconnect wallet if connected
  try {
    await disconnectWallet();
  } catch (e) {
    console.error('Wallet disconnect error:', e);
  }

  localStorage.removeItem('userLoggedIn');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('wallet_address');
  localStorage.removeItem('connected_wallet');
};

export const isAuthenticated = () => {
  return (
    localStorage.getItem('userLoggedIn') === 'true' ||
    !!localStorage.getItem('wallet_address')
  );
};

export const getCurrentUser = () => {
  const walletAddress = localStorage.getItem('wallet_address');
  const connectedWallet = localStorage.getItem('connected_wallet');

  return {
    email: localStorage.getItem('userEmail'),
    wallet: walletAddress,
    connectedWallet: connectedWallet,
    isLoggedIn: isAuthenticated()
  };
};