// src/components/CreateEventModal.jsx
import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { X } from 'lucide-react';
import api from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { format } from 'date-fns';

export function CreateEventModal({ isOpen, onClose, onEventCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [date, setDate] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [image, setImage] = useState(null);
  const [cooldownEnabled, setCooldownEnabled] = useState(true);
  const [cooldown, setCooldown] = useState(3);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('startTime', startTime);
    formData.append('endTime', endTime);
    formData.append('requiresApproval', requiresApproval);
    formData.append('cooldownEnabled', cooldownEnabled);
    formData.append('cooldown', cooldown);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await api.post('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Event created:', response.data);
      onEventCreated(response.data);
      showSuccessToast('Event created successfully');
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      showErrorToast('Failed to create event: ' + (error.response?.data?.details || error.message));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-8 max-w-md w-full shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Create New Event</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-foreground">Event Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-background text-foreground"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="bg-background text-foreground"
            />
          </div>
          <div>
            <Label htmlFor="startTime" className="text-foreground">Start Time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="bg-background text-foreground [color-scheme:dark]"
            />
          </div>
          <div>
            <Label htmlFor="endTime" className="text-foreground">End Time</Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="bg-background text-foreground [color-scheme:dark]"
            />
          </div>
          <div>
            <Label htmlFor="image" className="text-foreground">Event Image</Label>
            <Input
              id="image"
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              accept="image/*"
              className="bg-background text-foreground file:bg-primary file:text-primary-foreground file:border-0 file:mr-2 file:px-4 file:py-2 file:rounded-md hover:file:bg-primary/90"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="requiresApproval"
              checked={requiresApproval}
              onCheckedChange={setRequiresApproval}
            />
            <Label htmlFor="requiresApproval" className="text-foreground">Requires Approval</Label>
          </div>
          
          {/* New cooldown fields */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cooldownEnabled"
              checked={cooldownEnabled}
              onCheckedChange={setCooldownEnabled}
            />
            <Label htmlFor="cooldownEnabled" className="text-foreground">Enable message cooldown</Label>
          </div>
          {cooldownEnabled && (
            <div>
              <Label htmlFor="cooldown" className="text-foreground">Cooldown duration (seconds)</Label>
              <Input
                id="cooldown"
                type="number"
                value={cooldown}
                onChange={(e) => setCooldown(Number(e.target.value))}
                min="1"
                required
                className="bg-background text-foreground"
              />
            </div>
          )}
          
          <Button type="submit" className="w-full">Create Event</Button>
        </form>
      </div>
    </div>
  );
}