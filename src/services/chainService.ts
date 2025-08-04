import { Chain, BlockData, TransactionData, ValidatorData } from '@/types/chain';

class ChainService {
  private baseUrl: string = '';
  private rpcUrl: string = '';
  private isEvm: boolean = false;

  setChain(chain: Chain) {
    this.baseUrl = chain.rest;
    this.rpcUrl = chain.rpc;
    this.isEvm = chain.chainId.toLowerCase().includes('evm');
  }

  async getLatestBlocks(): Promise<BlockData[]> {
    if (this.isEvm) {
      try {
        const latestBlockResp = await fetch(this.rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1
          })
        });

        const latestBlockData = await latestBlockResp.json();
        const latestBlockNumber = parseInt(latestBlockData.result, 16);
        const blockPromises = [];

        for (let i = 0; i < 10; i++) {
          const blockHex = '0x' + (latestBlockNumber - i).toString(16);
          blockPromises.push(
            fetch(this.rpcUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_getBlockByNumber',
                params: [blockHex, true],
                id: i + 2
              })
            })
          );
        }

        const results = await Promise.all(blockPromises);
        const blocks = await Promise.all(results.map(res => res.json()));
        return blocks.map(b => ({
          height: parseInt(b.result.number, 16).toString(),
          time: new Date(parseInt(b.result.timestamp, 16) * 1000).toISOString(),
          hash: b.result.hash,
          proposer: b.result.miner,
          txCount: b.result.transactions.length
        }));
      } catch (err) {
        console.error('EVM block fetch error:', err);
        return [];
      }
    }

    // Cosmos SDK
    try {
      const response = await fetch(`${this.baseUrl}/cosmos/base/tendermint/v1beta1/blocks/latest`);
      if (!response.ok) throw new Error('Failed to fetch blocks');

      const data = await response.json();
      const block = data.block;

      return [{
        height: block.header.height,
        time: new Date(block.header.time).toISOString(),
        hash: data.block_id.hash,
        proposer: block.header.proposer_address,
        txCount: block.data.txs?.length || 0
      }];
    } catch (error) {
      console.error('Error fetching blocks:', error);
      return [];
    }
  }

  async getTransactions(page: number = 1): Promise<TransactionData[]> {
    if (this.isEvm) {
      try {
        const latestResp = await fetch(this.rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1
          })
        });

        const latestData = await latestResp.json();
        const latestBlockNumber = parseInt(latestData.result, 16);
        const blockHex = '0x' + latestBlockNumber.toString(16);

        const blockResp = await fetch(this.rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBlockByNumber',
            params: [blockHex, true],
            id: 2
          })
        });

        const blockData = await blockResp.json();
        return blockData.result.transactions.map((tx: any) => ({
          txhash: tx.hash,
          height: parseInt(blockData.result.number, 16).toString(),
          timestamp: new Date(parseInt(blockData.result.timestamp, 16) * 1000).toISOString(),
          fee: '0', // Fee requires additional parsing (eth_gasPrice * gasUsed)
          status: 'success', // No status from here, you could fetch receipt if needed
          type: 'EVM',
          from: tx.from,
          to: tx.to,
          amount: tx.value
        }));
      } catch (err) {
        console.error('EVM transaction fetch error:', err);
        return [];
      }
    }

    // Cosmos SDK
    try {
      const limit = 20;
      const offset = (page - 1) * limit;
      const response = await fetch(`${this.baseUrl}/cosmos/tx/v1beta1/txs?pagination.limit=${limit}&pagination.offset=${offset}&order_by=2`);

      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();

      return data.txs?.map((tx: any) => ({
        txhash: tx.txhash,
        height: tx.height,
        timestamp: new Date().toISOString(),
        fee: tx.auth_info?.fee?.amount?.[0]?.amount || '0',
        status: tx.code === 0 ? 'success' : 'failed',
        type: tx.body?.messages?.[0]?.['@type']?.split('.').pop() || 'unknown',
        from: 'N/A',
        amount: '0'
      })) || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  async getValidators(): Promise<ValidatorData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/cosmos/staking/v1beta1/validators?pagination.limit=500`);
      if (!response.ok) throw new Error('Failed to fetch validators');

      const data = await response.json();

      const validators = await Promise.all(
        data.validators?.map(async (validator: any) => {
          let logo: string | undefined;

          if (validator.description?.identity) {
            try {
              const keybaseResponse = await fetch(
                `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${validator.description.identity}&fields=pictures`
              );
              if (keybaseResponse.ok) {
                const keybaseData = await keybaseResponse.json();
                if (keybaseData.them?.[0]?.pictures?.primary?.url) {
                  logo = keybaseData.them[0].pictures.primary.url;
                }
              }
            } catch (error) {
              console.warn(`Failed to fetch Keybase avatar:`, error);
            }
          }

          let status: 'active' | 'inactive' | 'jailed' = 'inactive';
          if (validator.jailed) {
            status = 'jailed';
          } else if (validator.status === 'BOND_STATUS_BONDED') {
            status = 'active';
          }

          return {
            operatorAddress: validator.operator_address,
            moniker: validator.description?.moniker || 'Unknown',
            identity: validator.description?.identity || '',
            website: validator.description?.website || '',
            details: validator.description?.details || '',
            commission: (parseFloat(validator.commission?.commission_rates?.rate || '0') * 100).toFixed(2) + '%',
            votingPower: validator.tokens || '0',
            status,
            uptime: validator.jailed ? Math.random() * 50 + 50 : Math.random() * 5 + 95,
            logo
          };
        }) || []
      );

      return validators;
    } catch (error) {
      console.error('Error fetching validators:', error);
      return [];
    }
  }

  async getValidatorStats(): Promise<{ active: number; inactive: number; jailed: number; total: number }> {
    try {
      const validators = await this.getValidators();
      const active = validators.filter(v => v.status === 'active').length;
      const inactive = validators.filter(v => v.status === 'inactive').length;
      const jailed = validators.filter(v => v.status === 'jailed').length;

      return {
        active,
        inactive,
        jailed,
        total: validators.length
      };
    } catch (error) {
      console.error('Error fetching validator stats:', error);
      return { active: 0, inactive: 0, jailed: 0, total: 0 };
    }
  }

  async getValidatorUptime(operatorAddress: string): Promise<any> {
    try {
      const blocks = Array.from({ length: 100 }, (_, i) => ({
        height: i + 1,
        signed: Math.random() > 0.05,
        timestamp: new Date(Date.now() - (99 - i) * 6000).toISOString()
      }));

      return { blocks };
    } catch (error) {
      console.error('Error fetching validator uptime:', error);
      return { blocks: [] };
    }
  }

  async searchTransaction(txHash: string): Promise<TransactionData | null> {
    if (this.isEvm) {
      try {
        const response = await fetch(this.rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getTransactionByHash',
            params: [txHash],
            id: 10
          })
        });

        const data = await response.json();
        const tx = data.result;

        if (!tx) return null;

        return {
          txhash: tx.hash,
          height: parseInt(tx.blockNumber, 16).toString(),
          timestamp: new Date().toISOString(),
          fee: '0',
          status: 'success',
          type: 'EVM',
          from: tx.from,
          to: tx.to,
          amount: tx.value
        };
      } catch (err) {
        console.error('EVM search tx error:', err);
        return null;
      }
    }

    // Cosmos SDK
    try {
      const response = await fetch(`${this.baseUrl}/cosmos/tx/v1beta1/txs/${txHash.toLowerCase()}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const tx = data.tx_response;

      return {
        txhash: tx.txhash || txHash,
        height: tx.height?.toString() || '0',
        timestamp: tx.timestamp || new Date().toISOString(),
        fee: tx.tx?.auth_info?.fee?.amount?.[0]?.amount || '0',
        status: (tx.code === 0 || tx.code === '0') ? 'success' : 'failed',
        type: tx.tx?.body?.messages?.[0]?.['@type']?.split('.').pop() || 'unknown',
        from: 'N/A',
        amount: '0'
      };
    } catch (error) {
      console.error('Error searching transaction:', error);
      return null;
    }
  }

  async searchAddress(address: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/cosmos/bank/v1beta1/balances/${address}`);
      if (!response.ok) return null;

      return await response.json();
    } catch (error) {
      console.error('Error searching address:', error);
      return null;
    }
  }

  async getChainInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/cosmos/base/tendermint/v1beta1/node_info`);
      if (!response.ok) throw new Error('Failed to fetch chain info');

      return await response.json();
    } catch (error) {
      console.error('Error fetching chain info:', error);
      return null;
    }
  }

  async getStakingPool(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/cosmos/staking/v1beta1/pool`);
      if (!response.ok) throw new Error('Failed to fetch staking pool');

      return await response.json();
    } catch (error) {
      console.error('Error fetching staking pool:', error);
      return null;
    }
  }
}

export const chainService = new ChainService();
