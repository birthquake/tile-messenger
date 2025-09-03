// src/components/TileGrid.js
import React, { useEffect, useState } from 'react';
import { subscribeToTiles, addTile, updateTile } from '../services/tileService';
import { ChromePicker } from 'react-color';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

export default function TileGrid() {
  const [tiles, setTiles] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [editingTileId, setEditingTileId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    for (let i = 0; i < reordered.length; i++) {
      await updateTile(reordered[i].id, {
        priority: Date.now() + (reordered.length - i)
      });
    }

    setLoading(false);
    toast.success('Tiles reordered');
  };

  const handleEditSubmit = async (tileId) => {
    setLoading(true);
    await updateTile(tileId, { preview: editText });
    setEditingTileId(null);
    setEditText('');
    setLoading(false);
    toast.success('Tile updated');
  };

  return (
    <div>
      <Toaster position="top-right" />
      <button className="add-tile-button" onClick={() => addTile()}>+</button>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tileGrid" direction="horizontal">
          {(provided) => (
            <div className="grid" ref={provided.innerRef} {...provided.droppableProps}>
              {tiles.map((tile, index) => (
                <Draggable key={tile.id} draggableId={tile.id} index={index}>
                  {(provided) => (
                    <motion.div
                      className="tile"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        backgroundColor: tile.color
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05, boxShadow: '0 0 8px rgba(0,0,0,0.2)' }}
                      transition={{ duration: 0.2 }}
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
                    </motion.div>
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
              setLoading(true);
              await updateTile(selectedTile.id, {
                color: color.hex,
                priority: Date.now()
              });
              setShowPicker(false);
              setSelectedTile(null);
              setLoading(false);
              toast.success('Color updated');
            }}
          />
        </div>
      )}
    </div>
  );
}
