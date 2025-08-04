import { Chain } from '@/types/chain';

interface KeplrChainInfo {
  chainId: string;
  chainName: string;
  rpc: string;
  rest: string;
  bip44: {
    coinType: number;
  };
  bech32Config: {
    bech32PrefixAccAddr: string;
    bech32PrefixAccPub: string;
    bech32PrefixValAddr: string;
    bech32PrefixValPub: string;
    bech32PrefixConsAddr: string;
    bech32PrefixConsPub: string;
  };
  currencies: Array<{
    coinDenom: string;
    coinMinimalDenom: string;
    coinDecimals: number;
    coinGeckoId?: string;
  }>;
  feeCurrencies: Array<{
    coinDenom: string;
    coinMinimalDenom: string;
    coinDecimals: number;
    coinGeckoId?: string;
    gasPriceStep?: {
      low: number;
      average: number;
      high: number;
    };
  }>;
  stakeCurrency: {
    coinDenom: string;
    coinMinimalDenom: string;
    coinDecimals: number;
    coinGeckoId?: string;
  };
}

interface WalletBalance {
  denom: string;
  amount: string;
}

class KeplrService {
  private isConnected = false;
  private address = '';
  private balances: WalletBalance[] = [];

  async isKeplrAvailable(): Promise<boolean> {
    return !!(window as any).keplr;
  }

  async connectWallet(): Promise<string> {
    if (!(window as any).keplr) {
      throw new Error('Keplr wallet is not installed. Please install Keplr extension.');
    }

    try {
      // Enable Keplr
      await (window as any).keplr.enable('cosmoshub-4'); // Start with Cosmos Hub
      
      // Get the offline signer
      const offlineSigner = (window as any).keplr.getOfflineSigner('cosmoshub-4');
      const accounts = await offlineSigner.getAccounts();
      
      this.address = accounts[0].address;
      this.isConnected = true;
      
      return this.address;
    } catch (error) {
      console.error('Failed to connect to Keplr:', error);
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    this.isConnected = false;
    this.address = '';
    this.balances = [];
  }

  async addChainToKeplr(chain: Chain): Promise<void> {
    if (!(window as any).keplr) {
      throw new Error('Keplr wallet is not installed');
    }

    // Convert our chain format to Keplr chain info
    const keplrChainInfo: KeplrChainInfo = this.convertToKeplrChainInfo(chain);

    try {
      await (window as any).keplr.experimentalSuggestChain(keplrChainInfo);
      console.log(`Successfully added ${chain.chainName} to Keplr`);
    } catch (error) {
      console.error(`Failed to add ${chain.chainName} to Keplr:`, error);
      throw error;
    }
  }

  async enableChain(chainId: string): Promise<void> {
    if (!(window as any).keplr) {
      throw new Error('Keplr wallet is not installed');
    }

    try {
      await (window as any).keplr.enable(chainId);
      console.log(`Successfully enabled chain: ${chainId}`);
    } catch (error) {
      console.error(`Failed to enable chain ${chainId}:`, error);
      throw error;
    }
  }

  async getBalance(chain: Chain): Promise<WalletBalance[]> {
    if (!this.isConnected) {
      throw new Error('Wallet is not connected');
    }

    try {
      // Enable the chain first
      await this.enableChain(chain.chainId);
      
      // Get the address for this chain
      const offlineSigner = (window as any).keplr.getOfflineSigner(chain.chainId);
      const accounts = await offlineSigner.getAccounts();
      const chainAddress = accounts[0].address;

      // Fetch balance from REST API
      const response = await fetch(`${chain.rest}/cosmos/bank/v1beta1/balances/${chainAddress}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.statusText}`);
      }

      const data = await response.json();
      return data.balances || [];
    } catch (error) {
      console.error(`Failed to get balance for ${chain.chainName}:`, error);
      return [];
    }
  }

  private convertToKeplrChainInfo(chain: Chain): KeplrChainInfo {
    // Extract chain prefix from chainId or use default
    const prefix = this.getChainPrefix(chain.chainId);
    
    return {
      chainId: chain.chainId,
      chainName: chain.chainName,
      rpc: chain.rpc,
      rest: chain.rest,
      bip44: {
        coinType: this.getCoinType(chain.chainId),
      },
      bech32Config: {
        bech32PrefixAccAddr: prefix,
        bech32PrefixAccPub: `${prefix}pub`,
        bech32PrefixValAddr: `${prefix}valoper`,
        bech32PrefixValPub: `${prefix}valoperpub`,
        bech32PrefixConsAddr: `${prefix}valcons`,
        bech32PrefixConsPub: `${prefix}valconspub`,
      },
      currencies: [
        {
          coinDenom: this.getMainDenom(chain.chainId),
          coinMinimalDenom: this.getMinimalDenom(chain.chainId),
          coinDecimals: 6,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: this.getMainDenom(chain.chainId),
          coinMinimalDenom: this.getMinimalDenom(chain.chainId),
          coinDecimals: 6,
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      stakeCurrency: {
        coinDenom: this.getMainDenom(chain.chainId),
        coinMinimalDenom: this.getMinimalDenom(chain.chainId),
        coinDecimals: 6,
      },
    };
  }

  private getChainPrefix(chainId: string): string {
    const prefixMap: { [key: string]: string } = {
      'cosmoshub-4': 'cosmos',
      'axone-1': 'axone',
      'oro_1336-1': 'kii',
      'lumera-testnet-2': 'lumera',
      'theta-testnet-001': 'cosmos',
    };
    
    return prefixMap[chainId] || chainId.split('-')[0];
  }

  private getCoinType(chainId: string): number {
    const coinTypeMap: { [key: string]: number } = {
      'cosmoshub-4': 118,
      'axone-1': 118,
      'oro_1336-1': 60, // EVM-based chain
      'lumera-testnet-2': 118,
      'theta-testnet-001': 118,
    };
    
    return coinTypeMap[chainId] || 118;
  }

  private getMainDenom(chainId: string): string {
    const denomMap: { [key: string]: string } = {
      'cosmoshub-4': 'ATOM',
      'axone-1': 'AXONE',
      'oro_1336-1': 'KII',
      'lumera-testnet-2': 'LUMERA',
      'theta-testnet-001': 'ATOM',
    };
    
    return denomMap[chainId] || 'TOKEN';
  }

  private getMinimalDenom(chainId: string): string {
    const minDenomMap: { [key: string]: string } = {
      'cosmoshub-4': 'uatom',
      'axone-1': 'uaxone',
      'oro_1336-1': 'ukii',
      'lumera-testnet-2': 'ulumera',
      'theta-testnet-001': 'uatom',
    };
    
    return minDenomMap[chainId] || 'utoken';
  }

  getConnectionStatus(): { isConnected: boolean; address: string } {
    return {
      isConnected: this.isConnected,
      address: this.address,
    };
  }

  formatBalance(balance: WalletBalance, decimals: number = 6): string {
    const amount = parseInt(balance.amount) / Math.pow(10, decimals);
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  }
}

export const keplrService = new KeplrService();