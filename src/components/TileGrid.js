// src/components/TileGrid.js
import React, { useEffect, useState } from 'react';
import { subscribeToTiles, addTile, updateTile } from '../services/tileService';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { ReactComponent as PinIcon } from '../assets/icons/pin.svg';
import { ReactComponent as ReplyIcon } from '../assets/icons/reply.svg';
import { ReactComponent as DotIcon } from '../assets/icons/dot.svg';
import { ReactComponent as AddIcon } from '../assets/icons/add.svg';

const getNumColumns = () => {
  if (typeof window === 'undefined') return 4;
  const width = window.innerWidth;
  if (width < 600) return 2;
  if (width < 900) return 3;
  return 4;
};

export default function TileGrid({ onTileTap }) {
  const [tiles, setTiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [numColumns, setNumColumns] = useState(getNumColumns());
  const [authError, setAuthError] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    try {
      const unsubscribe = subscribeToTiles(setTiles);
      window.addEventListener('resize', handleResize);
      return () => {
        unsubscribe?.();
        window.removeEventListener('resize', handleResize);
      };
    } catch (err) {
      console.error('Tile subscription failed:', err);
      setAuthError(true);
      setLoading(false);
    }
  }, []);

  const handleResize = () => {
    setNumColumns(getNumColumns());
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

  const handlePinToggle = async (tile) => {
    await updateTile(tile.id, { pinned: !tile.pinned });
  };

  const getGradientColor = (index) => {
    const row = Math.floor(index / numColumns);
    const col = index % numColumns;
    const baseHue = (row * 60) % 360;
    const saturation = 70;
    const lightness = 60 - col * 5;
    return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
  };

  const filteredTiles = tiles.filter((tile) => {
    if (filter === 'pinned') return tile.pinned;
    if (filter === 'unread') return tile.unread;
    if (filter === 'replied') return tile.lastSender && tile.lastSender !== 'You';
    return true;
  });

  const sortedTiles = filteredTiles.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.priority - a.priority;
  });

  if (authError) {
    return (
      <div className="empty-state">
        <p>You must be signed in to view your tiles.</p>
      </div>
    );
  }

  return (
    <div className="tilegrid-wrapper">
      <Toaster position="top-right" />

      <div className="filter-tabs">
        {['all', 'pinned', 'unread', 'replied'].map((type) => (
          <button
            key={type}
            className={`filter-tab ${filter === type ? 'active' : ''}`}
            onClick={() => setFilter(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <button className="add-tile-button" onClick={() => addTile()}>
        <AddIcon />
      </button>

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
                {sortedTiles.map((tile, index) => {
                  if (!tile?.id) return null;

                  return (
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

                          <button
                            className="pin-toggle"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePinToggle(tile);
                            }}
                          >
                            <PinIcon />
                          </button>

                          <div className="tile-tags">
                            {tile.unread && <DotIcon className="tag unread-dot" />}
                            {tile.pinned && <PinIcon className="tag pin-icon" />}
                            {tile.lastSender && tile.lastSender !== 'You' && (
                              <ReplyIcon className="tag reply-glow" />
                            )}
                          </div>

                          <p>{tile.preview}</p>
                        </motion.div>
                      )}
                    </Draggable>
                  );
                })}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
