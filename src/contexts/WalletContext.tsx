"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { isConnected, isAllowed, getAddress, setAllowed, signTransaction } from '@stellar/freighter-api';
import UniversalProvider from '@walletconnect/universal-provider';
import { WalletConnectModal } from '@walletconnect/modal';

// We use a public test Project ID for demonstration. In production, this should be an env variable.
const PROJECT_ID = '9b87bb5f71758c081eaf921501bcae52';

export type WalletType = 'freighter' | 'walletconnect' | null;

interface WalletContextType {
  address: string | null;
  walletType: WalletType;
  connectFreighter: () => Promise<void>;
  connectWalletConnect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTx: (xdr: string, network?: string) => Promise<string>;
  showWalletModal: boolean;
  setShowWalletModal: (show: boolean) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [wcProvider, setWcProvider] = useState<UniversalProvider | null>(null);

  // Initialize WalletConnect Provider
  useEffect(() => {
    const initWC = async () => {
      try {
        const provider = await UniversalProvider.init({
          projectId: PROJECT_ID,
          metadata: {
            name: 'SafeSplit',
            description: 'Trustless Milestone Escrow on Stellar Soroban',
            url: typeof window !== 'undefined' ? window.location.origin : 'https://safesplit.app',
            icons: ['https://stellar.org/favicon.ico'],
          },
        });
        setWcProvider(provider);
        
        // Auto-reconnect if session exists
        if (provider.session) {
          const namespaces = provider.session.namespaces;
          const stellarAccounts = namespaces?.stellar?.accounts;
          if (stellarAccounts && stellarAccounts.length > 0) {
            // Account format is stellar:testnet:G...
            const wcAddress = stellarAccounts[0].split(':')[2];
            setAddress(wcAddress);
            setWalletType('walletconnect');
          }
        }
      } catch (err) {
        console.error('WalletConnect init failed', err);
      }
    };
    initWC();
  }, []);

  // Check Freighter auto-connect
  useEffect(() => {
    if (walletType === 'walletconnect') return; // Don't override WC

    const checkFreighter = async () => {
      try {
        const connected = await isConnected();
        if (connected && connected.isConnected) {
          const allowed = await isAllowed();
          if (allowed && allowed.isAllowed) {
            const addr = await getAddress();
            if (addr && addr.address) {
              setAddress(addr.address);
              setWalletType('freighter');
            }
          }
        }
      } catch (err) {
        console.error('Freighter auto-connect failed', err);
      }
    };
    checkFreighter();
  }, [walletType]);

  const connectFreighter = async () => {
    try {
      const connected = await isConnected();
      if (!connected.isConnected) {
        alert('Freighter is not installed or locked.');
        return;
      }
      const allowed = await setAllowed();
      if (allowed.isAllowed) {
        const addr = await getAddress();
        if (addr && addr.address) {
          setAddress(addr.address);
          setWalletType('freighter');
          setShowWalletModal(false);
        }
      }
    } catch (err) {
      console.error('Freighter connect failed', err);
      alert('Failed to connect Freighter. See console.');
    }
  };

  const connectWalletConnect = async () => {
    if (!wcProvider) {
      alert('WalletConnect is still initializing...');
      return;
    }
    try {
      const modal = new WalletConnectModal({
        projectId: PROJECT_ID,
        chains: ['stellar:pubnet', 'stellar:testnet'],
      });

      wcProvider.on('display_uri', (uri: string) => {
        modal.openModal({ uri });
      });

      const session = await wcProvider.connect({
        namespaces: {
          stellar: {
            methods: ['stellar_signXDR', 'stellar_signAndSubmitXDR'],
            chains: ['stellar:testnet'],
            events: ['chainChanged', 'accountsChanged'],
          },
        },
      });

      if (session) {
        const stellarAccounts = session.namespaces.stellar.accounts;
        if (stellarAccounts && stellarAccounts.length > 0) {
          const wcAddress = stellarAccounts[0].split(':')[2];
          setAddress(wcAddress);
          setWalletType('walletconnect');
          setShowWalletModal(false);
        }
      }
      modal.closeModal();
    } catch (err) {
      console.error('WalletConnect connection failed', err);
      alert('WalletConnect connection failed.');
    }
  };

  const disconnect = async () => {
    if (walletType === 'walletconnect' && wcProvider) {
      await wcProvider.disconnect();
    }
    setAddress(null);
    setWalletType(null);
  };

  const signTx = async (xdr: string, network: string = 'Test SDF Network ; September 2015') => {
    if (walletType === 'walletconnect' && wcProvider) {
      try {
        const result = await wcProvider.client.request({
          chainId: 'stellar:testnet',
          topic: wcProvider.session?.topic!,
          request: {
            method: 'stellar_signXDR',
            params: { xdr, networkPassphrase: network },
          },
        });
        return (result as any).signedXDR || result;
      } catch (err) {
        console.error('WalletConnect sign failed', err);
        throw err;
      }
    } else {
      // Default to freighter
      const result = await signTransaction(xdr, { networkPassphrase: network });
      return typeof result === 'string' ? result : (result as any).signedTxXdr || (result as any).xdr;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        walletType,
        connectFreighter,
        connectWalletConnect,
        disconnect,
        signTx,
        showWalletModal,
        setShowWalletModal,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
