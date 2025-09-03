// src/components/TileGrid.js
import React, { useEffect, useState } from 'react';
import { subscribeToTiles, addTile, updateTile } from '../services/tileService';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

export default function TileGrid({ onTileTap }) {
  const [tiles, setTiles] = useState([]);
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
  };

  const handleTileTap = (tile) => {
    onTileTap(tile);
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

      {loading && <div className="loading-spinner">Loading...</div>}

      {tiles.length === 0 && !loading && (
        <div className="empty-state">
          <p>No conversations yet. Tap + to start one.</p>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tileGrid" direction="horizontal">
          {(provided) => (
            <div className="grid" ref={provided.innerRef} {...provided.droppableProps}>
              <AnimatePresence>
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
                          position: 'relative',
                          cursor: 'grab'
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => handleTileTap(tile)}
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
                        <p>{tile.preview}</p>
                      </motion.div>
                    )}
                  </Draggable>
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
