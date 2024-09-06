import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import socket from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import Message from './Message';
import MessageForm from './MessageForm';
import './MessageWall.css';

function MessageWall() {
  const [messages, setMessages] = useState([]);
  const [event, setEvent] = useState(null);
  const { id } = useParams();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchEvent();
    fetchMessages();

    socket.emit('join event', id);

    socket.on('new message', (newMessage) => {
      setMessages(prevMessages => [...prevMessages, newMessage]);
      scrollToBottom();
    });

    return () => {
      socket.off('new message');
    };
  }, [id]);

  useEffect(scrollToBottom, [messages]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/${id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      setMessages(messages.filter(message => message._id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <div className="message-wall">
      {event && <h1>{event.name}</h1>}
      <div className="message-list">
        {messages.map(message => (
          <Message 
            key={message._id} 
            message={message}
            canDelete={user && (user.role === 'organizer' || user._id === message.user)}
            onDelete={() => deleteMessage(message._id)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageForm eventId={id} onMessageSent={fetchMessages} />
    </div>
  );
}

export default MessageWall;