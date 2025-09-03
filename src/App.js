// src/App.js
import React, { useState } from 'react';
import TileGrid from './components/TileGrid';
import ConversationView from './components/ConversationView';
import './App.css'; // Global styles

function App() {
  const [selectedThread, setSelectedThread] = useState(null);

  const handleTileTap = (tile) => {
    const mockThread = {
      id: tile.id,
      title: tile.preview || 'Conversation',
      messages: [] // Will be populated in ConversationView
    };
    setSelectedThread(mockThread);
  };

  const handleBack = () => {
    setSelectedThread(null);
  };

  return (
    <div className="app">
      {selectedThread ? (
        <ConversationView thread={selectedThread} onBack={handleBack} />
      ) : (
        <TileGrid onTileTap={handleTileTap} />
      )}
    </div>
  );
}

export default App;
