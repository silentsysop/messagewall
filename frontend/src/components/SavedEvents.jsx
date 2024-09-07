// src/components/SavedEvents.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { HeartIcon } from 'lucide-react';
import api from '../services/api';
import Layout from './HUDlayout';

export default function SavedEvents() {
  const [savedEvents, setSavedEvents] = useState([]);

  useEffect(() => {
    fetchSavedEvents();
  }, []);

  const fetchSavedEvents = async () => {
    try {
      const response = await api.get('/users/saved-events');
      setSavedEvents(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching saved events:', error);
    }
  };


  

  const handleUnsave = async (eventId) => {
    try {
      await api.delete(`/users/saved-events/${eventId}`);
      setSavedEvents(savedEvents.filter(event => event._id !== eventId));
    } catch (error) {
      console.error('Error unsaving event:', error);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <h1 className="text-2xl font-bold mb-6">Saved Events</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {savedEvents.map(event => (
            <Card key={event._id} className="group relative overflow-hidden rounded-lg shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
              <Link to={`/event/${event._id}`} className="absolute inset-0 z-10">
                <span className="sr-only">View event</span>
              </Link>
              <CardContent className="p-4">
                <div className="relative h-48 w-full mb-4">
                  <img 
                    src={event.imageUrl ? `http://localhost:5000${event.imageUrl}` : '/placeholder-event.jpg'} 
                    alt={event.name} 
                    className="absolute inset-0 h-full w-full object-cover rounded-md"
                  />
                </div>
                <h3 className="text-lg font-semibold">{event.name}</h3>
                <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                <p className="mt-2 text-sm">{event.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarFallback>
                        {event.organizer && event.organizer.username ? event.organizer.username[0].toUpperCase() : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {event.organizer && event.organizer.username ? event.organizer.username : 'Unknown Organizer'}
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
                    className="z-20"
                  >
                    <HeartIcon className="h-5 w-5 fill-current text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}