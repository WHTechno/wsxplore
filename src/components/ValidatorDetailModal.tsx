import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Globe, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ValidatorData } from '@/types/chain';
import { chainService } from '@/services/chainService';
import { cn } from '@/lib/utils';

interface ValidatorDetailModalProps {
  validator: ValidatorData | null;
  isOpen: boolean;
  onClose: () => void;
}

interface UptimeBlock {
  height: number;
  signed: boolean;
  timestamp: string;
}

const ValidatorDetailModal: React.FC<ValidatorDetailModalProps> = ({
  validator,
  isOpen,
  onClose,
}) => {
  const [uptimeData, setUptimeData] = useState<UptimeBlock[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (validator && isOpen) {
      fetchUptimeData();
    }
  }, [validator, isOpen]);

  const fetchUptimeData = async () => {
    if (!validator) return;
    
    setLoading(true);
    try {
      const data = await chainService.getValidatorUptime(validator.operatorAddress);
      setUptimeData(data.blocks || []);
    } catch (error) {
      console.error('Error fetching uptime data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!validator) return null;

  const getStatusColor = (status: string) => {
    if (status === 'jailed') return 'destructive';
    return status === 'active' ? 'default' : 'secondary';
  };

  const signedBlocks = uptimeData.filter(block => block.signed).length;
  const uptimePercentage = uptimeData.length > 0 ? (signedBlocks / uptimeData.length) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            {validator.logo ? (
              <img
                src={validator.logo}
                alt={validator.moniker}
                className="h-16 w-16 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="h-8 w-8" />
              </div>
            )}
            <div>
              <DialogTitle className="text-2xl">{validator.moniker}</DialogTitle>
              <DialogDescription className="font-mono text-sm">
                {validator.operatorAddress}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Validator Info */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Validator Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge variant={getStatusColor(validator.status)} className="mt-1">
                    {validator.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Commission</div>
                  <div className="font-medium">{validator.commission}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Voting Power</div>
                  <div className="font-medium">{parseInt(validator.votingPower).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                  <div className="font-medium">{validator.uptime.toFixed(2)}%</div>
                </div>
              </div>

              {validator.details && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Description</div>
                  <p className="text-sm">{validator.details}</p>
                </div>
              )}

              {validator.website && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(validator.website, '_blank')}
                  className="w-full"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Visit Website
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Uptime Stats */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Uptime Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Signed Blocks</div>
                  <div className="text-2xl font-bold text-success">{signedBlocks}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Missed Blocks</div>
                  <div className="text-2xl font-bold text-destructive">{uptimeData.length - signedBlocks}</div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Uptime</span>
                  <span>{uptimePercentage.toFixed(2)}%</span>
                </div>
                <Progress value={uptimePercentage} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Uptime Blocks Visualization */}
        <Card className="glass-card mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Recent Block Signatures (Last 100 blocks)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading uptime data...</span>
              </div>
            ) : (
              <div className="grid grid-cols-10 gap-1">
                {uptimeData.map((block, index) => (
                  <div
                    key={block.height}
                    className={cn(
                      "h-8 w-8 rounded-sm flex items-center justify-center text-xs font-bold transition-all duration-300 hover:scale-125 hover:shadow-lg cursor-pointer border-2",
                      block.signed 
                        ? "bg-success text-success-foreground border-success hover:border-success-foreground" 
                        : "bg-destructive text-destructive-foreground border-destructive hover:border-destructive-foreground"
                    )}
                    style={{
                      animationDelay: `${index * 20}ms`,
                    }}
                    title={`Block ${block.height}: ${block.signed ? 'Signed' : 'Missed'} - Click for details`}
                    onClick={() => {
                      // Show real-time block info
                      alert(`Block ${block.height}\nStatus: ${block.signed ? 'Signed' : 'Missed'}\nTimestamp: ${block.timestamp}\nValidator: ${validator?.moniker}`);
                    }}
                  >
                    {block.signed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-success rounded-sm"></div>
                <span>Signed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-destructive rounded-sm"></div>
                <span>Missed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ValidatorDetailModal;