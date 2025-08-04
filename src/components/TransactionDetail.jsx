import React, { useEffect, useState } from 'react';
import { fetchTransactionByHash } from '../api';
import { useParams } from 'react-router-dom';

export default function TransactionDetail() {
  const { hash } = useParams();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactionByHash(hash).then(data => {
      setTx(data);
      setLoading(false);
    });
  }, [hash]);

  if (loading) return <div>Loading transaction detail...</div>;
  if (!tx) return <div>Transaction not found</div>;

  return (
    <div>
      <h2>Transaction Detail</h2>
      <p><strong>Hash:</strong> {tx.hash}</p>
      <p><strong>Block Number:</strong> {tx.blockNumber}</p>
      <p><strong>From:</strong> {tx.from}</p>
      <p><strong>To:</strong> {tx.to}</p>
      <p><strong>Value:</strong> {tx.value}</p>
      <p><strong>Gas Used:</strong> {tx.gasUsed}</p>
      <p><strong>Nonce:</strong> {tx.nonce}</p>
      <p><strong>Status:</strong> {tx.status ? "Success" : "Fail"}</p>
      <p><strong>Timestamp:</strong> {new Date(tx.timestamp * 1000).toLocaleString()}</p>
    </div>
  );
}
