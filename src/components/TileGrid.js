import React, { useEffect, useState } from 'react';
import { subscribeToTiles, addTile, updateTile } from '../services/tileService';
import { ChromePicker } from 'react-color';

export default function TileGrid() {
  const [tiles, setTiles] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToTiles(setTiles);
    return () => unsubscribe();
  }, []);

  const handleColorChange = async (color) => {
    if (!selectedTile) return;
    await updateTile(selectedTile.id, {
      color: color.hex,
      priority: Date.now() // bump priority to move it up
    });
    setShowPicker(false);
    setSelectedTile(null);
  };

  return (
    <div>
      <button onClick={() => addTile()}>Add Tile</button>
      <div className="grid">
        {tiles.map(tile => (
          <div
            key={tile.id}
            className="tile"
            style={{ backgroundColor: tile.color }}
            onClick={() => {
              setSelectedTile(tile);
              setShowPicker(true);
            }}
          >
            <p>{tile.preview}</p>
          </div>
        ))}
      </div>

      {showPicker && selectedTile && (
        <div style={{ position: 'absolute', top: 100, left: 100, zIndex: 10 }}>
          <ChromePicker
            color={selectedTile.color}
            onChangeComplete={handleColorChange}
          />
        </div>
      )}
    </div>
  );
}
