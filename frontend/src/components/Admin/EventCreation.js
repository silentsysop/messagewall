import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

function EventCreation() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [image, setImage] = useState(null);
  const [cooldownEnabled, setCooldownEnabled] = useState(true);
  const [cooldown, setCooldown] = useState(3);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('date', date);
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
      showSuccessToast('Event created successfully');
      navigate(`/event/${response.data._id}`);
    } catch (error) {
      console.error('Error creating event:', error);
      showErrorToast('Failed to create event: ' + (error.response?.data?.details || error.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="eventName">Event Name</Label>
        <Input
          id="eventName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Event Name"
          required
        />
      </div>
      <div>
        <Label htmlFor="eventDescription">Event Description</Label>
        <Textarea
          id="eventDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Event Description"
          required
        />
      </div>
      <div>
        <Label htmlFor="eventDate">Date</Label>
        <Input
          id="eventDate"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="eventImage">Event Image</Label>
        <Input
          id="eventImage"
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          accept="image/*"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="cooldownEnabled"
          checked={cooldownEnabled}
          onCheckedChange={setCooldownEnabled}
        />
        <Label htmlFor="cooldownEnabled">Enable message cooldown</Label>
      </div>
      {cooldownEnabled && (
        <div>
          <Label htmlFor="cooldown">Cooldown duration (seconds)</Label>
          <Input
            id="cooldown"
            type="number"
            value={cooldown}
            onChange={(e) => setCooldown(Number(e.target.value))}
            min="1"
            required
          />
        </div>
      )}
      <Button type="submit">Create Event</Button>
    </form>
  );
}

export default EventCreation;