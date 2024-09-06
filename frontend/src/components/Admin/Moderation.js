import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function Moderation() {
  const [pendingMessages, setPendingMessages] = useState([]);

  useEffect(() => {
    fetchPendingMessages();
  }, []);

  const fetchPendingMessages = async () => {
    try {
      const response = await api.get('/messages/pending');
      console.log('Pending messages response:', response.data);
      setPendingMessages(response.data);
    } catch (error) {
      console.error('Error fetching pending messages:', error);
    }
  };

  const handleApprove = async (messageId) => {
    try {
      await api.put(`/messages/approve/${messageId}`);
      fetchPendingMessages();
    } catch (error) {
      console.error('Error approving message:', error);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      fetchPendingMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <div>
      <h1>Message Moderation</h1>
      {pendingMessages.length === 0 ? (
        <p>No pending messages</p>
      ) : (
        pendingMessages.map(message => (
          <div key={message._id}>
            <p>Content: {message.content}</p>
            <p>Event: {message.event.name}</p>
            <p>User: {message.user ? message.user.username : message.name}</p>
            <p>Created at: {new Date(message.createdAt).toLocaleString()}</p>
            <button onClick={() => handleApprove(message._id)}>Approve</button>
            <button onClick={() => handleDelete(message._id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}

export default Moderation;