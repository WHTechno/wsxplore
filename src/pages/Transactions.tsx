import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Search, Filter, ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChainContext } from '@/context/ChainContext';
import { chainService } from '@/services/chainService';
import { TransactionData } from '@/types/chain';
import { useToast } from '@/hooks/use-toast';

const Transactions: React.FC = () => {
  const { selectedChain } = useChainContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [searchedTransaction, setSearchedTransaction] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (selectedChain) {
      fetchTransactions();
      
      // Check if there's a hash parameter from search
      const hashParam = searchParams.get('hash');
      if (hashParam) {
        searchSpecificTransaction(hashParam);
      }
    }
  }, [selectedChain, page, searchParams]);

  const fetchTransactions = async () => {
    if (!selectedChain) return;
    
    setLoading(true);
    try {
      chainService.setChain(selectedChain);
      const data = await chainService.getTransactions(page);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchSpecificTransaction = async (txHash: string) => {
    if (!selectedChain) return;
    
    setSearchLoading(true);
    try {
      chainService.setChain(selectedChain);
      const transaction = await chainService.searchTransaction(txHash);
      
      if (transaction) {
        setSearchedTransaction(transaction);
        toast({
          title: "Transaction Found",
          description: `Successfully found transaction ${txHash.slice(0, 12)}...`,
        });
      } else {
        toast({
          title: "Transaction Not Found", 
          description: `No transaction found with hash ${txHash.slice(0, 12)}...`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error searching specific transaction:', error);
      toast({
        title: "Search Error",
        description: "An error occurred while searching for the transaction.",
        variant: "destructive"
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.txhash.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tx.to && tx.to.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    const matchesType = typeFilter === 'all' || tx.type.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    return status === 'success' ? 'default' : 'destructive';
  };

  if (!selectedChain) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <ArrowUpRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No chain selected</h3>
          <p className="text-sm text-muted-foreground mt-2">Please select a chain to view transactions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h1 className="text-2xl font-bold aurora-text mb-2">Transactions</h1>
            <p className="text-muted-foreground">Latest transactions on {selectedChain.chainName}</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{transactions.length}</div>
            <div className="text-sm text-muted-foreground">Total Loaded</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {filteredTransactions.filter(tx => tx.status === 'success').length}
            </div>
            <div className="text-sm text-muted-foreground">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">
              {filteredTransactions.filter(tx => tx.status === 'failed').length}
            </div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </div>
        </div>
      </div>

      {/* Searched Transaction Result */}
      {searchLoading && (
        <Card className="glass-card border-primary/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-lg">Searching for transaction...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {searchedTransaction && (
        <Card className="glass-card border-success/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-success">
              <CheckCircle className="h-5 w-5" />
              <span>Transaction Found</span>
            </CardTitle>
            <CardDescription>
              Found transaction: {searchParams.get('hash')?.slice(0, 16)}...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Transaction Hash</label>
                  <div className="font-mono text-sm break-all">{searchedTransaction.txhash}</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Status</label>
                  <div>
                    <Badge variant={getStatusColor(searchedTransaction.status)}>
                      {searchedTransaction.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Block Height</label>
                  <div className="font-medium">{searchedTransaction.height}</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Type</label>
                  <div>
                    <Badge variant="outline">{searchedTransaction.type}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Timestamp</label>
                  <div className="text-sm">{new Date(searchedTransaction.timestamp).toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Fee</label>
                  <div className="text-sm">{searchedTransaction.fee}</div>
                </div>
              </div>
              <div className="pt-4 border-t border-success/20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchedTransaction(null);
                    setSearchParams({});
                  }}
                >
                  Clear Search Result
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {searchParams.get('hash') && !searchedTransaction && !searchLoading && (
        <Card className="glass-card border-destructive/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 text-destructive">
              <XCircle className="h-6 w-6" />
              <div>
                <h3 className="font-medium">Transaction Not Found</h3>
                <p className="text-sm text-muted-foreground">
                  No transaction found with hash: {searchParams.get('hash')?.slice(0, 16)}...
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchedTransaction(null);
                setSearchParams({});
              }}
            >
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <ArrowUpRight className="h-5 w-5" />
                <span>Transaction List</span>
              </CardTitle>
              <CardDescription>Search and filter transactions</CardDescription>
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by hash or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="send">Send</SelectItem>
                  <SelectItem value="delegate">Delegate</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.txhash}
                  className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all duration-200"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Transaction Info */}
                    <div className="lg:col-span-4">
                      <div className="flex items-center space-x-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.status === 'success' ? 'bg-success/20' : 'bg-destructive/20'}`}>
                          {tx.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono text-sm font-medium truncate">
                            {tx.txhash.slice(0, 16)}...{tx.txhash.slice(-8)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Block {tx.height} • {new Date(tx.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Type & Status */}
                    <div className="lg:col-span-2">
                      <Badge variant="outline">{tx.type}</Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        <Badge variant={getStatusColor(tx.status)}>
                          {tx.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Amount & Fee */}
                    <div className="lg:col-span-3">
                      <div className="text-sm">
                        <div className="font-medium">{tx.amount || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">Fee: {tx.fee}</div>
                      </div>
                    </div>

                    {/* From/To */}
                    <div className="lg:col-span-3">
                      <div className="text-sm">
                        <div className="text-xs text-muted-foreground">From:</div>
                        <div className="font-mono text-xs truncate">{tx.from}</div>
                        {tx.to && (
                          <>
                            <div className="text-xs text-muted-foreground mt-1">To:</div>
                            <div className="font-mono text-xs truncate">{tx.to}</div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-1 flex justify-end">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Load More */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          className="w-full md:w-auto"
          onClick={() => setPage(prev => prev + 1)}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Load More Transactions
        </Button>
      </div>
    </div>
  );
};

export default Transactions;