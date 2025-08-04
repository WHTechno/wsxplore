import React from 'react';
import { Wallet, WalletIcon, LogOut, RefreshCw, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWallet } from '@/context/WalletContext';
import { useChainContext } from '@/context/ChainContext';
import { useToast } from '@/hooks/use-toast';
import { keplrService } from '@/services/keplrService';

const WalletButton: React.FC = () => {
  const { isConnected, address, balances, isLoading, connectWallet, disconnectWallet, refreshBalance } = useWallet();
  const { selectedChain } = useChainContext();
  const { toast } = useToast();

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const handleRefreshBalance = () => {
    if (selectedChain) {
      refreshBalance(selectedChain.chainId);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const getCurrentChainBalance = () => {
    if (!selectedChain || !balances[selectedChain.chainId]) {
      return [];
    }
    return balances[selectedChain.chainId];
  };

  if (!isConnected) {
    return (
      <Button 
        onClick={connectWallet} 
        disabled={isLoading}
        className="flex items-center space-x-2"
      >
        <WalletIcon className="h-4 w-4" />
        <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
      </Button>
    );
  }

  const currentBalance = getCurrentChainBalance();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Wallet className="h-4 w-4 text-success" />
          <span className="hidden sm:inline">{formatAddress(address)}</span>
          <Badge variant="outline" className="hidden md:inline-flex">
            Connected
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span>Wallet Connected</span>
            <Badge variant="outline" className="text-success">
              Keplr
            </Badge>
          </div>
        </DropdownMenuLabel>
        
        <div className="px-2 py-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Address</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAddress}
              className="h-6 px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <div className="font-mono text-sm break-all">{address}</div>
        </div>

        <DropdownMenuSeparator />

        {selectedChain && (
          <>
            <DropdownMenuLabel>
              <div className="flex items-center justify-between">
                <span>{selectedChain.chainName} Balance</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshBalance}
                  disabled={isLoading}
                  className="h-6 px-2"
                >
                  <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </DropdownMenuLabel>
            
            <div className="px-2 py-2">
              {currentBalance.length > 0 ? (
                <div className="space-y-2">
                  {currentBalance.map((balance, index) => (
                    <div key={index} className="flex justify-between items-center p-2 rounded bg-secondary/30">
                      <span className="text-sm font-medium">
                        {balance.denom.toUpperCase()}
                      </span>
                      <span className="text-sm font-mono">
                        {keplrService.formatBalance(balance)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? 'Loading balance...' : 'No balance found'}
                  </p>
                </div>
              )}
            </div>

            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={disconnectWallet} className="text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletButton;