import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Coins, 
  ArrowUpRight,
  Clock,
  Shield,
  Zap,
  Loader2,
  Wallet
} from 'lucide-react';
import { useChainContext } from '@/context/ChainContext';
import { useWallet } from '@/context/WalletContext';
import { chainService } from '@/services/chainService';
import { keplrService } from '@/services/keplrService';
import { BlockData, ValidatorData } from '@/types/chain';

interface ValidatorStats {
  active: number;
  inactive: number;
  jailed: number;
  total: number;
}

const Dashboard: React.FC = () => {
  const { selectedChain } = useChainContext();
  const { isConnected, balances } = useWallet();
  const [loading, setLoading] = useState(false);
  const [chainInfo, setChainInfo] = useState<any>(null);
  const [latestBlocks, setLatestBlocks] = useState<BlockData[]>([]);
  const [validators, setValidators] = useState<ValidatorData[]>([]);
  const [validatorStats, setValidatorStats] = useState<ValidatorStats>({ active: 0, inactive: 0, jailed: 0, total: 0 });
  const [stakingPool, setStakingPool] = useState<any>(null);

  useEffect(() => {
    if (selectedChain) {
      fetchDashboardData();
    }
  }, [selectedChain]);

  const fetchDashboardData = async () => {
    if (!selectedChain) return;
    
    setLoading(true);
    try {
      chainService.setChain(selectedChain);
      
      const [info, blocks, validatorList, pool, stats] = await Promise.all([
        chainService.getChainInfo(),
        chainService.getLatestBlocks(),
        chainService.getValidators(),
        chainService.getStakingPool(),
        chainService.getValidatorStats()
      ]);

      setChainInfo(info);
      setLatestBlocks(blocks);
      setValidators(validatorList.slice(0, 5)); // Top 5 validators
      setStakingPool(pool);
      setValidatorStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBondedRatio = () => {
    if (!stakingPool?.pool) return 0;
    const bonded = parseInt(stakingPool.pool.bonded_tokens || '0');
    const notBonded = parseInt(stakingPool.pool.not_bonded_tokens || '0');
    const total = bonded + notBonded;
    return total > 0 ? (bonded / total) * 100 : 0;
  };

  

  if (!selectedChain) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No chain selected</h3>
          <p className="text-sm text-muted-foreground mt-2">Please select a chain to view the dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-4">
          <img
            src={selectedChain.logo}
            alt={selectedChain.chainName}
            className="h-16 w-16 rounded-full ring-2 ring-primary/20"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          <div>
            <h1 className="text-2xl font-bold aurora-text">{selectedChain.chainName}</h1>
            <p className="text-muted-foreground">{selectedChain.chainId}</p>
          </div>
        </div>
      </div>

      {/* Network Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard data...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Block Height</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestBlocks[0]?.height ? parseInt(latestBlocks[0].height).toLocaleString() : 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground">
                Latest block
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Validators</CardTitle>
              <Shield className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{validatorStats.active}</div>
              <p className="text-xs text-muted-foreground">
                Currently bonded
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Validators</CardTitle>
              <Users className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{validatorStats.inactive}</div>
              <p className="text-xs text-muted-foreground">
                Unbonded validators
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jailed Validators</CardTitle>
              <Activity className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{validatorStats.jailed}</div>
              <p className="text-xs text-muted-foreground">
                Currently jailed
              </p>
            </CardContent>
          </Card>

        </div>
      )}

      {/* Wallet Balance Section */}
      {isConnected && selectedChain && balances[selectedChain.chainId] && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <span>Your Wallet Balance</span>
            </CardTitle>
            <CardDescription>Connected wallet balance on {selectedChain.chainName}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {balances[selectedChain.chainId].map((balance, index) => (
                <div key={index} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {balance.denom.toUpperCase()}
                      </div>
                      <div className="text-xl font-bold">
                        {keplrService.formatBalance(balance)}
                      </div>
                    </div>
                    <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Coins className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {balances[selectedChain.chainId].length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No balance found for this chain</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Blocks */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Blocks</span>
            </CardTitle>
            <CardDescription>Latest blocks on the network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestBlocks.length > 0 ? latestBlocks.map((block) => (
                <div key={block.height} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">Block {parseInt(block.height).toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {block.hash.slice(0, 12)}...
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{block.txCount} txs</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(block.time).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent blocks available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Validators */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Top Validators</span>
            </CardTitle>
            <CardDescription>Top validators by voting power</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validators.length > 0 ? validators.map((validator, index) => (
                <div key={validator.operatorAddress} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{validator.moniker}</div>
                      <div className="text-sm text-muted-foreground">Commission: {validator.commission}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {(parseInt(validator.votingPower) / 1000000).toFixed(1)}M
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="text-xs text-muted-foreground">{validator.uptime.toFixed(1)}%</div>
                      <div className={`h-2 w-2 rounded-full ${validator.uptime > 99.5 ? 'bg-success' : 'bg-warning'}`} />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No validators available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;