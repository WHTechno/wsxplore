import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Network, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useChainContext } from '@/context/ChainContext';
import { chainService } from '@/services/chainService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import WalletButton from './WalletButton';
import { ThemeToggle } from './ThemeToggle';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { chains, selectedChain, networkType, switchNetwork, selectChain } = useChainContext();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Transactions', href: '/transactions', icon: '💸' },
    { name: 'Validators', href: '/validators', icon: '🛡️' },
    { name: 'Uptime', href: '/uptime', icon: '⚡' },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (!selectedChain) {
      toast({
        title: "No Chain Selected",
        description: "Please select a chain first before searching.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);

    try {
      chainService.setChain(selectedChain);
      const transaction = await chainService.searchTransaction(searchQuery.trim());

      if (transaction) {
        toast({
          title: "Transaction Found",
          description: `Found transaction with hash: ${transaction.txhash}`,
        });
        navigate(`/transactions?hash=${searchQuery.trim()}`);
      } else {
        const addressData = await chainService.searchAddress(searchQuery.trim());
        if (addressData && addressData.balances) {
          toast({
            title: "Address Found",
            description: `Found address with ${addressData.balances.length} token(s)`,
          });
        } else {
          toast({
            title: "Not Found",
            description: "No transaction or address found with that query.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-card border-b">
      <div className="container mx-auto px-4">
        {/* Top Row: Logo and Right Controls */}
        <div className="flex flex-wrap items-center justify-between py-3 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="https://pbs.twimg.com/profile_images/1905206975048425472/ywz3Yoc7.jpg"
              alt="Winsnip Block Explorer"
              className="h-10 w-10 rounded-full ring-2 ring-primary/20"
            />
            <div className="hidden md:flex flex-col leading-tight">
              <h1 className="text-xl font-bold aurora-text">Winsnip</h1>
              <p className="text-xs text-muted-foreground">Block Explorer</p>
            </div>
          </Link>

          {/* Right Controls */}
          <div className="flex items-center flex-wrap gap-2 lg:gap-4 justify-end">
            {/* Network Toggle */}
            <div className="hidden md:flex items-center space-x-2">
              <Button
                variant={networkType === 'mainnet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchNetwork('mainnet')}
                className="h-8"
              >
                Mainnet
              </Button>
              <Button
                variant={networkType === 'testnet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchNetwork('testnet')}
                className="h-8"
              >
                Testnet
              </Button>
            </div>

            {/* Chain Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2 min-w-[160px] h-8">
                  {selectedChain ? (
                    <>
                      <img
                        src={selectedChain.logo}
                        alt={selectedChain.chainName}
                        className="h-5 w-5 rounded-full"
                      />
                      <span className="hidden sm:inline truncate">{selectedChain.chainName}</span>
                    </>
                  ) : (
                    <>
                      <Network className="h-4 w-4" />
                      <span className="hidden sm:inline">Select Chain</span>
                    </>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 z-[9999]">
                <DropdownMenuLabel>Mainnet</DropdownMenuLabel>
                {chains.mainnet.map((chain) => (
                  <DropdownMenuItem
                    key={chain.chainId}
                    onClick={() => {
                      switchNetwork('mainnet');
                      selectChain(chain);
                    }}
                    className="flex items-center space-x-3"
                  >
                    <img src={chain.logo} alt={chain.chainName} className="h-6 w-6 rounded-full" />
                    <div>
                      <div className="font-medium">{chain.chainName}</div>
                      <div className="text-xs text-muted-foreground">{chain.chainId}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Testnet</DropdownMenuLabel>
                {chains.testnet.map((chain) => (
                  <DropdownMenuItem
                    key={chain.chainId}
                    onClick={() => {
                      switchNetwork('testnet');
                      selectChain(chain);
                    }}
                    className="flex items-center space-x-3"
                  >
                    <img src={chain.logo} alt={chain.chainName} className="h-6 w-6 rounded-full" />
                    <div>
                      <div className="font-medium">{chain.chainName}</div>
                      <div className="text-xs text-muted-foreground">{chain.chainId}</div>
                    </div>
                    <Badge variant="outline" className="ml-auto">Test</Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search tx hash or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 search-glow"
                  disabled={isSearching}
                />
              </div>
              <Button type="submit" size="sm" disabled={isSearching || !searchQuery.trim()}>
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </form>

            <ThemeToggle />
            <WalletButton />

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Second Row: Navigation Menu */}
        <div className="hidden lg:flex justify-end gap-2 py-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all",
                isActive(item.href)
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              )}
            >
              {typeof item.icon === 'string' ? (
                <span className="mr-2">{item.icon}</span>
              ) : (
                <item.icon className="h-4 w-4 mr-2" />
              )}
              {item.name}
            </Link>
          ))}
        </div>

     {/* Mobile Navigation Menu */}
    {isMenuOpen && (
    <div className="flex flex-col gap-1 py-3 lg:hidden">
    {navigation.map((item) => (
      <Link
        key={item.name}
        to={item.href}
        onClick={() => setIsMenuOpen(false)}
        className={cn(
          "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all",
          isActive(item.href)
            ? "bg-primary/20 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
        )}
      >
        {typeof item.icon === 'string' ? (
          <span className="mr-2">{item.icon}</span>
        ) : (
          <item.icon className="h-4 w-4 mr-2" />
        )}
        {item.name}
      </Link>
    ))}
  </div>
)}
  </div>
  </header>
  );
};
