import React, { useEffect, useState } from 'react';
import { fetchStats } from '../api';

export default function Stats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats().then(data => {
      setStats(data.result || null);
    });
  }, []);

  if (!stats) return <div>Loading stats...</div>;

  return (
    <div>
      <h2>Explorer Stats</h2>
      <ul>
        <li>Total Addresses: {stats.addressCount}</li>
        <li>Total Transactions: {stats.transactionCount}</li>
        <li>Total Contracts: {stats.contractCount}</li>
        <li>Current Epoch: {stats.epochNumber}</li>
        <li>Current Block: {stats.blockNumber}</li>
        <li>Gas Used / Second: {stats.gasUsedPerSecond}</li>
      </ul>
    </div>
  );
}
