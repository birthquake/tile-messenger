// src/components/TileGrid.js
import React, { useEffect, useState } from 'react';
import { subscribeToTiles, addTile, updateTile } from '../services/tileService';
import { ChromePicker } from 'react-color';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tiles.findIndex(tile => tile.id === active.id);
    const newIndex = tiles.findIndex(tile => tile.id === over.id);
    const newOrder = arrayMove(tiles, oldIndex, newIndex);

    setTiles(newOrder);

    for (let i = 0; i < newOrder.length; i++) {
      await updateTile(newOrder[i].id, {
        priority: Date.now() + (newOrder.length - i)
      });
    }
  };

  return (
    <div>
      <button onClick={() => addTile()}>Add Tile</button>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tiles.map(tile => tile.id)} strategy={verticalListSortingStrategy}>
          <div className="grid">
            {tiles.map(tile => (
              <SortableTile
                key={tile.id}
                tile={tile}
                isEditing={editingTileId === tile.id}
                editText={editText}
                setEditText={setEditText}
                setEditingTileId={setEditingTileId}
                handleEditSubmit={async () => {
                  await updateTile(tile.id, { preview: editText });
                  setEditingTileId(null);
                  setEditText('');
                }}
                onColorPick={() => {
                  setSelectedTile(tile);
                  setShowPicker(true);
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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

function SortableTile({
  tile,
  isEditing,
  editText,
  setEditText,
  setEditingTileId,
  handleEditSubmit,
  onColorPick
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: tile.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: tile.color
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="tile"
      style={style}
      onDoubleClick={() => {
        setEditingTileId(tile.id);
        setEditText(tile.preview);
      }}
      onClick={onColorPick}
    >
      {isEditing ? (
        <form onSubmit={(e) => {
          e.preventDefault();
          handleEditSubmit();
        }}>
          <input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            autoFocus
            onBlur={handleEditSubmit}
          />
        </form>
      ) : (
        <p>{tile.preview}</p>
      )}
    </div>
  );
}
