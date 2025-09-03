// src/components/ConversationView.js
import React, { useState, useEffect, useRef } from 'react';
import './ConversationView.css';

export default function ConversationView({ thread }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messageEndRef = useRef(null);

  useEffect(() => {
    // Mock messages for layout preview
    setMessages([
      { sender: 'You', text: 'Hey, are we still on for tomorrow?', timestamp: '10:42 AM' },
      { sender: 'Alex', text: 'Yep! Looking forward to it.', timestamp: '10:45 AM' },
      { sender: 'You', text: 'Awesome. I’ll bring the gear.', timestamp: '10:47 AM' }
    ]);
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = {
      sender: 'You',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
  };

  return (
    <div className="conversation-view">
      <header className="conversation-header">
        <button className="back-button">←</button>
        <h2>{thread?.title || 'Conversation'}</h2>
      </header>

      <div className="message-list">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender === 'You' ? 'sent' : 'received'}`}>
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
