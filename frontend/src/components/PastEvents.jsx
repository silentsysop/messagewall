// src/components/PastEvents.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { CalendarIcon, LayoutGrid, List } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from './HUDlayout';

export default function PastEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchPastEvents();
  }, []);

  const fetchPastEvents = async () => {
    try {
      const response = await api.get('/events/past');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching past events:', error);
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
            src={event.imageUrl ? `${process.env.REACT_APP_API_URL}${event.imageUrl}` : '/placeholder-event.jpg'} 
            alt={event.name} 
            className="absolute inset-0 h-full w-full object-cover rounded-md"
          />
        </div>
        <div className={`flex flex-col ${viewMode === 'list' ? 'flex-1' : ''}`}>
          <h3 className="text-lg font-semibold">{event.name}</h3>
          <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
          <p className="mt-2 text-sm flex-grow">{event.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback>
                  {event.organizer && event.organizer.username ? event.organizer.username[0] : '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {event.organizer && event.organizer.username ? event.organizer.username : 'Unknown Organizer'}
              </span>
            </div>
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
            <h1 className="text-2xl font-bold">Past Events</h1>
            <p className="text-muted-foreground">Browse events that have already taken place.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setViewMode('grid')} aria-label="Grid view">
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setViewMode('list')} aria-label="List view">
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4'}>
          {events.map(renderEventCard)}
        </div>
      </div>
    </Layout>
  );
}