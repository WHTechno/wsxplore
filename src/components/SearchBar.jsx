import React, { useState } from 'react';
import { searchExplorer } from '../api';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const res = await searchExplorer(query.trim());
      if (res.blocks?.length > 0) {
        navigate(`/blocks/${res.blocks[0].number}`);
      } else if (res.transactions?.length > 0) {
        navigate(`/tx/${res.transactions[0].hash}`);
      } else if (res.addresses?.length > 0) {
        navigate(`/address/${res.addresses[0]}`);
      } else {
        setError('No results found');
      }
    } catch (err) {
      setError('Search failed');
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Search block, tx hash, or address"
        value={query}
        onChange={e => { setQuery(e.target.value); setError(null); }}
        style={{ width: '300px' }}
      />
      <button type="submit">Search</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}
