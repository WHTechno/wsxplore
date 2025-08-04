import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BlockLatest from './components/BlockLatest';
import BlockList from './components/BlockList';
import TransactionList from './components/TransactionList';
import TransactionDetail from './components/TransactionDetail';
import SearchBar from './components/SearchBar';
import Stats from './components/Stats';

export default function App() {
  return (
    <Router>
      <div style={{ padding: 20 }}>
        <h1>Uomi Block Explorer</h1>
        <nav style={{ marginBottom: 20 }}>
          <Link to="/" style={{ marginRight: 10 }}>Home</Link>
          <Link to="/blocks" style={{ marginRight: 10 }}>Blocks</Link>
          <Link to="/transactions" style={{ marginRight: 10 }}>Transactions</Link>
          <Link to="/stats" style={{ marginRight: 10 }}>Stats</Link>
        </nav>
        <SearchBar />
        <hr />
        <Routes>
          <Route path="/" element={<BlockLatest />} />
          <Route path="/blocks" element={<BlockList />} />
          <Route path="/blocks/:blockNumber" element={<div>Block detail page (not implemented)</div>} />
          <Route path="/transactions" element={<TransactionList />} />
          <Route path="/tx/:hash" element={<TransactionDetail />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}
