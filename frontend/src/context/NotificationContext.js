// src/context/NotificationContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import { useAuth } from './AuthContext';
import { logger } from '../utils/logger'

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsMuted, setIsNotificationsMuted] = useState(false);
  const { user } = useAuth();
  const notificationSound = useRef(new Audio(`/notification-sound.mp3`));
  const isMounted = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (user) {
      try {
        const response = await api.get('/notifications');
        const validNotifications = response.data.filter(notif => notif && notif.eventId);
        if (validNotifications.length !== response.data.length) {
          logger.warn('Some notifications are invalid or missing eventId');
        }
        setNotifications(validNotifications);
      } catch (error) {
        logger.error('Error fetching notifications:', error);
      }
    }
  }, [user]);

  const fetchMutePreference = useCallback(async () => {
    if (user) {
      try {
        const response = await api.get('/users/mute-preference');
        setIsNotificationsMuted(response.data.isNotificationsMuted);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          logger.warn('Mute preference not found, setting default to false');
          setIsNotificationsMuted(false);
        } else {
          logger.error('Error fetching mute preference:', error);
        }
      }
    }
  }, [user]);

  const playNotificationSound = useCallback(() => {
    if (!isNotificationsMuted) {
      notificationSound.current.play().catch(error => logger.error('Error playing notification sound:', error));
    }
  }, [isNotificationsMuted]);

  const clearNotification = useCallback((relatedId) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notif => notif.relatedId !== relatedId)
    );
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      fetchNotifications();
      fetchMutePreference();
    }

    if (user) {
      socket.on('new notification', (newNotification) => {
        setNotifications(prevNotifications => [...prevNotifications, newNotification]);
        playNotificationSound();
      });
    }

    return () => {
      socket.off('new notification');
    };
  }, [user, fetchNotifications, fetchMutePreference, playNotificationSound]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.filter(notif => notif._id !== id));
    } catch (error) {
      logger.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications([]);
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
    }
  };

  const toggleMute = async () => {
    try {
      const newMuteState = !isNotificationsMuted;
      await api.put('/users/mute-preference', { isNotificationsMuted: newMuteState });
      setIsNotificationsMuted(newMuteState);
    } catch (error) {
      logger.error('Error updating mute preference:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      markAsRead, 
      markAllAsRead, 
      fetchNotifications,
      isNotificationsMuted,
      toggleMute,
      clearNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
