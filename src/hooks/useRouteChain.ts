import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useChainContext } from '@/context/ChainContext';

export const useRouteChain = () => {
  const { chainId } = useParams();
  const location = useLocation();
  const { allChains, selectChain, switchNetwork } = useChainContext();

  useEffect(() => {
    if (chainId) {
      // Find chain in mainnet or testnet
      const chain = allChains.find(c => 
        c.chainId === chainId || 
        c.chainName.toLowerCase().replace(/\s+/g, '-') === chainId
      );

      if (chain) {
        // Determine network type based on testnet chains
        const isTestnet = chain.chainId.includes('testnet') || 
                         chain.chainId.includes('test') ||
                         chain.chainName.toLowerCase().includes('testnet');
        
        switchNetwork(isTestnet ? 'testnet' : 'mainnet');
        selectChain(chain);
      }
    }
  }, [chainId, allChains, selectChain, switchNetwork]);

  const getChainSlug = (chain: any) => {
    return chain.chainName.toLowerCase().replace(/\s+/g, '-');
  };

  return { getChainSlug };
};