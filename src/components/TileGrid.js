// src/components/TileGrid.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth } from '../firebase';

export default function TileGrid() {
  const [tiles, setTiles] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'tiles'),
      orderBy('priority', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTiles(data);
    });
    return () => unsubscribe();
  }, []);

  const addTile = async () => {
    await addDoc(collection(db, 'users', auth.currentUser.uid, 'tiles'), {
      preview: 'New message',
      color: '#CCCCCC',
      priority: Date.now()
    });
  };

  return (
    <div>
      <button onClick={addTile}>Add Tile</button>
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
