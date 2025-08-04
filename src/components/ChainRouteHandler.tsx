import React, { useEffect } from 'react';
import { useRouteChain } from '@/hooks/useRouteChain';

interface ChainRouteHandlerProps {
  children: React.ReactNode;
}

export const ChainRouteHandler: React.FC<ChainRouteHandlerProps> = ({ children }) => {
  useRouteChain();
  
  return <>{children}</>;
};