import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useChainContext } from '@/context/ChainContext';
import { ArrowRight, Globe, TestTube, Zap, Shield } from 'lucide-react';

export const Home: React.FC = () => {
  const { chains, selectChain, switchNetwork } = useChainContext();

  const handleChainSelect = (chain: any, networkType: 'mainnet' | 'testnet') => {
    switchNetwork(networkType);
    selectChain(chain);
  };

  const features = [
    {
      icon: Globe,
      title: "Multi-Chain Support",
      description: "Explore multiple blockchain networks seamlessly"
    },
    {
      icon: Zap,
      title: "Real-time Data",
      description: "Get up-to-date blockchain information instantly"
    },
    {
      icon: Shield,
      title: "Validator Analytics", 
      description: "Comprehensive validator performance metrics"
    },
    {
      icon: TestTube,
      title: "Testnet Support",
      description: "Full support for development networks"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-8">
            <img
              src="https://pbs.twimg.com/profile_images/1905206975048425472/ywz3Yoc7.jpg"
              alt="Winsnip Explorer"
              className="h-32 w-32 rounded-full ring-4 ring-primary/20 glow-border"
            />
          </div>
          
          <h1 className="text-6xl font-bold mb-4">
            <span className="aurora-text">Winsnip</span>
          </h1>
          <h2 className="text-4xl font-bold text-foreground mb-6">Explorer</h2>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Your gateway to blockchain exploration. Discover transactions, validators, and network insights across multiple chains.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="glass-card hover:glow-border transition-all duration-300">
                  <CardHeader className="text-center">
                    <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Chain Selection */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Choose Your Network</h3>
            <p className="text-lg text-muted-foreground">
              Select a blockchain network to start exploring
            </p>
          </div>

          {/* Mainnet Chains */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-6">
              <Badge variant="default" className="text-lg px-4 py-2">
                <Globe className="h-4 w-4 mr-2" />
                Mainnet
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chains.mainnet.map((chain) => (
                <Card key={chain.chainId} className="glass-card hover:glow-border transition-all duration-300 cursor-pointer group">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <img
                        src={chain.logo}
                        alt={chain.chainName}
                        className="h-16 w-16 rounded-full ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <CardTitle className="text-xl">{chain.chainName}</CardTitle>
                    <CardDescription className="text-sm font-mono">
                      {chain.chainId}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      asChild
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                      onClick={() => handleChainSelect(chain, 'mainnet')}
                    >
                      <Link to={`/${chain.chainName.toLowerCase().replace(/\s+/g, '-')}/dashboard`}>
                        Explore Network
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Testnet Chains */}
          <div>
            <div className="flex items-center justify-center mb-6">
              <Badge variant="outline" className="text-lg px-4 py-2">
                <TestTube className="h-4 w-4 mr-2" />
                Testnet
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chains.testnet.map((chain) => (
                <Card key={chain.chainId} className="glass-card hover:glow-border transition-all duration-300 cursor-pointer group">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <img
                        src={chain.logo}
                        alt={chain.chainName}
                        className="h-16 w-16 rounded-full ring-2 ring-accent/20 group-hover:ring-accent/50 transition-all duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <CardTitle className="text-xl">{chain.chainName}</CardTitle>
                    <CardDescription className="text-sm font-mono">
                      {chain.chainId}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      asChild
                      variant="outline"
                      className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300"
                      onClick={() => handleChainSelect(chain, 'testnet')}
                    >
                      <Link to={`/${chain.chainName.toLowerCase().replace(/\s+/g, '-')}/dashboard`}>
                        Explore Testnet
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
