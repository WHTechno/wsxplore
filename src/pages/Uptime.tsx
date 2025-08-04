import React, { useState } from 'react';
import { Activity, TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChainContext } from '@/context/ChainContext';

const Uptime: React.FC = () => {
  const { selectedChain } = useChainContext();

  // Mock uptime data
  const networkStats = {
    overallUptime: 99.97,
    avgBlockTime: 6.8,
    missedBlocks: 23,
    totalBlocks: 18245672,
    networkHealth: 'excellent'
  };

  const validatorUptime = [
    { moniker: 'Coinbase Custody', uptime: 99.98, missedBlocks: 5, lastMissed: '2h ago', status: 'excellent' },
    { moniker: 'Binance Staking', uptime: 99.95, missedBlocks: 12, lastMissed: '4h ago', status: 'excellent' },
    { moniker: 'Kraken', uptime: 99.89, missedBlocks: 28, lastMissed: '1h ago', status: 'good' },
    { moniker: 'Figment', uptime: 99.92, missedBlocks: 18, lastMissed: '6h ago', status: 'excellent' },
    { moniker: 'Stake.fish', uptime: 95.23, missedBlocks: 1247, lastMissed: '10m ago', status: 'poor' },
  ];

  const networkEvents = [
    { type: 'info', time: '2h ago', message: 'Network upgrade proposal passed', severity: 'low' },
    { type: 'warning', time: '4h ago', message: 'High block time detected (8.2s avg)', severity: 'medium' },
    { type: 'success', time: '6h ago', message: 'Network operating normally', severity: 'low' },
    { type: 'error', time: '8h ago', message: 'Validator Stake.fish jailed for downtime', severity: 'high' },
    { type: 'info', time: '12h ago', message: 'Block height milestone: 18,000,000', severity: 'low' },
  ];

  const getUptimeStatus = (uptime: number) => {
    if (uptime >= 99.5) return { label: 'Excellent', color: 'default', icon: CheckCircle };
    if (uptime >= 98) return { label: 'Good', color: 'secondary', icon: Activity };
    if (uptime >= 95) return { label: 'Fair', color: 'outline', icon: AlertTriangle };
    return { label: 'Poor', color: 'destructive', icon: XCircle };
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4 text-info" />;
    }
  };

  if (!selectedChain) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No chain selected</h3>
          <p className="text-sm text-muted-foreground mt-2">Please select a chain to view uptime</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <h1 className="text-2xl font-bold aurora-text mb-2">Network Uptime</h1>
        <p className="text-muted-foreground">Monitor network health and validator performance on {selectedChain.chainName}</p>
      </div>

      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{networkStats.overallUptime}%</div>
            <Progress value={networkStats.overallUptime} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Block Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.avgBlockTime}s</div>
            <p className="text-xs text-success flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              -0.2s from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missed Blocks</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{networkStats.missedBlocks}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of {networkStats.totalBlocks.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success capitalize">{networkStats.networkHealth}</div>
            <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="validators" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="validators">Validator Uptime</TabsTrigger>
          <TabsTrigger value="events">Network Events</TabsTrigger>
        </TabsList>

        <TabsContent value="validators" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Validator Performance</span>
              </CardTitle>
              <CardDescription>Uptime statistics for active validators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validatorUptime.map((validator, index) => {
                  const status = getUptimeStatus(validator.uptime);
                  const StatusIcon = status.icon;
                  
                  return (
                    <div key={index} className="p-4 rounded-lg bg-secondary/30">
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className="h-5 w-5 text-success" />
                          <div>
                            <div className="font-medium">{validator.moniker}</div>
                            <Badge variant={status.color as any} className="text-xs">
                              {status.label}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-bold">{validator.uptime}%</div>
                          <div className="text-xs text-muted-foreground">Uptime</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-bold text-warning">{validator.missedBlocks}</div>
                          <div className="text-xs text-muted-foreground">Missed Blocks</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm">{validator.lastMissed}</div>
                          <div className="text-xs text-muted-foreground">Last Missed</div>
                        </div>
                        
                        <div className="lg:col-span-1">
                          <Progress value={validator.uptime} className="h-2" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Recent Network Events</span>
              </CardTitle>
              <CardDescription>Important events and alerts from the network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {networkEvents.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/30">
                    {getEventIcon(event.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{event.message}</p>
                        <span className="text-xs text-muted-foreground">{event.time}</span>
                      </div>
                      <Badge 
                        variant={event.severity === 'high' ? 'destructive' : event.severity === 'medium' ? 'outline' : 'secondary'} 
                        className="text-xs mt-1"
                      >
                        {event.severity} priority
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Uptime;