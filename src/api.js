const BASE_URL = 'https://explorer.uomi.ai/api';

export async function fetchLatestBlocks() {
  const res = await fetch(`${BASE_URL}/v2/main-page/blocks`);
  return await res.json();
}

export async function fetchBlocks(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const res = await fetch(`${BASE_URL}/v2/blocks?limit=${limit}&skip=${skip}`);
  return await res.json();
}

export async function fetchTransactions(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const res = await fetch(`${BASE_URL}/v2/transactions?limit=${limit}&skip=${skip}`);
  return await res.json();
}

export async function fetchTransactionByHash(hash) {
  const res = await fetch(`${BASE_URL}/v2/transactions/${hash}`);
  return await res.json();
}

export async function searchExplorer(query) {
  const res = await fetch(`${BASE_URL}/v2/search?query=${encodeURIComponent(query)}`);
  return await res.json();
}

export async function fetchStats() {
  const res = await fetch(`${BASE_URL}/v2/stats`);
  return await res.json();
}
