// src/App.js
import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import TileGrid from './components/TileGrid';
import AuthForm from './components/AuthForm';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return <AuthForm onAuth={setUser} />;
  }

  return <TileGrid onTileTap={(tile) => console.log('Tapped:', tile)} />;
}

export default App;
