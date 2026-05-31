/**
 * Solana Wallet Connection - Mobile & Desktop
 * Uses native deeplinks for proper mobile wallet connections
 */

// Detect mobile
const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Check if in wallet's dApp browser
const isInWalletBrowser = () => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('phantom') || ua.includes('solflare') || ua.includes('backpack') || ua.includes('glow');
};

// Get wallet provider (desktop/dApp browser)
const getWalletProvider = (walletName) => {
  const name = walletName.toLowerCase();
  switch (name) {
    case 'phantom': return window.phantom?.solana || window.solana;
    case 'solflare': return window.solflare;
    case 'backpack': return window.backpack;
    case 'glow': return window.glow;
    default: return null;
  }
};

// Build mobile deeplink with proper params
const buildMobileDeeplink = (walletName) => {
  const currentUrl = encodeURIComponent(window.location.origin + window.location.pathname);
  const appName = encodeURIComponent('My App');

  const connectionId = `connect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  sessionStorage.setItem('wallet_connection_id', connectionId);
  sessionStorage.setItem('wallet_connection_wallet', walletName);
  sessionStorage.setItem('wallet_connection_time', Date.now().toString());

  const links = {
    phantom: `phantom://v1/connect?app_url=${currentUrl}&dapp_name=${appName}&cluster=mainnet-beta&redirect=${currentUrl}`,
    solflare: `solflare://v1/connect?app_url=${currentUrl}&dapp_name=${appName}&redirect=${currentUrl}`,
    backpack: `backpack://connect?app_url=${currentUrl}&redirect=${currentUrl}`,
    glow: `glow://connect?app_url=${currentUrl}&redirect=${currentUrl}`
  };

  return links[walletName.toLowerCase()];
};

// Desktop wallet connection
const connectDesktop = async (walletName) => {
  const provider = getWalletProvider(walletName);

  if (!provider) {
    throw new Error(`${walletName} wallet not installed. Please install the browser extension.`);
  }

  try {
    if (walletName.toLowerCase() === 'phantom' && provider.connect) {
      try {
        const resp = await provider.connect({ onlyIfTrusted: true });
        if (resp?.publicKey) {
          const address = resp.publicKey.toString();
          saveWalletConnection(walletName, address);
          return address;
        }
      } catch (e) {
        // Not trusted yet, continue to regular connect
      }
    }

    if (provider.isConnected) {
      await provider.disconnect();
      await new Promise(r => setTimeout(r, 100));
    }

    const response = await provider.connect();
    const publicKey = response?.publicKey || provider.publicKey;

    if (!publicKey) throw new Error('No public key returned');

    const address = publicKey.toString?.() || publicKey.toBase58?.();
    if (!address || address.length < 32) throw new Error('Invalid wallet address');

    saveWalletConnection(walletName, address);
    return address;

  } catch (error) {
    if (error.code === 4001) throw new Error('Connection rejected by user');
    throw error;
  }
};

// Mobile wallet connection
const connectMobile = async (walletName) => {
  if (isInWalletBrowser()) {
    return await connectDesktop(walletName);
  }

  const deeplink = buildMobileDeeplink(walletName);
  if (!deeplink) throw new Error('Wallet not supported on mobile');

  return new Promise((resolve, reject) => {
    let hasReturned = false;
    let checkTimer = null;

    const cleanup = () => {
      if (checkTimer) clearInterval(checkTimer);
      document.removeEventListener('visibilitychange', handleReturn);
      window.removeEventListener('focus', handleReturn);
    };

    const handleReturn = () => {
      if (hasReturned) return;
      hasReturned = true;

      setTimeout(async () => {
        try {
          const provider = getWalletProvider(walletName);

          if (provider?.publicKey) {
            const address = provider.publicKey.toString();
            saveWalletConnection(walletName, address);
            cleanup();
            resolve(address);
            return;
          }

          const urlAddress = checkUrlForAddress();
          if (urlAddress) {
            saveWalletConnection(walletName, urlAddress);
            cleanup();
            resolve(urlAddress);
            return;
          }

          cleanup();
          sessionStorage.removeItem('wallet_connection_id');
          sessionStorage.removeItem('wallet_connection_wallet');
          sessionStorage.removeItem('wallet_connection_time');
          reject(new Error('Could not retrieve wallet address'));

        } catch (err) {
          cleanup();
          reject(err);
        }
      }, 1500);
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') handleReturn();
    });

    window.addEventListener('focus', handleReturn);

    checkTimer = setInterval(() => {
      const provider = getWalletProvider(walletName);
      if (provider?.publicKey) {
        hasReturned = true;
        const address = provider.publicKey.toString();
        saveWalletConnection(walletName, address);
        cleanup();
        resolve(address);
      }
    }, 1000);

    setTimeout(() => {
      if (!hasReturned) {
        cleanup();
        sessionStorage.removeItem('wallet_connection_id');
        sessionStorage.removeItem('wallet_connection_wallet');
        sessionStorage.removeItem('wallet_connection_time');
        reject(new Error('Connection timeout - wallet app did not respond'));
      }
    }, 180000);

    window.location.href = deeplink;
  });
};

// Check URL for wallet address (some wallets return it this way)
const checkUrlForAddress = () => {
  const params = new URLSearchParams(window.location.search);
  const keys = ['phantom_encryption_public_key', 'public_key', 'publicKey', 'address', 'walletAddress'];

  for (const key of keys) {
    const value = params.get(key);
    if (value && value.length >= 32) {
      window.history.replaceState({}, '', window.location.pathname);
      return value;
    }
  }
  return null;
};

// Save wallet connection
const saveWalletConnection = (walletName, address) => {
  localStorage.setItem('wallet_address', address);
  localStorage.setItem('connected_wallet', walletName);
  sessionStorage.removeItem('wallet_connection_id');
  sessionStorage.removeItem('wallet_connection_wallet');
  sessionStorage.removeItem('wallet_connection_time');
};

// Main connect function
export const connectWallet = async (walletName) => {
  try {
    if (isMobile() && !isInWalletBrowser()) {
      return await connectMobile(walletName);
    } else {
      return await connectDesktop(walletName);
    }
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
};

// Disconnect
export const disconnectWallet = async () => {
  const walletName = localStorage.getItem('connected_wallet');
  if (walletName) {
    const provider = getWalletProvider(walletName);
    if (provider?.disconnect) {
      try {
        await provider.disconnect();
      } catch (e) {
        console.error('Disconnect error:', e);
      }
    }
  }

  localStorage.removeItem('wallet_address');
  localStorage.removeItem('connected_wallet');
  sessionStorage.removeItem('wallet_connection_id');
  sessionStorage.removeItem('wallet_connection_wallet');
  sessionStorage.removeItem('wallet_connection_time');
};

// Check for pending connection on page load
export const checkPendingConnection = async () => {
  const urlAddress = checkUrlForAddress();
  if (urlAddress) {
    const wallet = sessionStorage.getItem('wallet_connection_wallet');
    if (wallet) {
      saveWalletConnection(wallet, urlAddress);
      return { success: true, wallet, address: urlAddress };
    }
  }

  const walletName = sessionStorage.getItem('wallet_connection_wallet');
  const connectionTime = sessionStorage.getItem('wallet_connection_time');

  if (!walletName || !connectionTime) {
    return { success: false };
  }

  const elapsed = Date.now() - parseInt(connectionTime);
  if (elapsed > 180000) {
    sessionStorage.removeItem('wallet_connection_id');
    sessionStorage.removeItem('wallet_connection_wallet');
    sessionStorage.removeItem('wallet_connection_time');
    return { success: false };
  }

  const provider = getWalletProvider(walletName);
  if (provider?.publicKey) {
    const address = provider.publicKey.toString();
    saveWalletConnection(walletName, address);
    return { success: true, wallet: walletName, address };
  }

  return { success: false };
};

// Getters
export const getConnectedWalletAddress = () => localStorage.getItem('wallet_address');
export const getConnectedWalletName = () => localStorage.getItem('connected_wallet');
export const isWalletConnected = () => !!getConnectedWalletAddress();
export const isWalletInstalled = (walletName) => !!getWalletProvider(walletName);
export const checkIfMobile = () => isMobile();