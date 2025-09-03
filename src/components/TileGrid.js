// src/components/TileGrid.js
import React, { useEffect, useState } from 'react';
import { subscribeToTiles, addTile, updateTile } from '../services/tileService';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import toast, { Toaster } from 'react-hot-toast';

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
    toast(tile.pinned ? 'Unpinned' : 'Pinned');
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

    const scoreA = (a.replyCount || 0) * 1000 + (a.lastUpdated || 0);
    const scoreB = (b.replyCount || 0) * 1000 + (b.lastUpdated || 0);

    return scoreB - scoreA;
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

      <button className="add-tile-button" onClick={() => addTile()}>＋</button>

      {loading && <div className="loading-spinner">Loading...</div>}

      {sortedTiles.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty-state"
        >
          <p>No tiles match this filter.</p>
        </motion.div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tileGrid" direction="horizontal">
          {(provided) => (
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <AnimatePresence>
                {sortedTiles.map((tile, index) => {
                  if (!tile?.id) return null;

                  const handlers = useSwipeable({
                    onSwipedLeft: () => handleDelete(tile.id),
                    onSwipedRight: () => handlePinToggle(tile),
                    preventDefaultTouchmoveEvent: true,
                    trackMouse: true
                  });

                  return (
                    <Draggable key={tile.id} draggableId={tile.id} index={index}>
                      {(provided) => (
                        <div {...handlers}>
                          <motion.div
                            className="tile"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            layout
                            transition={{ layout: { duration: 0.4, ease: 'easeOut' } }}
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
                              {tile.pinned ? '📌' : '📍'}
                            </button>

                            <div className="tile-tags">
                              {tile.unread && <span className="tag unread-dot">•</span>}
                              {tile.pinned && <span className="tag pin-icon">📌</span>}
                              {tile.lastSender && tile.lastSender !== 'You' && (
                                <span className="tag reply-glow">💬</span>
                              )}
                            </div>

                            <p>{tile.preview}</p>
                          </motion.div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
              </AnimatePresence>
              {provided.placeholder}
            </motion.div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
