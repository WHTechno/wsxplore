export interface Chain {
  chainId: string;
  chainName: string;
  rpc: string;
  rest: string;
  grpc?: string;
  logo: string;
  type?: 'cosmos' | 'evm';
}

export interface ChainData {
  mainnet: Chain[];
  testnet: Chain[];
}

export interface BlockData {
  height: string;
  time: string;
  hash: string;
  proposer: string;
  txCount: number;
}

export interface TransactionData {
  txhash: string;
  height: string;
  timestamp: string;
  fee: string;
  status: 'success' | 'failed';
  type: string;
  from: string;
  to?: string;
  amount?: string;
}

export interface ValidatorData {
  operatorAddress: string;
  moniker: string;
  identity: string;
  website: string;
  details: string;
  commission: string;
  votingPower: string;
  status: 'active' | 'inactive' | 'jailed';
  uptime: number;
  logo?: string;
}

export interface SearchResult {
  type: 'transaction' | 'block' | 'address';
  data: any;
}
