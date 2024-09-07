import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { SendIcon, SmileIcon } from 'lucide-react';

const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '🎉', '❤️', '🔥', '👀'];

function MessageForm({ eventId, onMessageSent }) {
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [showNameField, setShowNameField] = useState(true);
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
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
    if (!content.trim()) return;
    
    try {
      const response = await api.post('/messages', { 
        content, 
        eventId, 
        name: user ? user.username : (name || undefined)
      });
      console.log('Message sent:', response.data);
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

  const addEmoji = (emoji) => {
    setContent(prevContent => prevContent + emoji);
    setShowEmojiMenu(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      {!user && showNameField && (
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name (optional)"
          className="flex-grow"
        />
      )}
      <div className="flex-grow relative">
        <Input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          required
          className="pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setShowEmojiMenu(!showEmojiMenu)}
          >
            <SmileIcon className="w-4 h-4" />
          </Button>
        </div>
        {showEmojiMenu && (
          <div className="absolute right-0 bottom-full mb-2 bg-background border border-border rounded-md shadow-lg p-2">
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
      <Button type="submit" variant="primary">
        <SendIcon className="w-4 h-4 mr-2" />
        Send
      </Button>
    </form>
  );
}

export default MessageForm;