import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import socket from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import Message from './Message';
import MessageForm from './MessageForm';
import './MessageWall.css';
import Layout from '../HUDlayout';
import { CalendarIcon, UsersIcon, ShieldIcon, ShareIcon, ClockIcon, SettingsIcon, AlertTriangle, FullscreenIcon, MinimizeIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { EventSettingsModal } from '../EventSettingsModal';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';

function MessageWall() {
  const [messages, setMessages] = useState([]);
  const [event, setEvent] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const { id } = useParams();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const navigate = useNavigate();
  const [spectateMode, setSpectateMode] = useState(false);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    fetchEvent();
    fetchMessages();
  
    socket.emit('join event', id);
  
    socket.on('new message', (newMessage) => {
      setMessages(prevMessages => [...prevMessages, newMessage]);
      if (!isScrolled) {
        scrollToBottom();
      }
    });

    socket.on('user count', (count) => {
      setActiveUsers(count);
    });
  
    return () => {
      socket.off('new message');
      socket.off('user count');
      socket.emit('leave event', id);
    };
  }, [id, isScrolled]);

  useEffect(() => {
    if (isInitialLoad && messages.length > 0) {
      scrollToBottom('auto');
      setIsInitialLoad(false);
    }
  }, [messages, isInitialLoad]);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      setIsScrolled(scrollTop + clientHeight < scrollHeight - 10);
    };

    const scrollContainer = scrollContainerRef.current;
    scrollContainer?.addEventListener('scroll', handleScroll);
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
      setCooldown(response.data.cooldownEnabled ? response.data.cooldown : 0);
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: `Join the event: ${event.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Event link copied to clipboard!');
      }, (err) => {
        console.error('Could not copy text: ', err);
      });
    }
  };

  const handleNewMessage = () => {
    fetchMessages();
    scrollToBottom();
    setLastMessageTime(Date.now());
  };

  const getRemainingCooldown = () => {
    if (!cooldown) return 0;
    const elapsed = (Date.now() - lastMessageTime) / 1000;
    return Math.max(0, cooldown - elapsed);
  };

  const handleReply = (message, focusInput) => {
    setReplyTo(message);
    scrollToBottom();
    focusInput();
  };

  const handleEventUpdate = (updatedEvent) => {
    setEvent(updatedEvent);
    setCooldown(updatedEvent.cooldownEnabled ? updatedEvent.cooldown : 0);
  };

  const handleEventDelete = () => {
    navigate('/'); // Redirect to home page after event deletion
  };

  const formatEventStartTime = (date) => {
    const now = new Date();
    const startDate = new Date(date);
    
    if (isToday(startDate)) {
      return `Today at ${format(startDate, 'h:mm a')}`;
    } else if (isTomorrow(startDate)) {
      return `Tomorrow at ${format(startDate, 'h:mm a')}`;
    } else if (differenceInDays(startDate, now) < 7) {
      return format(startDate, 'EEEE \'at\' h:mm a'); // e.g., "Friday at 2:30 PM"
    } else {
      return format(startDate, 'MMM d \'at\' h:mm a'); // e.g., "Jun 15 at 2:30 PM"
    }
  };

  const toggleSpectateMode = () => {
    setSpectateMode(!spectateMode);
  };

  return (
    <Layout>
      <div className={`flex flex-col h-full bg-background ${spectateMode ? 'fixed inset-0 z-50 spectate-mode' : ''}`}>
        {!spectateMode && event && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card shadow-md p-2 sm:p-4 mb-2 sm:mb-4 rounded-lg"
          >
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate mr-2">{event.name}</h1>
              <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  onClick={handleShare}
                >
                  <ShareIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                </Button>
                {user && user.role === 'organizer' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                    onClick={() => setShowSettingsPopup(true)}
                  >
                    <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  onClick={toggleSpectateMode}
                >
                  <FullscreenIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center text-xs sm:text-sm text-muted-foreground gap-2">
              <div className="flex items-center">
                <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span>{formatEventStartTime(event.startTime)}</span>
              </div>
              <div className="flex items-center">
                <UsersIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span>{activeUsers} active</span>
              </div>
              {event.requiresApproval && (
                <div className="flex items-center text-primary">
                  <ShieldIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>Moderated</span>
                </div>
              )}
              {cooldown > 0 && (
                <div className="flex items-center text-primary">
                  <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>{cooldown}s</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
        {!spectateMode && event && event.requiresApproval && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 sm:p-4 mb-2 sm:mb-4 rounded-r-lg text-xs sm:text-sm"
          >
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              <p className="font-medium">Message Approval Required</p>
            </div>
          </motion.div>
        )}
        <div className={`flex-grow overflow-hidden flex flex-col bg-background rounded-lg shadow-lg ${spectateMode ? 'h-full' : 'border border-border'}`}>
          <div className="flex-grow overflow-y-auto p-4 scroll-smooth" ref={scrollContainerRef}>
            {messages.map((message, index) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Message 
                  message={message}
                  canDelete={user && (user.role === 'organizer' || user._id === message.user._id)}
                  onDelete={() => deleteMessage(message._id)}
                  onReply={handleReply}
                />
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <AnimatePresence>
            {isScrolled && !spectateMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className={`absolute right-4 sm:right-8 z-10 ${
                  user 
                    ? 'bottom-28 sm:bottom-20' 
                    : 'bottom-40 sm:bottom-20'
                }`}
              >
                <Button 
                  className="rounded-full shadow-lg"
                  onClick={() => scrollToBottom()}
                >
                  New messages
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          {!spectateMode && (
            <div className="p-4 bg-background border-t border-border">
              <MessageForm 
                eventId={id} 
                onMessageSent={handleNewMessage} 
                replyTo={replyTo}
                setReplyTo={setReplyTo}
                cooldown={getRemainingCooldown()}
              />
            </div>
          )}
        </div>
        {spectateMode && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-8 z-50"
            onClick={toggleSpectateMode}
          >
            <MinimizeIcon className="h-5 w-5" />
          </Button>
        )}
      </div>
      {showSettingsPopup && (
        <EventSettingsModal
          event={event}
          onClose={() => setShowSettingsPopup(false)}
          onUpdate={handleEventUpdate}
          onDelete={handleEventDelete}
        />
      )}
    </Layout>
  );
}

export default MessageWall;