import React, { useState, useEffect, useRef } from 'react';
import './Message.css';
import { Trash2 } from 'lucide-react'; // Import the trash icon

function Message({ message, canDelete, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const [animate, setAnimate] = useState(false);
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

  return (
    <div 
      className={`message ${animate ? 'animate' : ''} ${canDelete ? 'can-delete' : ''}`} 
      onContextMenu={handleContextMenu}
    >
      <div className="message-bubble" ref={bubbleRef}>
        <div className="message-header">
          <div className="message-info">
            <span className={`message-author ${isAdmin ? 'admin' : ''}`}>
              {isAdmin && <span className="admin-badge">Admin</span>}
              {message.user ? message.user.username : (message.name || 'Anonymous')}
            </span>
            <span className="message-time">
              {new Date(message.createdAt).toLocaleTimeString()}
            </span>
          </div>
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
        <span className="message-content">{message.content}</span>
      </div>
    </div>
  );
}

export default Message;