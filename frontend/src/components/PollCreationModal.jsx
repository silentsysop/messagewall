import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { X, Plus, Minus } from 'lucide-react';
import api from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { useTranslation } from 'react-i18next';

export function PollCreationModal({ isOpen, onClose, eventId, isOrganizer }) {
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(60);
  const [presets, setPresets] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [isActivePoll, setIsActivePoll] = useState(false);

  useEffect(() => {
    if (isOpen && isOrganizer) {
      fetchPresets();
      checkActivePoll();
    }
  }, [isOpen, isOrganizer, eventId]);

  const fetchPresets = async () => {
    try {
      const response = await api.get(`/events/${eventId}/poll-presets`);
      setPresets(response.data);
    } catch (error) {
      showErrorToast('Failed to fetch poll presets');
    }
  };

  const checkActivePoll = async () => {
    try {
      const response = await api.get(`/events/${eventId}/active-poll`);
      setIsActivePoll(!!response.data.activePoll);
    } catch (error) {
      console.error('Error checking active poll:', error);
    }
  };

  const handlePresetChange = (presetId) => {
    setSelectedPresetId(presetId);
    if (presetId !== 'none') {
      const selectedPreset = presets.find(preset => preset._id === presetId);
      setQuestion(selectedPreset.question);
      setOptions(selectedPreset.options.map(option => option.text));
      setDuration(selectedPreset.duration);
    } else {
      setQuestion('');
      setOptions(['', '']);
      setDuration(60);
    }
  };

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOrganizer) {
      showErrorToast(t('pollCreation.errorCreating'));
      return;
    }
    if (isActivePoll) {
      showErrorToast(t('pollCreation.pollInProgress'));
      return;
    }
    try {
      await api.post(`/polls/${eventId}`, { question, options, duration });
      showSuccessToast(t('pollCreation.successCreating'));
      onClose();
    } catch (error) {
      showErrorToast(t('pollCreation.errorCreating'));
    }
  };

  if (!isOpen || !isOrganizer) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-8 max-w-md w-full shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">{t('pollCreation.createPoll')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="preset">{t('pollCreation.usePreset')}</Label>
            <Select onValueChange={handlePresetChange} value={selectedPresetId}>
              <SelectTrigger>
                <SelectValue placeholder={t('pollCreation.selectPreset')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('pollCreation.none')}</SelectItem>
                {presets.map(preset => (
                  <SelectItem key={preset._id} value={preset._id}>{preset.question}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="question">{t('pollCreation.question')}</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`${t('pollCreation.option')} ${index + 1}`}
                required
              />
              {index > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveOption(index)}>
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {options.length < 5 && (
            <Button type="button" variant="outline" onClick={handleAddOption}>
              <Plus className="h-4 w-4 mr-2" />
              {t('pollCreation.addOption')}
            </Button>
          )}
          <div>
            <Label htmlFor="duration">{t('pollCreation.duration')}</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="10"
              max="300"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isActivePoll}>
            {isActivePoll ? t('pollCreation.pollInProgress') : t('pollCreation.create')}
          </Button>
        </form>
      </div>
    </div>
  );
}