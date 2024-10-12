import React, { useState } from 'react';
import { X, Save, Upload, Trash2, Image as ImageIcon, Lock, Unlock } from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import api from '../services/api';
import { showSuccessToast, showErrorToast, showConfirmToast } from '../utils/toast';
import { format } from 'date-fns';
import { PollPresetManager } from './PollPresetManager';
import { PollHistory } from './PollHistory';
import config from '../config';
import { useTranslation } from 'react-i18next';

export function EventSettingsModal({ event, onClose, onUpdate, onDelete, isChatLocked, onToggleChatLock }) {
  const { t } = useTranslation();
  const [name, setName] = useState(event.name);
  const [description, setDescription] = useState(event.description);
  const [requiresApproval, setRequiresApproval] = useState(event.requiresApproval);
  const [cooldownEnabled, setCooldownEnabled] = useState(event.cooldownEnabled);
  const [cooldown, setCooldown] = useState(event.cooldown);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(event.imageUrl ? `${config.socketUrl}${event.imageUrl}` : null);
  const [clearImage, setClearImage] = useState(false);
  const [startTime, setStartTime] = useState(format(new Date(event.startTime), "yyyy-MM-dd'T'HH:mm"));
  const [endTime, setEndTime] = useState(format(new Date(event.endTime), "yyyy-MM-dd'T'HH:mm"));

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
        clearImage,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString()
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

      showSuccessToast(t('eventSettings.successSaving'));
      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.error('Error updating event:', error);
      showErrorToast(t('eventSettings.errorSaving'));
    }
  };

  const handleDeleteEvent = async () => {
    showConfirmToast(
      t('eventSettings.confirmDelete'),
      async () => {
        try {
          await api.delete(`/events/${event._id}`);
          showSuccessToast(t('eventSettings.successDeleting'));
          onDelete();
          onClose();
        } catch (error) {
          console.error('Error deleting event:', error);
          showErrorToast(t('eventSettings.errorDeleting'));
        }
      }
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 bg-background border-l border-border w-full max-w-md overflow-y-auto shadow-lg z-50">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">{t('eventSettings.title')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">{t('eventSettings.general')}</TabsTrigger>
            <TabsTrigger value="polls">{t('eventSettings.polls')}</TabsTrigger>
            <TabsTrigger value="history">{t('eventSettings.history')}</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm sm:text-base">{t('eventSettings.eventName')}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm sm:text-base">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime" className="text-sm sm:text-base">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="mt-1 bg-background text-foreground [color-scheme:dark]"
                  />
                </div>
                <div>
                  <Label htmlFor="endTime" className="text-sm sm:text-base">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="mt-1 bg-background text-foreground [color-scheme:dark]"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="image" className="text-sm sm:text-base">Event Image</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="image"
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="flex-grow"
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
                <Label htmlFor="requiresApproval" className="text-sm sm:text-base">Requires Approval</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cooldownEnabled"
                  checked={cooldownEnabled}
                  onCheckedChange={setCooldownEnabled}
                />
                <Label htmlFor="cooldownEnabled" className="text-sm sm:text-base">Enable message cooldown</Label>
              </div>
              {cooldownEnabled && (
                <div>
                  <Label htmlFor="cooldown" className="text-sm sm:text-base">Cooldown duration (seconds)</Label>
                  <Input
                    id="cooldown"
                    type="number"
                    value={cooldown}
                    onChange={(e) => setCooldown(Number(e.target.value))}
                    min="1"
                    required
                    className="mt-1"
                  />
                </div>
              )}
              <div>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleChatLock();
                  }}
                  variant={isChatLocked ? "destructive" : "primary"}
                  className="w-full flex items-center justify-center"
                >
                  {isChatLocked ? <Unlock className="mr-2" /> : <Lock className="mr-2" />}
                  {isChatLocked ? t('eventSettings.unlockChat') : t('eventSettings.lockChat')}
                </Button>
              </div>
              <Button type="submit" className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {t('eventSettings.saveChanges')}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="polls">
            <PollPresetManager eventId={event._id} onClose={onClose} />
          </TabsContent>
          <TabsContent value="history">
            <PollHistory eventId={event._id} />
          </TabsContent>
        </Tabs>
        <div className="mt-6 pt-4 border-t border-border">
          <Button onClick={handleDeleteEvent} variant="destructive" className="w-full">
            <Trash2 className="w-4 h-4 mr-2" />
            {t('eventSettings.deleteEvent')}
          </Button>
        </div>
      </div>
    </div>
  );
}