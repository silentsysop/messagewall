// src/components/PastEvents.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { CalendarIcon, LayoutGrid, List, MoreVertical, Trash, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from './HUDlayout';
import { format } from 'date-fns';
import config from '../config';
import { useTranslation } from 'react-i18next';

export default function PastEvents() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showMenu, setShowMenu] = useState({});
  const menuRefs = useRef({});

  useEffect(() => {
    fetchPastEvents();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(showMenu).forEach((eventId) => {
        if (showMenu[eventId] && menuRefs.current[eventId] && !menuRefs.current[eventId].contains(event.target)) {
          setShowMenu(prev => ({ ...prev, [eventId]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const fetchPastEvents = async () => {
    try {
      const response = await api.get('/events/past');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching past events:', error);
    }
  };

  const toggleMenu = (eventId) => {
    setShowMenu(prev => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const toggleApproval = async (eventId, currentStatus) => {
    try {
      await api.put(`/events/${eventId}`, { requiresApproval: !currentStatus });
      fetchPastEvents(); // Refresh the events list
    } catch (error) {
      console.error('Error toggling approval:', error);
    }
  };

  const deleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${eventId}`);
        fetchPastEvents(); // Refresh the events list
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const renderEventCard = (event) => (
    <Card key={event._id} className={`group relative rounded-lg shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl ${viewMode === 'list' ? 'flex' : ''}`}>
      <Link to={`/event/${event._id}`} className="absolute inset-0 z-10">
        <span className="sr-only">{t('common.viewEvent')}</span>
      </Link>
      <CardContent className={`p-4 ${viewMode === 'list' ? 'flex flex-1' : ''}`}>
        <div className={`relative ${viewMode === 'grid' ? 'h-48 w-full mb-4' : 'h-24 w-24 mr-4 flex-shrink-0'}`}>
          <img 
            src={event.imageUrl ? `${config.socketUrl}${event.imageUrl}` : `${process.env.REACT_APP_BASENAME}placeholder.png`} 
            alt={event.name} 
            className="absolute inset-0 h-full w-full object-cover rounded-md"
          />
        </div>
        <div className={`flex flex-col ${viewMode === 'list' ? 'flex-1' : ''}`}>
          <h3 className="text-lg font-semibold">{event.name}</h3>
          <p className="text-sm text-muted-foreground">
            {format(new Date(event.startTime), 'PPP p')} - {format(new Date(event.endTime), 'PPP p')}
          </p>
          <p className="mt-2 text-sm flex-grow">{event.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback>
                  {event.organizer && event.organizer.username ? event.organizer.username[0] : '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {event.organizer && event.organizer.username ? event.organizer.username : t('common.unknownOrganizer')}
              </span>
            </div>
            {user && user.role === 'organizer' && (
              <div className="relative z-20" ref={el => menuRefs.current[event._id] = el}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleMenu(event._id);
                  }}
                  className="relative"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
                {showMenu[event._id] && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-muted rounded-md shadow-lg py-1 z-30">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleApproval(event._id, event.requiresApproval);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {event.requiresApproval ? t('eventSettings.disableApproval') : t('eventSettings.enableApproval')}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteEvent(event._id);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      {t('eventSettings.deleteEvent')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('pastEvents.title')}</h1>
            <p className="text-muted-foreground">{t('pastEvents.description')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setViewMode('grid')} aria-label={t('mainPage.gridView')}>
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setViewMode('list')} aria-label={t('mainPage.listView')}>
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4'}>
          {events.length > 0 ? events.map(renderEventCard) : <p>{t('pastEvents.noPastEvents')}</p>}
        </div>
      </div>
    </Layout>
  );
}
