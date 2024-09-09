import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import socket from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import Message from './Message';
import MessageForm from './MessageForm';
import './MessageWall.css';
import Layout from '../HUDlayout';
import { CalendarIcon, UsersIcon, ShieldIcon, ShareIcon, ClockIcon, SettingsIcon, AlertTriangle } from 'lucide-react';
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

  return (
    <Layout>
      <div className="flex flex-col h-full bg-background">
        {event && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card shadow-md p-6 mb-4 rounded-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-foreground">{event.name}</h1>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  onClick={handleShare}
                >
                  <ShareIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </Button>
                {user && user.role === 'organizer' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                    onClick={() => setShowSettingsPopup(true)}
                  >
                    <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center text-muted-foreground space-x-4">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span>{formatEventStartTime(event.startTime)}</span>
              </div>
              <div className="flex items-center">
                <UsersIcon className="w-4 h-4 mr-2" />
                <span>{activeUsers} active {activeUsers === 1 ? 'user' : 'users'}</span>
              </div>
              {event.requiresApproval && (
                <div className="flex items-center text-primary">
                  <ShieldIcon className="w-4 h-4 mr-2" />
                  <span>Moderated</span>
                </div>
              )}
              {cooldown > 0 && (
                <div className="flex items-center text-primary">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  <span>{cooldown}s cooldown</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
        {event && event.requiresApproval && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded-r-lg"
          >
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <p className="font-medium">Message Approval Required</p>
            </div>
            <p className="mt-2 text-sm">
              Messages in this event require approval before they appear. Your message will be reviewed by a moderator before being posted.
            </p>
          </motion.div>
        )}
        <div className="flex-grow overflow-hidden flex flex-col bg-background rounded-lg shadow-lg border border-border">
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
            {isScrolled && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-20 right-8"
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
          <div className="p-4 bg-card border-t border-border">
            <MessageForm 
              eventId={id} 
              onMessageSent={handleNewMessage} 
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              cooldown={getRemainingCooldown()}
            />
          </div>
        </div>
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