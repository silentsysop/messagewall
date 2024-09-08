import React, { useState } from 'react';
import { X, Save, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import api from '../services/api';
import { showSuccessToast, showErrorToast, showConfirmToast } from '../utils/toast';

export function EventSettingsModal({ event, onClose, onUpdate, onDelete }) {
  const [name, setName] = useState(event.name);
  const [description, setDescription] = useState(event.description);
  const [requiresApproval, setRequiresApproval] = useState(event.requiresApproval);
  const [cooldownEnabled, setCooldownEnabled] = useState(event.cooldownEnabled);
  const [cooldown, setCooldown] = useState(event.cooldown);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(event.imageUrl ? `http://localhost:5000${event.imageUrl}` : null);
  const [clearImage, setClearImage] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
      setClearImage(false);
    }
  };

  const handleClearImage = () => {
    setImage(null);
    setImagePreview(null);
    setClearImage(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedEventData = {
        name,
        description,
        requiresApproval,
        cooldownEnabled,
        cooldown,
        clearImage
      };

      let response = await api.put(`/events/${event._id}`, updatedEventData);

      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        response = await api.put(`/events/${event._id}/image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      showSuccessToast('Event updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating event:', error);
      showErrorToast('Failed to update event: ' + (error.response?.data?.details || error.message));
    }
  };

  const handleDeleteEvent = async () => {
    showConfirmToast(
      'Are you sure you want to delete this event? This action cannot be undone.',
      async () => {
        try {
          await api.delete(`/events/${event._id}`);
          showSuccessToast('Event deleted successfully');
          onDelete();
          onClose();
        } catch (error) {
          console.error('Error deleting event:', error);
          showErrorToast('Failed to delete event: ' + (error.response?.data?.details || error.message));
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-8 max-w-md w-full shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Event Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="image">Event Image</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="image"
                type="file"
                onChange={handleImageChange}
                accept="image/*"
              />
              {imagePreview && !clearImage && (
                <Button type="button" onClick={handleClearImage} variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            {imagePreview && !clearImage && (
              <div className="mt-2">
                <img src={imagePreview} alt="Event preview" className="max-w-full h-auto rounded-md" />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="requiresApproval"
              checked={requiresApproval}
              onCheckedChange={setRequiresApproval}
            />
            <Label htmlFor="requiresApproval">Requires Approval</Label>
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
          <Button type="submit" className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </form>
        <div className="mt-6 pt-4 border-t border-border">
          <Button onClick={handleDeleteEvent} variant="destructive" className="w-full">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Event
          </Button>
        </div>
      </div>
    </div>
  );
}