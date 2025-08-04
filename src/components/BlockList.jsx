import React, { useEffect, useState } from 'react';
import { fetchBlocks } from '../api';
import { Link } from 'react-router-dom';

export default function BlockList() {
  const [blocks, setBlocks] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchBlocks(page).then(data => {
      setBlocks(data.items || []);
      setLoading(false);
    });
  }, [page]);

  const prevPage = () => setPage(p => Math.max(p - 1, 1));
  const nextPage = () => setPage(p => p + 1);

  if (loading) return <div>Loading blocks...</div>;

  return (
    <div>
      <h2>Blocks (Page {page})</h2>
      <ul>
        {blocks.map(block => (
          <li key={block.number}>
            <Link to={`/blocks/${block.number}`}>
              Block #{block.number} - Tx: {block.transactionCount} - Time: {new Date(block.timestamp * 1000).toLocaleString()}
            </Link>
          </li>
        ))}
      </ul>
      <button onClick={prevPage} disabled={page === 1}>Prev</button>
      <button onClick={nextPage}>Next</button>
    </div>
  );
}
