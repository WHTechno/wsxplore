import React, { useEffect, useState } from 'react';
import { fetchTransactions } from '../api';
import { Link } from 'react-router-dom';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTransactions(page).then(data => {
      setTransactions(data.items || []);
      setLoading(false);
    });
  }, [page]);

  const prevPage = () => setPage(p => Math.max(p - 1, 1));
  const nextPage = () => setPage(p => p + 1);

  if (loading) return <div>Loading transactions...</div>;

  return (
    <div>
      <h2>Transactions (Page {page})</h2>
      <ul>
        {transactions.map(tx => (
          <li key={tx.hash}>
            <Link to={`/tx/${tx.hash}`}>
              Hash: {tx.hash.substring(0, 20)}... - Block: {tx.blockNumber} - From: {tx.from} - To: {tx.to}
            </Link>
          </li>
        ))}
      </ul>
      <button onClick={prevPage} disabled={page === 1}>Prev</button>
      <button onClick={nextPage}>Next</button>
    </div>
  );
}
