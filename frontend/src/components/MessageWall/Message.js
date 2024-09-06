import React, { useState, useRef, useEffect } from 'react';
import './Message.css';

function Message({ message, canDelete, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const isAdmin = message.user && message.user.role === 'organizer';

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (canDelete) {
      setShowMenu(true);
    }
  };

  return (
    <div className="message" onContextMenu={handleContextMenu}>
      <span className={`message-author ${isAdmin ? 'admin' : ''}`}>
        {isAdmin && <span className="admin-badge">Admin</span>}
        {message.user ? message.user.username : (message.name || 'Anonymous')}
      </span>
      <span className="message-time">
        {new Date(message.createdAt).toLocaleTimeString()}
      </span>
      <span className="message-content">{message.content}</span>
      {showMenu && (
        <div className="context-menu" ref={menuRef}>
          <button onClick={onDelete}>Delete Message</button>
        </div>
      )}
    </div>
  );
}

export default Message;