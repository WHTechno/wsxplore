import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { keplrService } from '@/services/keplrService';
import { useChainContext } from './ChainContext';
import { useToast } from '@/hooks/use-toast';

interface WalletBalance {
  denom: string;
  amount: string;
}

interface WalletContextType {
  isConnected: boolean;
  address: string;
  balances: { [chainId: string]: WalletBalance[] };
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  refreshBalance: (chainId?: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balances, setBalances] = useState<{ [chainId: string]: WalletBalance[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { selectedChain, allChains } = useChainContext();
  const { toast } = useToast();

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      const isAvailable = await keplrService.isKeplrAvailable();
      if (!isAvailable) {
        toast({
          title: "Keplr Not Found",
          description: "Please install Keplr wallet extension to connect.",
          variant: "destructive"
        });
        return;
      }

      const walletAddress = await keplrService.connectWallet();
      setAddress(walletAddress);
      setIsConnected(true);

      toast({
        title: "Wallet Connected",
        description: `Connected to ${walletAddress.slice(0, 12)}...${walletAddress.slice(-8)}`,
      });

      // Add all available chains to Keplr
      await addAllChainsToKeplr();
      
      // Refresh balance for current chain
      if (selectedChain) {
        await refreshBalance(selectedChain.chainId);
      }

    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Keplr wallet",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await keplrService.disconnectWallet();
      setIsConnected(false);
      setAddress('');
      setBalances({});
      
      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from Keplr wallet",
      });
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const addAllChainsToKeplr = async () => {
    const addPromises = allChains.map(async (chain) => {
      try {
        await keplrService.addChainToKeplr(chain);
      } catch (error) {
        console.warn(`Failed to add ${chain.chainName} to Keplr:`, error);
      }
    });

    await Promise.allSettled(addPromises);
    
    toast({
      title: "Chains Added",
      description: `Added ${allChains.length} chains to Keplr wallet`,
    });
  };

  const refreshBalance = async (chainId?: string) => {
    if (!isConnected) return;

    const targetChains = chainId 
      ? allChains.filter(chain => chain.chainId === chainId)
      : [selectedChain].filter(Boolean);

    if (targetChains.length === 0) return;

    setIsLoading(true);
    try {
      const balancePromises = targetChains.map(async (chain) => {
        try {
          const balance = await keplrService.getBalance(chain);
          return { chainId: chain.chainId, balance };
        } catch (error) {
          console.warn(`Failed to get balance for ${chain.chainName}:`, error);
          return { chainId: chain.chainId, balance: [] };
        }
      });

      const results = await Promise.allSettled(balancePromises);
      const newBalances = { ...balances };

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          newBalances[result.value.chainId] = result.value.balance;
        }
      });

      setBalances(newBalances);
    } catch (error) {
      console.error('Failed to refresh balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto refresh balance when selected chain changes
  useEffect(() => {
    if (isConnected && selectedChain) {
      refreshBalance(selectedChain.chainId);
    }
  }, [selectedChain, isConnected]);

  const value: WalletContextType = {
    isConnected,
    address,
    balances,
    isLoading,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};