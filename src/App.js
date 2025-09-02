import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import AuthForm from './components/AuthForm';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  if (!user) return <AuthForm onAuth={setUser} />;

  return (
    <div>
      <button onClick={() => signOut(auth)}>Sign Out</button>
      <h2>Welcome, {user.email}</h2>
      {/* Tile grid will go here */}
    </div>
  );
}

export default App;
