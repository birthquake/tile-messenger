// src/App.js
import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import TileGrid from './components/TileGrid';
import AuthForm from './components/AuthForm';
import './App.css'; // Make sure this is present

function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  if (!authReady) {
    return (
      <main className="splash-screen">
        <div className="logo">🟪 TileTalk</div>
        <div className="tagline">Organize your messages. Swipe your way through.</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="auth-wrapper">
        <AuthForm onAuth={setUser} />
      </main>
    );
  }

  return (
    <main className="grid-wrapper">
      <TileGrid onTileTap={(tile) => console.log('Tapped:', tile)} />
    </main>
  );
}

export default App;
