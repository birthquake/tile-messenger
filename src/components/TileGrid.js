// src/components/TileGrid.js
import React, { useEffect, useState } from 'react';
import { subscribeToTiles, addTile, updateTile } from '../services/tileService';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

export default function TileGrid() {
  const [tiles, setTiles] = useState([]);
  const [editingTileId, setEditingTileId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [numColumns, setNumColumns] = useState(getNumColumns());

  useEffect(() => {
    const unsubscribe = subscribeToTiles(setTiles);
    window.addEventListener('resize', handleResize);
    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleResize = () => {
    setNumColumns(getNumColumns());
  };

  const getNumColumns = () => {
    const width = window.innerWidth;
    if (width < 600) return 2;
    if (width < 900) return 3;
    return 4;
  };

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

  const handleDelete = async (tileId) => {
    const tileToDelete = tiles.find(t => t.id === tileId);
    setTiles(prev => prev.filter(t => t.id !== tileId));

    toast(
      (t) => (
        <span>
          Tile deleted&nbsp;
          <button onClick={async () => {
            await addTile(tileToDelete);
            toast.dismiss(t.id);
          }}>Undo</button>
        </span>
      ),
      { duration: 5000 }
    );

    // Optional: delete from Firestore here if you want permanent removal
  };

  const getGradientColor = (index) => {
    const row = Math.floor(index / numColumns);
    const col = index % numColumns;
    const baseHue = (row * 60) % 360;
    const saturation = 70;
    const lightness = 60 - col * 5;
    return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
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
                        backgroundColor: getGradientColor(index),
                        position: 'relative'
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05, boxShadow: '0 0 8px rgba(0,0,0,0.2)' }}
                      transition={{ duration: 0.2 }}
                      onDoubleClick={() => {
                        setEditingTileId(tile.id);
                        setEditText(tile.preview);
                      }}
                    >
                      <button
                        className="delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(tile.id);
                        }}
                      >
                        ×
                      </button>

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
    </div>
  );
}
