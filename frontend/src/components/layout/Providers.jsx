'use client';
import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletContext } from '@/context/WalletProvider';
import { AgentProvider } from '@/context/AgentProvider';

export default function Providers({ children }) {
  const network = 'devnet';
  const endpoint = useMemo(() => clusterApiUrl(network), []);
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  const walletContextValue = { network };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <WalletContext.Provider value={walletContextValue}>
            <AgentProvider>
              {children}
            </AgentProvider>
          </WalletContext.Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
