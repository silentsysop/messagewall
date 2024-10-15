import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { CalendarIcon, LayoutGrid, List, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from './HUDlayout';
import { format, isToday, isTomorrow, differenceInDays, isBefore } from 'date-fns';
import { showErrorToast, showSuccessToast } from '../utils/toast';
import config from '../config';
import { useTranslation } from 'react-i18next';

export default function SavedEvents() {
  const { t } = useTranslation();
  const [savedEvents, setSavedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedEvents();
  }, [user, navigate]);

  const fetchSavedEvents = async () => {
    if (!user) {
      showErrorToast('Please log in or register to view saved events.');
      navigate('/');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get('/users/saved-events');
      setSavedEvents(response.data);
    } catch (error) {
      console.error('Error fetching saved events:', error);
      showErrorToast('Failed to fetch saved events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsave = async (eventId) => {
    try {
      await api.delete(`/users/saved-events/${eventId}`);
      setSavedEvents(savedEvents.filter(event => event._id !== eventId));
      showSuccessToast('Event unsaved successfully');
    } catch (error) {
      console.error('Error unsaving event:', error);
      showErrorToast('Failed to unsave event. Please try again.');
    }
  };

  const formatEventTime = (date) => {
    const eventDate = new Date(date);
    const now = new Date();
    
    if (isToday(eventDate)) {
      return t('eventCard.today', { time: format(eventDate, 'h:mm a') });
    } else if (isTomorrow(eventDate)) {
      return t('eventCard.tomorrow', { time: format(eventDate, 'h:mm a') });
    } else if (differenceInDays(eventDate, now) < 7) {
      return t('eventCard.thisWeek', { day: format(eventDate, 'EEEE'), time: format(eventDate, 'h:mm a') });
    } else {
      return t('eventCard.future', { date: format(eventDate, 'MMM d'), time: format(eventDate, 'h:mm a') });
    }
  };

  const getEventStatus = (startTime, endTime) => {
    const now = new Date();
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isBefore(endDate, now)) {
      return t('eventCard.ended');
    } else if (isBefore(startDate, now)) {
      return t('eventCard.ongoing');
    } else {
      return t('eventCard.starts', { time: formatEventTime(startDate) });
    }
  };

  const renderEventCard = (event) => (
    <Card key={event._id} className={`group relative rounded-lg shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl ${viewMode === 'list' ? 'flex' : ''}`}>
      <Link to={`/event/${event._id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View event</span>
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
          <div className="mt-1 space-y-1">
            <p className="text-sm font-medium text-green-600">
              {getEventStatus(event.startTime, event.endTime)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatEventTime(event.startTime)} - {format(new Date(event.endTime), 'h:mm a')}
            </p>
          </div>
          <p className="mt-2 text-sm flex-grow line-clamp-2">{event.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {format(new Date(event.startTime), 'MMM d, yyyy')}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUnsave(event._id);
              }}
              className="z-20 relative"
            >
              <Heart className="h-5 w-5 fill-current text-red-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <Layout><div>{t('common.loading')}</div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('savedEvents.title')}</h1>
            <p className="text-muted-foreground">{t('savedEvents.description')}</p>
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
        {savedEvents.length === 0 ? (
          <p>{t('savedEvents.noSavedEvents')}</p>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4'}>
            {savedEvents.map(renderEventCard)}
          </div>
        )}
      </div>
    </Layout>
  );
}