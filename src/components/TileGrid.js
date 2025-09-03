// src/components/TileGrid.js
import React, { useEffect, useState } from 'react';
import { subscribeToTiles, addTile, updateTile } from '../services/tileService';
import { ChromePicker } from 'react-color';
import {
  DragDropContext,
  Droppable,
  Draggable
} from 'react-beautiful-dnd';

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

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reordered = Array.from(tiles);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setTiles(reordered);

    for (let i = 0; i < reordered.length; i++) {
      await updateTile(reordered[i].id, {
        priority: Date.now() + (reordered.length - i)
      });
    }
  };

  const handleEditSubmit = async (tileId) => {
    await updateTile(tileId, { preview: editText });
    setEditingTileId(null);
    setEditText('');
  };

  return (
    <div>
      <button onClick={() => addTile()}>Add Tile</button>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tileGrid" direction="horizontal">
          {(provided) => (
            <div
              className="grid"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {tiles.map((tile, index) => (
                <Draggable key={tile.id} draggableId={tile.id} index={index}>
                  {(provided) => (
                    <div
                      className="tile"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        backgroundColor: tile.color
                      }}
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
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {showPicker && selectedTile && (
        <div style={{ position: 'absolute', top: 100, left: 100, zIndex: 10 }}>
          <ChromePicker
            color={selectedTile.color}
            onChangeComplete={async (color) => {
              await updateTile(selectedTile.id, {
                color: color.hex,
                priority: Date.now()
              });
              setShowPicker(false);
              setSelectedTile(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
