// src/context/NotificationContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import socket from '../services/socket';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'organizer') {
      socket.on('new message to moderate', (message) => {
        setNotifications(prev => [...prev, {
          id: message._id,
          type: 'moderation',
          content: `New message requires moderation`,
          details: message.content,
          eventName: message.event.name,
          createdAt: new Date(),
        }]);
      });
    }

    return () => {
      socket.off('new message to moderate');
    };
  }, [user]);

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, clearNotification, clearAllNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
