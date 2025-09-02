import React, { useState } from 'react';

function App() {
  const [tiles, setTiles] = useState([
    { id: 1, preview: "Hey Rashied!", color: "#FFD700" },
    { id: 2, preview: "Kickball plans", color: "#ADD8E6" },
    { id: 3, preview: "Corkt update", color: "#90EE90" }
  ]);

  return (
    <div className="grid">
      {tiles.map(tile => (
        <div key={tile.id} className="tile" style={{ backgroundColor: tile.color }}>
          <p>{tile.preview}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
