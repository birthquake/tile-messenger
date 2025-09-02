import { db, auth } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

// Get reference to user's tile collection
const getTileCollection = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");
  return collection(db, 'users', user.uid, 'tiles');
};

// 🔄 Listen for real-time tile updates
export const subscribeToTiles = (callback) => {
  const q = query(getTileCollection(), orderBy('priority', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const tiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(tiles);
  });
};

// ➕ Add a new tile
export const addTile = async (tileData = {}) => {
  const defaultTile = {
    preview: 'New message',
    color: '#CCCCCC',
    priority: Date.now()
  };
  return await addDoc(getTileCollection(), { ...defaultTile, ...tileData });
};

// ✏️ Update an existing tile
export const updateTile = async (tileId, updates) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");
  const tileRef = doc(db, 'users', user.uid, 'tiles', tileId);
  return await updateDoc(tileRef, updates);
};

// ❌ Delete a tile
export const deleteTile = async (tileId) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");
  const tileRef = doc(db, 'users', user.uid, 'tiles', tileId);
  return await deleteDoc(tileRef);
};
