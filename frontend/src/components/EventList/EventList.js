import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';


function EventList() {
  const [events, setEvents] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const toggleApproval = async (eventId, currentStatus) => {
    try {
      await api.put(`/events/${eventId}`, { requiresApproval: !currentStatus });
      fetchEvents(); // Refresh the events list
    } catch (error) {
      console.error('Error toggling approval:', error);
    }
  };

  const deleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${eventId}`);
        fetchEvents(); // Refresh the events list
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  return (
    <div className="event-list">
      <h1>Events</h1>
      {events.map(event => (
        <div key={event._id} className="event-card">
          <h2>{event.name}</h2>
          <p>{event.description}</p>
          <p>Date: {new Date(event.date).toLocaleDateString()}</p>
          <Link to={`/event/${event._id}`} className="view-button">View Message Wall</Link>
          {user && user.role === 'organizer' && (
            <div className="admin-controls">
              <button onClick={() => toggleApproval(event._id, event.requiresApproval)}>
                {event.requiresApproval ? 'Disable' : 'Enable'} Approval
              </button>
              <button onClick={() => deleteEvent(event._id)} className="delete-button">
                Delete Event
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default EventList;