import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { SendIcon, SmileIcon, XIcon } from 'lucide-react';
import { logger } from '../../utils/logger'
import { useTranslation } from 'react-i18next';

const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '🎉', '❤️', '🔥', '👀'];
const MAX_CHARACTERS = 255;

function MessageForm({ eventId, onMessageSent, replyTo, setReplyTo, cooldown, isAdmin, cooldownEnabled, isChatLocked }) {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [showNameField, setShowNameField] = useState(true);
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const { user } = useAuth();
  const [remainingCooldown, setRemainingCooldown] = useState(cooldown);

  useEffect(() => {
    let timer;
    if (cooldownEnabled && remainingCooldown > 0) {
      timer = setInterval(() => {
        setRemainingCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [remainingCooldown, cooldownEnabled]);

  useEffect(() => {
    setRemainingCooldown(cooldown);
  }, [cooldown]);

  useEffect(() => {
    const savedName = sessionStorage.getItem('userName');
    if (savedName) {
      setName(savedName);
      setShowNameField(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || content.length > MAX_CHARACTERS || remainingCooldown > 0 || isChatLocked) return;
    
    try {
      const response = await api.post('/messages', { 
        content, 
        eventId, 
        name: user ? user.username : (name || undefined),
        replyTo: replyTo ? replyTo._id : undefined
      });
      logger.log('Message sent:', response.data);
      setContent('');
      setReplyTo(null);
      if (name && !user) {
        sessionStorage.setItem('userName', name);
        setShowNameField(false);
      }
      if (onMessageSent) onMessageSent();
      setRemainingCooldown(cooldown);
      showSuccessToast('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      showErrorToast('Failed to send message: ' + (error.response?.data?.error || error.message));
    }
  };

  const addEmoji = (emoji) => {
    if (content.length + emoji.length <= MAX_CHARACTERS) {
      setContent(prevContent => prevContent + emoji);
    }
    setShowEmojiMenu(false);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    if (newContent.length <= MAX_CHARACTERS) {
      setContent(newContent);
    }
  };

  const getReplyToUsername = () => {
    if (replyTo) {
      if (replyTo.user && replyTo.user.username) {
        return replyTo.user.username;
      } else if (replyTo.name) {
        return replyTo.name;
      } else {
        return 'Anonymous';
      }
    }
    return '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {replyTo && (
        <div className="flex items-center bg-muted p-2 rounded-md">
          <span className="text-sm text-muted-foreground mr-2">{t('messageForm.replyingTo', { user: getReplyToUsername() })}:</span>
          <span className="text-sm truncate flex-grow">{replyTo.content}</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-stretch space-y-2 sm:space-y-0 sm:space-x-2">
        {!user && showNameField && (
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('messageForm.yourName')}
            className="w-full sm:w-1/4 min-w-[100px]"
          />
        )}
        <div className="flex-grow relative">
          <Input
            id="message-input"
            type="text"
            value={content}
            onChange={handleContentChange}
            placeholder={isChatLocked ? t('messageForm.chatLocked') : (replyTo ? t('messageForm.typeReply') : t('messageForm.typeMessage'))}
            required
            className="pr-20"
            disabled={remainingCooldown > 0 || isChatLocked}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <span className="text-xs text-muted-foreground">
              {content.length}/{MAX_CHARACTERS}
            </span>
            <div className="relative">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => setShowEmojiMenu(!showEmojiMenu)}
                aria-label={t('messageForm.addEmoji')}
              >
                <SmileIcon className="w-4 h-4" />
              </Button>
              {showEmojiMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-background border border-border rounded-md shadow-lg p-2">
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      className="p-1 hover:bg-muted rounded"
                      onClick={() => addEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <Button 
          type="submit" 
          variant="primary" 
          disabled={content.length === 0 || content.length > MAX_CHARACTERS || (cooldownEnabled && remainingCooldown > 0) || isChatLocked}
          className="whitespace-nowrap"
        >
          <SendIcon className="h-4 w-4 mr-2" />
          {isChatLocked ? t('messageForm.chatLocked') : (cooldownEnabled && remainingCooldown > 0 ? t('messageForm.cooldown', { seconds: remainingCooldown.toFixed(0) }) : t('messageForm.send'))}
        </Button>
      </div>
    </form>
  );
}

export default MessageForm;