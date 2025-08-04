import { useState, useEffect } from 'react';
import { Chain, ChainData } from '@/types/chain';
import mainnetChains from '@/config/chains/mainnet.json';
import testnetChains from '@/config/chains/testnet.json';

export const useChains = () => {
  const [chains, setChains] = useState<ChainData>({
    mainnet: [],
    testnet: []
  });
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [networkType, setNetworkType] = useState<'mainnet' | 'testnet'>('mainnet');

  useEffect(() => {
    const chainData: ChainData = {
      mainnet: mainnetChains as Chain[],
      testnet: testnetChains as Chain[]
    };
    setChains(chainData);
    
    // Set default chain
    if (chainData.mainnet.length > 0) {
      setSelectedChain(chainData.mainnet[0]);
    }
  }, []);

  const switchNetwork = (type: 'mainnet' | 'testnet') => {
    setNetworkType(type);
    const newChains = chains[type];
    if (newChains.length > 0) {
      setSelectedChain(newChains[0]);
    }
  };

  const selectChain = (chain: Chain) => {
    setSelectedChain(chain);
  };

  return {
    chains,
    selectedChain,
    networkType,
    switchNetwork,
    selectChain,
    allChains: [...chains.mainnet, ...chains.testnet]
  };
};