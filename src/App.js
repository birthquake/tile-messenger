import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import TileGrid from './components/TileGrid';
import AuthForm from './components/AuthForm';

function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false); // 👈 new flag

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true); // 👈 mark auth as resolved
    });
    return () => unsubscribe();
  }, []);

  if (!authReady) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuth={setUser} />;
  }

  return <TileGrid onTileTap={(tile) => console.log('Tapped:', tile)} />;
}

export default App;
