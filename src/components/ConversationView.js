// src/components/ConversationView.js
import React, { useState, useEffect, useRef } from 'react';
import './ConversationView.css';
import { db } from '../firebase'; // adjust path as needed
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc
} from 'firebase/firestore';

export default function ConversationView({ thread, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messageEndRef = useRef(null);

  useEffect(() => {
    const messagesRef = collection(db, 'tiles', thread.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: new Date(doc.data().timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [thread.id]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const messagesRef = collection(db, 'tiles', thread.id, 'messages');
    await addDoc(messagesRef, {
      sender: 'You',
      text: input,
      timestamp: Date.now()
    });
    setInput('');
  };

  return (
    <div className="conversation-view">
      <header className="conversation-header">
        <button className="back-button" onClick={onBack}>←</button>
        <h2>{thread?.title || 'Conversation'}</h2>
      </header>

      <div className="message-list">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender === 'You' ? 'sent' : 'received'}`}>
            <div className="bubble">
              <p>{msg.text}</p>
              <span className="timestamp">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <div className="message-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
