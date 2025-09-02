import React, { useEffect, useState } from 'react';
import { subscribeToTiles, addTile } from '../services/tileService';

export default function TileGrid() {
  const [tiles, setTiles] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToTiles(setTiles);
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <button onClick={() => addTile()}>Add Tile</button>
      <div className="grid">
        {tiles.map(tile => (
          <div key={tile.id} className="tile" style={{ backgroundColor: tile.color }}>
            <p>{tile.preview}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
