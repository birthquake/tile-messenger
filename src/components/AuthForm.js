// src/components/AuthForm.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function AuthForm({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCred = isLogin
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);
      onAuth(userCred.user);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 20 }}>
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', color: 'blue' }}>
        {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
      </p>
    </form>
  );
}
