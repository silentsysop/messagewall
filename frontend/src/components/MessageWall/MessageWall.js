import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import socket from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import Message from './Message';
import MessageForm from './MessageForm';
import './MessageWall.css';
import Layout from '../HUDlayout';
import { CalendarIcon, UsersIcon, ShieldIcon, ShareIcon, ClockIcon, SettingsIcon, AlertTriangle, FullscreenIcon, MinimizeIcon, BarChart2Icon, Lock, Unlock } from 'lucide-react';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { EventSettingsModal } from '../EventSettingsModal';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { fi, enUS } from 'date-fns/locale';
import { PollCreationModal } from '../PollCreationModal';
import { PollDisplay } from '../PollDisplay';
import { showErrorToast, showSuccessToast } from '../../utils/toast';
import { useTheme } from '../../context/ThemeContext';
import { logger } from '../../utils/logger';
import { useTranslation } from 'react-i18next';


function MessageWall() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [event, setEvent] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const { id } = useParams();
  const { user, loading, checkLoggedIn } = useAuth();
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const navigate = useNavigate();
  const [spectateMode, setSpectateMode] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [activePoll, setActivePoll] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isChatLocked, setIsChatLocked] = useState(false);
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);

  const canPerformAdminActions = user && user.role === 'organizer';

  const { theme } = useTheme();

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  const fetchEvent = useCallback(async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
      setIsChatLocked(response.data.isChatLocked);
      setCooldown(response.data.cooldownEnabled ? response.data.cooldown : 0);
      console.log('Fetched event:', response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  }, [id]);

  useEffect(() => {
    logger.log('MessageWall component mounted');
    fetchEvent();
    fetchMessages();
    checkLoggedIn(); // Re-check the logged-in state when component mounts
  
    logger.log('Emitting join event for:', id);
    socket.emit('join event', id);
  
    socket.on('new message', (newMessage) => {
      logger.log('Received new message:', newMessage);
      setMessages(prevMessages => {
        // Check if the message already exists
        const existingMessageIndex = prevMessages.findIndex(msg => msg._id === newMessage._id);
        if (existingMessageIndex !== -1) {
          // If it exists, update it
          const updatedMessages = [...prevMessages];
          updatedMessages[existingMessageIndex] = newMessage;
          return updatedMessages;
        } else {
          // If it doesn't exist, add it
          return [...prevMessages, newMessage];
        }
      });
      if (!isScrolled) {
        scrollToBottom();
      }
    });

    socket.on('event updated', (updatedEventId) => {
      if (updatedEventId === id) {
        fetchEvent();
      }
    });

    socket.on('reaction updated', ({ messageId, reactions }) => {
      setMessages(prevMessages => prevMessages.map(msg => 
        msg._id === messageId ? { ...msg, reactions } : msg
      ));
    });
  
    socket.on('user count', (count) => {
      setActiveUsers(count);
    });
  
    socket.on('new poll', (poll) => {
      setActivePoll(poll);
    });
  
    socket.on('poll update', (updatedPoll) => {
      setActivePoll(updatedPoll);
    });
  
    socket.on('poll ended', (endedPoll) => {
      setActivePoll(prev => prev && prev._id === endedPoll._id ? endedPoll : prev);
    });
  
    socket.on('poll removed', (removedPollId) => {
      setActivePoll(prev => prev && prev._id === removedPollId ? null : prev);
    });
  
    socket.on('poll deleted', (deletedPollId) => {
      setActivePoll(prev => prev && prev._id === deletedPollId ? null : prev);
    });
  
    socket.on('approval status changed', ({ eventId, requiresApproval }) => {
      if (eventId === id) {
        setEvent(prevEvent => ({ ...prevEvent, requiresApproval }));
        // Update all messages to reflect the new approval status
        setMessages(prevMessages => prevMessages.map(msg => ({
          ...msg,
          approved: requiresApproval ? msg.approved : true
        })));
      }
    });
  
    socket.on('message deleted', (deletedMessageId) => {
      setMessages(prevMessages => prevMessages.filter(msg => msg._id !== deletedMessageId));
    });
  
    socket.on('chat lock changed', (lockStatus) => {
      setIsChatLocked(lockStatus);
    });
  
    socket.on('user role updated', ({ userId, customRole }) => {
      setMessages(prevMessages => prevMessages.map(message => 
        message && message.user && message.user._id === userId 
          ? { ...message, user: { ...message.user, customRole } }
          : message
      ));
    });
  
    return () => {
      logger.log('MessageWall component unmounting');
      socket.off('new message');
      socket.off('reaction updated');
      socket.off('user count');
      socket.off('new poll');
      socket.off('poll update');
      socket.off('poll ended');
      socket.off('poll removed');
      socket.off('poll deleted');
      socket.off('approval status changed');
      socket.off('message deleted'); 
      socket.off('chat lock changed');
      socket.off('user role updated');
      socket.off('event updated');
      logger.log('Emitting leave event for:', id);
      socket.emit('leave event', id);
    };
  }, [id, isScrolled, fetchEvent]);

  useEffect(() => {
    if (isInitialLoad && messages.length > 0) {
      scrollToBottom('auto');
      setIsInitialLoad(false);
    }
  }, [messages, isInitialLoad]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const isBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
        setIsAtBottom(isBottom);
      }
    };


    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  useEffect(() => {
    const fetchActivePoll = async () => {
      try {
        const response = await api.get(`/polls/${id}`);
        setActivePoll(response.data.activePoll);
      } catch (error) {
        console.error('Error fetching active poll:', error);
        // Don't set any state or show any error to the user
      }
    };

    fetchActivePoll();
  }, [id]);

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
      // Remove this line as it's no longer needed
      // setMessages(messages.filter(message => message._id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: t('messageWall.joinEvent'),
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        showErrorToast(t('messageWall.shareError'));
      }
    } else {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl).then(() => {
        showSuccessToast(t('messageWall.linkCopied'));
      }, (err) => {
        console.error('Could not copy text: ', err);
        showErrorToast(t('messageWall.shareError'));
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
    const locale = i18n.language === 'fi' ? fi : enUS;
    
    if (isToday(startDate)) {
      return t('eventCard.today', { time: format(startDate, 'HH:mm', { locale }) });
    } else if (isTomorrow(startDate)) {
      return t('eventCard.tomorrow', { time: format(startDate, 'HH:mm', { locale }) });
    } else if (differenceInDays(startDate, now) < 7) {
      return t('eventCard.thisWeek', { 
        day: format(startDate, 'EEEE', { locale }), 
        time: format(startDate, 'HH:mm', { locale }) 
      });
    } else {
      return t('eventCard.future', { 
        date: format(startDate, 'd.M.', { locale }), 
        time: format(startDate, 'HH:mm', { locale }) 
      });
    }
  };


  const toggleSpectateMode = () => {
    setSpectateMode(!spectateMode);
  };

  const handleVote = async (pollId, optionIndex) => {
    try {
      const response = await api.post(`/polls/${pollId}/vote`, { optionIndex });
      setActivePoll(response.data);
    } catch (error) {
      console.error('Error voting on poll:', error);
      showErrorToast('Failed to submit vote');
    }
  };

  const handlePollEnd = async (pollId) => {
    try {
      const response = await api.put(`/polls/${pollId}/end`);
      setActivePoll(response.data);  // Update the poll state with the ended poll data
    } catch (error) {
      console.error('Error ending poll:', error);
      showErrorToast('Failed to end poll');
    }
  };

  const handleRemovePoll = (pollId) => {
    setActivePoll(null);
  };

  const isChatCurrentlyLocked = () => {
    if (!event) return true; // Assume locked if event data isn't loaded yet
    const now = new Date();
    return isChatLocked || now < new Date(event.startTime) || now > new Date(event.endTime);
  };

  const renderChatLockStatus = () => {
    if (isChatCurrentlyLocked()) {
      return (
        <div className="flex items-center justify-center bg-red-500 text-white py-2">
          <Lock className="mr-2" />
          <span>{t('messageWall.chatLocked')}</span>
        </div>
      );
    }
    return null;
  };

  const handleToggleChatLock = async () => {
    try {
      const response = await api.put(`/events/${id}/toggle-chat-lock`);
      setIsChatLocked(response.data.isChatLocked);
      showSuccessToast(`Chat ${response.data.isChatLocked ? 'locked' : 'unlocked'} successfully`);
    } catch (error) {
      console.error('Error toggling chat lock:', error);
      showErrorToast('Failed to toggle chat lock');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className={`flex flex-col h-full bg-background ${spectateMode ? 'fixed inset-0 z-50 spectate-mode' : ''}`}>
        {event && renderChatLockStatus()}
        {!spectateMode && event && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card border-b shadow-md p-2 sm:p-4 rounded-lg"
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
                    onClick={() => setShowSettingsSidebar(true)}
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
                {canPerformAdminActions && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                    onClick={() => setShowPollModal(true)}
                  >
                    <BarChart2Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center text-xs sm:text-sm text-muted-foreground gap-2">
              <div className="flex items-center">
                <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span>{formatEventStartTime(event.startTime)}</span>
              </div>
              <div className="flex items-center">
                <UsersIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span>{t('messageWall.activeUsers', { count: activeUsers })}</span>
              </div>
              {event.requiresApproval && (
                <div className="flex items-center text-primary">
                  <ShieldIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>{t('messageWall.moderated')}</span>
                </div>
              )}
              {cooldown > 0 && (
                <div className="flex items-center text-primary">
                  <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>{t('messageWall.cooldown', { seconds: cooldown })}</span>
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
            className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-2 sm:p-4 rounded-r-lg text-xs sm:text-sm"
          >
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              <p className="font-medium">{t('messageWall.moderationNotice')}</p>
            </div>
          </motion.div>
        )}
        <div className={`flex-grow overflow-hidden flex flex-col bg-background bg-puukuvio bg-no-repeat bg-left-peek-lg bg-peek-lg ${theme === 'light' ? 'bg-blend-multiply bg-opacity-[0.15]' : 'bg-blend-soft-light bg-opacity-[0.1]'} rounded-lg shadow-lg ${spectateMode ? 'h-full' : ''}`}>
          <div className="flex-grow overflow-y-auto scroll-smooth" ref={scrollContainerRef}>
            {activePoll && (
              <div className="sticky top-0 z-10">
                <PollDisplay
                  poll={activePoll}
                  onVote={handleVote}
                  isOrganizer={canPerformAdminActions}
                />
              </div>
            )}
            <div className="px-4">
              {messages.filter(message => message && message._id).map((message, index) => (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Message 
                    message={message}
                    canDelete={canPerformAdminActions}
                    onDelete={() => deleteMessage(message._id)}
                    onReply={handleReply}
                    event={event}
                    isAdmin={canPerformAdminActions}
                  />
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
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
                  {t('messageWall.newMessages')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          {!spectateMode && event && (
            <div className="p-4 bg-card border-t border-border">
              <MessageForm 
                eventId={id} 
                onMessageSent={handleNewMessage} 
                replyTo={replyTo}
                setReplyTo={setReplyTo}
                cooldown={getRemainingCooldown()}
                isAdmin={canPerformAdminActions}
                cooldownEnabled={event.cooldownEnabled}
                isChatLocked={isChatCurrentlyLocked()}
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
      {showSettingsSidebar && (
        <EventSettingsModal
          event={event}
          onClose={() => setShowSettingsSidebar(false)}
          onUpdate={handleEventUpdate}
          onDelete={handleEventDelete}
          isChatLocked={isChatLocked}
          onToggleChatLock={handleToggleChatLock}
        />
      )}
      <PollCreationModal
        isOpen={showPollModal}
        onClose={() => setShowPollModal(false)}
        eventId={id}
        isOrganizer={canPerformAdminActions}
      />
      {event && event.endTime < new Date() && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          {t('messageWall.eventEnded')}
        </div>
      )}
      {event && event.startTime > new Date() && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
          {t('messageWall.eventNotStarted')}
        </div>
      )}
    </Layout>
  );
}



export default MessageWall;
