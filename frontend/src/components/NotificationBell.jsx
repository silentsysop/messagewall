import React, { useState, useRef, useCallback } from 'react';
import { Bell, Gavel, Calendar, X, MessageSquare, AlertTriangle, Clock, ExternalLink, Trash, VolumeX, Volume2 } from 'lucide-react';
import { Button } from "./ui/button";
import { useNotifications } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./ui/tooltip";
import { Badge } from "./ui/badge";
import { useNavigate } from 'react-router-dom';
import { logger } from '../utils/logger'

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead, markAllAsRead, isNotificationsMuted, toggleMute } = useNotifications();
  const { t } = useTranslation();
  const containerRef = useRef();
  const navigate = useNavigate();

  useOnClickOutside(containerRef, () => setIsOpen(false));

  const unreadCount = notifications.filter(n => n && !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'moderation':
        return <Gavel className="h-5 w-5" />;
      case 'event':
        return <Calendar className="h-5 w-5" />;
      case 'message':
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getNotificationContent = (notification) => {
    const parts = notification.content.split(': ');
    if (parts.length === 2 && parts[0] === 'New message requires moderation in event') {
      return (
        <>
          <span className="font-semibold">{t('notifications.newMessageModeration')}</span>
          <span className="text-muted-foreground"> {parts[1]}</span>
        </>
      );
    }
    return notification.content;
  };

  const handleJump = useCallback((notif) => {
    logger.log('Jumping to event:', notif);
    if (notif && notif.eventId) {
      logger.log('Navigating to:', `/event/${notif.eventId}`);
      navigate(`/event/${notif.eventId}`);
      setIsOpen(false);
    } else {
      logger.error('No eventId found in notification:', notif);
    }
  }, [navigate]);

  const renderNotification = (notif) => {
    if (!notif) return null; // Skip rendering if the notification is null

    return (
      <motion.div
        key={notif._id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`p-4 border-b border-border hover:bg-accent/5 transition-colors duration-200 ${notif.read ? 'opacity-75' : ''}`}
      >
        <div className="flex items-start space-x-3">
          <div className={`notification-icon notification-icon-${notif.type}`}>
            {getNotificationIcon(notif.type)}
          </div>
          <div className="flex-grow">
            <p className="notification-title">{getNotificationContent(notif)}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="notification-subtitle flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleJump(notif);
                  }}
                  className="notification-action"
                  title={t('notifications.jumpToEvent')}
                  
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsRead(notif._id)}
                  className="notification-action"
                  title={t('notifications.delete')}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(prev => !prev)}
              className="relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring w-10 h-10 rounded-full"
              aria-label={t('notifications.toggle')}
            >
              <Bell className="h-5 w-5 text-foreground" />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge variant="destructive" className="h-5 min-w-[20px] flex items-center justify-center">
                      {unreadCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {t('notifications.toggle')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-96 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="p-4 border-b border-border ">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground">{t('notifications.title')}</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="text-muted-foreground hover:text-foreground rounded-full"
                    aria-label={isNotificationsMuted ? t('notifications.unmute') : t('notifications.mute')}
                  >
                    {isNotificationsMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-muted-foreground hover:text-foreground rounded-full"
                    aria-label={t('notifications.close')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>{t('notifications.noNotifications')}</p>
                </div>
              ) : (
                notifications.map(renderNotification)
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-4 border-t border-border ">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="w-full text-center text-muted-foreground hover:text-foreground hover:bg-accent/10"
                >
                  {t('notifications.dismissAll')}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
