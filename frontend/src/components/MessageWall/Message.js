import React, { useState, useEffect, useRef } from 'react';
import './Message.css';
import { Trash2, ReplyIcon, ThumbsUp, ThumbsDown } from 'lucide-react'; // Import the reply icon
import api from '../../services/api';
import { toast } from 'react-hot-toast'; // Import toast

function Message({ message, canDelete, onDelete, onReply }) {
  const [showMenu, setShowMenu] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [userReaction, setUserReaction] = useState(message.userReaction); // Track user's reaction locally
  const [reactions, setReactions] = useState(message.reactions); // Track reactions locally for optimistic UI
  const [isProcessing, setIsProcessing] = useState(false); // Track if a reaction is being processed
  const menuRef = useRef(null);
  const bubbleRef = useRef(null);
  const isAdmin = message.user && message.user.role === 'organizer';

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    setAnimate(true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  useEffect(() => {
    if (animate && bubbleRef.current) {
      createBubbles(bubbleRef.current);
    }
  }, [animate]);

  useEffect(() => {
    // Update local state when message prop changes (e.g., from Socket.io)
    setUserReaction(message.userReaction);
    setReactions(message.reactions);
  }, [message.userReaction, message.reactions]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (canDelete) {
      setShowMenu(!showMenu); // Toggle the menu
    }
  };

  const createBubbles = (container) => {
    const bubbleCount = 10;
    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      const size = Math.random() * 20 + 10;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.animationDuration = `${Math.random() * 2 + 1}s`;
      container.appendChild(bubble);
    }
  };

  const getDisplayName = () => {
    if (message.user && message.user.username) {
      return message.user.username;
    }
    return message.name || 'Anonymous';
  };

  const handleReact = async (reaction) => {
    if (isProcessing) return; // Prevent multiple clicks

    setIsProcessing(true); // Immediately set isProcessing to true

    // Determine the new reaction state
    let newReaction = reaction;
    let previousReaction = userReaction;

    // Optimistically update the UI
    if (userReaction === reaction) {
      // User is removing their reaction
      newReaction = null;
      setUserReaction(null);
      setReactions(prev => ({
        ...prev,
        [reaction]: prev[reaction] - 1 < 0 ? 0 : prev[reaction] - 1 // Ensure count doesn't go negative
      }));
    } else {
      // User is adding/changing their reaction
      setUserReaction(reaction);
      setReactions(prev => ({
        ...prev,
        [reaction]: prev[reaction] + 1,
        ...(previousReaction && { [previousReaction]: prev[previousReaction] - 1 < 0 ? 0 : prev[previousReaction] - 1 })
      }));
    }

    try {
      const response = await api.post(`/messages/${message._id}/react`, { reaction });

      // Optionally, you can verify the response and update local state if needed
      // But since Socket.io will handle updates, no further action is required
    } catch (error) {
      console.error('Error reacting to message:', error);
      // Rollback the optimistic update
      setUserReaction(previousReaction);
      setReactions(prev => ({
        ...prev,
        [reaction]: newReaction ? prev[reaction] - 1 < 0 ? 0 : prev[reaction] - 1 : prev[reaction],
        ...(previousReaction && { [previousReaction]: prev[previousReaction] + 1 })
      }));
      
      // Display specific error message if available
      const errorMessage = error.response?.data?.error || 'Failed to update reaction. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className={`message ${animate ? 'animate' : ''} ${canDelete ? 'can-delete' : ''}`} 
      onContextMenu={handleContextMenu}
    >
      <div className="message-bubble" ref={bubbleRef}>
        {message.replyTo && (
          <div className="replied-message">
            <span className="replied-to">Replying to {message.replyTo.user ? message.replyTo.user.username : (message.replyTo.name || 'Anonymous')}:</span>
            <span className="replied-content">{message.replyTo.content}</span>
          </div>
        )}
        <div className="message-header">
          <div className="message-info">
            <span className={`message-author ${isAdmin ? 'admin' : ''}`}>
              {isAdmin && <span className="admin-badge">Admin</span>}
              {getDisplayName()}
            </span>
            <span className="message-time">
              {new Date(message.createdAt).toLocaleTimeString()}
            </span>
          </div>
          <div className="message-actions">
            <button 
              className="reply-button" 
              onClick={() => onReply(message, () => document.getElementById('message-input').focus())}
            >
              <ReplyIcon size={14} />
            </button>
            {canDelete && (
              <button 
                className="delete-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
        <span className="message-content">{message.content}</span>
        <div className="message-reactions">
          <button 
            onClick={() => handleReact('thumbsUp')} 
            className={`reaction-button ${userReaction === 'thumbsUp' ? 'active' : ''}`}
            disabled={isProcessing}
            aria-label="Thumbs Up"
          >
            <ThumbsUp size={16} />
            <span>{reactions.thumbsUp}</span>
          </button>
          <button 
            onClick={() => handleReact('thumbDown')} 
            className={`reaction-button ${userReaction === 'thumbDown' ? 'active' : ''}`}
            disabled={isProcessing}
            aria-label="Thumbs Down"
          >
            <ThumbsDown size={16} />
            <span>{reactions.thumbDown}</span>
          </button>
        </div>
      </div>
      {canDelete && showMenu && (
        <div className="context-menu show" ref={menuRef}>
          <button onClick={onDelete}>Delete</button>
        </div>
      )}
    </div>
  );
}

export default Message;