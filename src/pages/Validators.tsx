import React, { useState, useEffect } from 'react';
import { Shield, Search, Globe, AlertTriangle, Loader2, Filter, SortDesc } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useChainContext } from '@/context/ChainContext';
import { chainService } from '@/services/chainService';
import { ValidatorData } from '@/types/chain';
import ValidatorDetailModal from '@/components/ValidatorDetailModal';

const Validators: React.FC = () => {
  const { selectedChain } = useChainContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [validators, setValidators] = useState<ValidatorData[]>([]);
  const [loading, setLoading] = useState(false);
  const [stakingPool, setStakingPool] = useState<any>(null);
  const [selectedValidator, setSelectedValidator] = useState<ValidatorData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('votingPower');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (selectedChain) {
      fetchValidators();
      fetchStakingPool();
    }
  }, [selectedChain]);

  const fetchValidators = async () => {
    if (!selectedChain) return;
    
    setLoading(true);
    try {
      chainService.setChain(selectedChain);
      const data = await chainService.getValidators();
      setValidators(data);
    } catch (error) {
      console.error('Error fetching validators:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStakingPool = async () => {
    if (!selectedChain) return;
    
    try {
      chainService.setChain(selectedChain);
      const pool = await chainService.getStakingPool();
      setStakingPool(pool);
    } catch (error) {
      console.error('Error fetching staking pool:', error);
    }
  };

  // Filter and sort validators with ranking by voting power
  const filteredAndSortedValidators = validators
    .filter(validator => {
      const matchesSearch = validator.moniker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        validator.operatorAddress.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTab = activeTab === 'all' || 
        (activeTab === 'active' && validator.status === 'active') ||
        (activeTab === 'inactive' && validator.status === 'inactive') ||
        (activeTab === 'jailed' && validator.status === 'jailed');
      
      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      // Always prioritize voting power for ranking unless explicitly sorted differently
      if (sortBy === 'votingPower' || sortBy === 'rank') {
        return parseInt(b.votingPower) - parseInt(a.votingPower);
      }
      if (sortBy === 'uptime') {
        return b.uptime - a.uptime;
      }
      if (sortBy === 'commission') {
        return parseFloat(a.commission) - parseFloat(b.commission);
      }
      return a.moniker.localeCompare(b.moniker);
    })
    .map((validator, index) => ({
      ...validator,
      rank: index + 1 // Add ranking based on voting power
    }));

  const activeValidators = validators.filter(v => v.status === 'active').length;
  const inactiveValidators = validators.filter(v => v.status === 'inactive').length;
  const jailedValidators = validators.filter(v => v.status === 'jailed').length;

  const getStatusColor = (status: string) => {
    if (status === 'jailed') return 'destructive';
    if (status === 'inactive') return 'destructive';
    if (status === 'unbonding') return 'destructive';
    return status === 'active' ? 'default' : 'secondary';
  };

  const getUptimeColor = (uptime: number, status: string) => {
    if (status === 'jailed' || status === 'inactive' || status === 'unbonding') {
      return 'bg-destructive';
    }
    if (uptime >= 99.5) return 'bg-success';
    if (uptime >= 95) return 'bg-warning';
    return 'bg-destructive';
  };

  const getBondedRatio = () => {
    if (!stakingPool?.pool) return '0';
    const bonded = parseInt(stakingPool.pool.bonded_tokens || '0');
    const notBonded = parseInt(stakingPool.pool.not_bonded_tokens || '0');
    const total = bonded + notBonded;
    return total > 0 ? ((bonded / total) * 100).toFixed(1) : '0';
  };


  if (!selectedChain) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No chain selected</h3>
          <p className="text-sm text-muted-foreground mt-2">Please select a chain to view validators</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div>
            <h1 className="text-2xl font-bold aurora-text mb-2">Validators</h1>
            <p className="text-muted-foreground">All validators on {selectedChain.chainName}</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{activeValidators}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{inactiveValidators}</div>
            <div className="text-sm text-muted-foreground">Inactive</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{jailedValidators}</div>
            <div className="text-sm text-muted-foreground">Jailed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{getBondedRatio()}%</div>
            <div className="text-sm text-muted-foreground">Bonded Ratio</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Validator Set</span>
              </CardTitle>
              <CardDescription>List of all validators on the network</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search validators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              {/* Filter Toggle */}
              <Button 
                variant={isFilterOpen ? "default" : "outline"} 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <SortDesc className="h-4 w-4 mr-2" />
                    Sort by {sortBy === 'votingPower' ? 'Rank (Voting Power)' : sortBy === 'uptime' ? 'Uptime' : sortBy === 'commission' ? 'Commission' : 'Name'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy('votingPower')}>
                    <span className="font-medium">🏆 Sort by Rank (Voting Power)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('uptime')}>
                    Sort by Uptime
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('commission')}>
                    Sort by Commission
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('moniker')}>
                    Sort by Name
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {isFilterOpen && (
            <div className="mt-4 p-4 bg-secondary/20 rounded-lg space-y-4">
              <h3 className="text-lg font-semibold">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Minimum Voting Power</label>
                  <Input 
                    type="number" 
                    placeholder="Enter minimum voting power"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Minimum Uptime (%)</label>
                  <Input 
                    type="number" 
                    placeholder="Enter minimum uptime"
                    min="0"
                    max="100"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Maximum Commission (%)</label>
                  <Input 
                    type="number" 
                    placeholder="Enter maximum commission"
                    min="0"
                    max="100"
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsFilterOpen(false)}>
                  Close Filters
                </Button>
                <Button>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}

          {/* Tabs for validator status */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({validators.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeValidators})</TabsTrigger>
              <TabsTrigger value="inactive">Inactive ({inactiveValidators})</TabsTrigger>
              <TabsTrigger value="jailed">Jailed ({jailedValidators})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading validators...</span>
            </div>
          ) : filteredAndSortedValidators.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No validators found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedValidators.map((validator, index) => (
              <div
                key={validator.operatorAddress}
                className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all duration-200"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* Rank & Identity */}
                  <div className="lg:col-span-3 flex items-center space-x-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      validator.rank <= 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900' :
                      validator.rank <= 10 ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-blue-900' :
                      'bg-primary/20 text-primary'
                    }`}>
                      #{validator.rank}
                    </div>
                    {validator.logo ? (
                      <img
                        src={validator.logo}
                        alt={validator.moniker}
                        className="h-8 w-8 rounded-full bg-muted"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Shield className="h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-medium truncate">{validator.moniker}</div>
                      <div className="text-xs text-muted-foreground font-mono truncate">
                        {validator.operatorAddress}
                      </div>
                    </div>
                  </div>

                  {/* Voting Power */}
                  <div className="lg:col-span-2">
                    <div className="text-sm font-medium">
                      {parseInt(validator.votingPower).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Voting Power</div>
                  </div>

                  {/* Commission */}
                  <div className="lg:col-span-2">
                    <div className="text-sm font-medium">{validator.commission}</div>
                    <div className="text-xs text-muted-foreground">Commission</div>
                  </div>

                  {/* Uptime */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="text-sm font-medium">{validator.uptime}%</div>
                      {validator.uptime < 95 && <AlertTriangle className="h-3 w-3 text-warning" />}
                    </div>
                    <Progress
                      value={validator.uptime}
                      className={`h-2 ${getUptimeColor(validator.uptime, validator.status)}`}
                    />
                  </div>

                  {/* Status & Actions */}
                  <div className="lg:col-span-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(validator.status)}>
                        {validator.status}
                      </Badge>
                      {validator.website && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => window.open(validator.website, '_blank')}
                        >
                          <Globe className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedValidator(validator);
                        setIsModalOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Details */}
                {validator.details && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">{validator.details}</p>
                  </div>
                )}
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Load More */}
      <div className="flex justify-center">
        <Button variant="outline" className="w-full md:w-auto">
          Load More Validators
        </Button>
      </div>

      {/* Validator Detail Modal */}
      <ValidatorDetailModal
        validator={selectedValidator}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedValidator(null);
        }}
      />
    </div>
  );
};

export default Validators;