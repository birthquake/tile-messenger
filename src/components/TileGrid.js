import React, { useEffect, useState } from 'react';
import { subscribeToTiles, addTile, updateTile } from '../services/tileService';
import { ChromePicker } from 'react-color';

export default function TileGrid() {
  const [tiles, setTiles] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [editingTileId, setEditingTileId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToTiles(setTiles);
    return () => unsubscribe();
  }, []);

  const handleColorChange = async (color) => {
    if (!selectedTile) return;
    await updateTile(selectedTile.id, {
      color: color.hex,
      priority: Date.now()
    });
    setShowPicker(false);
    setSelectedTile(null);
  };

  const handleEditSubmit = async (tileId) => {
    await updateTile(tileId, { preview: editText });
    setEditingTileId(null);
    setEditText('');
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
            onDoubleClick={() => {
              setEditingTileId(tile.id);
              setEditText(tile.preview);
            }}
            onClick={() => {
              setSelectedTile(tile);
              setShowPicker(true);
            }}
          >
            {editingTileId === tile.id ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleEditSubmit(tile.id);
              }}>
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  autoFocus
                  onBlur={() => handleEditSubmit(tile.id)}
                />
              </form>
            ) : (
              <p>{tile.preview}</p>
            )}
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
