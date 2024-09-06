import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './MessageForm.css';

function MessageForm({ eventId, onMessageSent }) {
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [showNameField, setShowNameField] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const savedName = sessionStorage.getItem('userName');
    if (savedName) {
      setName(savedName);
      setShowNameField(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/messages', { 
        content, 
        eventId, 
        name: user ? user.username : (name || undefined)
      });
      console.log('Message sent:', response.data); // Add this line for debugging
      setContent('');
      if (name && !user) {
        sessionStorage.setItem('userName', name);
        setShowNameField(false);
      }
      if (onMessageSent) onMessageSent();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-form">
      {!user && showNameField && (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name (optional)"
          className="name-input"
        />
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Send a message"
        required
        className="message-input"
      />
      <button type="submit" className="send-button">Chat</button>
    </form>
  );
}

export default MessageForm;