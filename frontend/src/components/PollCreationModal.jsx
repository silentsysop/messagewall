import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { X, Plus, Minus } from 'lucide-react';
import api from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

export function PollCreationModal({ isOpen, onClose, eventId, isOrganizer }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(60);

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
      showErrorToast('You do not have permission to create polls');
      return;
    }
    try {
      await api.post(`/polls/${eventId}`, { question, options, duration });
      showSuccessToast('Poll created successfully');
      onClose();
    } catch (error) {
      showErrorToast('Failed to create poll');
    }
  };

  if (!isOpen || !isOrganizer) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-8 max-w-md w-full shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Create Poll</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="question">Question</Label>
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
                placeholder={`Option ${index + 1}`}
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
              Add Option
            </Button>
          )}
          <div>
            <Label htmlFor="duration">Duration (seconds)</Label>
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
          <Button type="submit" className="w-full">Create Poll</Button>
        </form>
      </div>
    </div>
  );
}