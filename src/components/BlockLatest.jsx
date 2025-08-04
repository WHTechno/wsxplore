import React, { useEffect, useState } from 'react';
import { fetchLatestBlocks } from '../api';
import { Link } from 'react-router-dom';

export default function BlockLatest() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestBlocks().then(data => {
      setBlocks(data.items || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading latest blocks...</div>;

  return (
    <div>
      <h2>Latest Blocks</h2>
      <ul>
        {blocks.map(block => (
          <li key={block.number}>
            <Link to={`/blocks/${block.number}`}>
              Block #{block.number} - Tx: {block.transactionCount} - Time: {new Date(block.timestamp * 1000).toLocaleString()}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
