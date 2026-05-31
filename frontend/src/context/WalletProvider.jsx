'use client';
import React, { useMemo, useCallback } from 'react';
import {
    ConnectionProvider,
    WalletProvider as SolanaWalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

// Create WalletContext for additional state management
export const WalletContext = React.createContext();

export const WalletProvider = ({ children }) => {
    // Use devnet for development
    const network = 'devnet';
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // Initialize wallet adapters
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new TorusWalletAdapter(),
        ],
        []
    );

    // Handle wallet connection
    const handleWalletConnect = useCallback((publicKey) => {
        if (publicKey) {
            localStorage.setItem('walletAddress', publicKey.toString());
        }
    }, []);

    // Handle wallet disconnect
    const handleWalletDisconnect = useCallback(() => {
        localStorage.removeItem('walletAddress');
    }, []);

    const value = {
        network,
        handleWalletConnect,
        handleWalletDisconnect,
    };

    return (
        <ConnectionProvider endpoint={endpoint}>
            <SolanaWalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <WalletContext.Provider value={value}>
                        {children}
                    </WalletContext.Provider>
                </WalletModalProvider>
            </SolanaWalletProvider>
        </ConnectionProvider>
    );
};

export default WalletProvider;