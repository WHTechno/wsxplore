import React, { createContext, useContext, ReactNode } from 'react';
import { useChains } from '@/hooks/useChains';
import { Chain } from '@/types/chain';

interface ChainContextType {
  chains: {
    mainnet: Chain[];
    testnet: Chain[];
  };
  selectedChain: Chain | null;
  networkType: 'mainnet' | 'testnet';
  switchNetwork: (type: 'mainnet' | 'testnet') => void;
  selectChain: (chain: Chain) => void;
  allChains: Chain[];
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

export const ChainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const chainData = useChains();

  return (
    <ChainContext.Provider value={chainData}>
      {children}
    </ChainContext.Provider>
  );
};

export const useChainContext = () => {
  const context = useContext(ChainContext);
  if (context === undefined) {
    throw new Error('useChainContext must be used within a ChainProvider');
  }
  return context;
};