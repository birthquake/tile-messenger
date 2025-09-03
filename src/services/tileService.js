// src/services/tileService.js
import { db, auth } from '../firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';

export const subscribeToTiles = (setTiles) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const tilesRef = collection(db, 'users', user.uid, 'tiles');
  return onSnapshot(tilesRef, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTiles(data);
  });
};

export const addTile = async (tileData = {}) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const newTileRef = doc(collection(db, 'users', user.uid, 'tiles'));
  await setDoc(newTileRef, {
    preview: '',
    priority: Date.now(),
    pinned: false,
    unread: false,
    lastSender: '',
    ...tileData
  });
};

export const updateTile = async (tileId, updates) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const tileRef = doc(db, 'users', user.uid, 'tiles', tileId);
  await updateDoc(tileRef, updates);
};
