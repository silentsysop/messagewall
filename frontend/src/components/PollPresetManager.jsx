import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, Minus, Edit, Trash2, Play } from 'lucide-react';
import api from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

export function PollPresetManager({ eventId, onClose }) {
  const [presets, setPresets] = useState([]);
  const [newPreset, setNewPreset] = useState({ question: '', options: ['', ''], duration: 60 });
  const [editingPresetId, setEditingPresetId] = useState(null);
  const [isActivePoll, setIsActivePoll] = useState(false);

  useEffect(() => {
    fetchPresets();
    checkActivePoll();
  }, [eventId]);

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

  const handleAddPreset = async () => {
    try {
      const response = await api.post(`/events/${eventId}/poll-presets`, {
        question: newPreset.question,
        options: newPreset.options.filter(option => option.trim() !== ''),
        duration: newPreset.duration
      });
      setPresets([...presets, response.data]);
      setNewPreset({ question: '', options: ['', ''], duration: 60 });
      showSuccessToast('Poll preset added successfully');
    } catch (error) {
      showErrorToast('Failed to add poll preset: ' + (error.response?.data?.details || error.message));
    }
  };

  const handleUpdatePreset = async (presetId) => {
    try {
      const presetToUpdate = presets.find(preset => preset._id === presetId);
      const response = await api.put(`/events/${eventId}/poll-presets/${presetId}`, {
        question: presetToUpdate.question,
        options: presetToUpdate.options.map(option => option.text).filter(option => option.trim() !== ''),
        duration: presetToUpdate.duration
      });
      setPresets(presets.map(preset => preset._id === presetId ? response.data : preset));
      setEditingPresetId(null);
      showSuccessToast('Poll preset updated successfully');
    } catch (error) {
      console.error('Error updating poll preset:', error);
      showErrorToast('Failed to update poll preset: ' + (error.response?.data?.details || error.message));
    }
  };

  const handleDeletePreset = async (presetId) => {
    try {
      await api.delete(`/events/${eventId}/poll-presets/${presetId}`);
      setPresets(presets.filter(preset => preset._id !== presetId));
      showSuccessToast('Poll preset deleted successfully');
    } catch (error) {
      showErrorToast('Failed to delete poll preset');
    }
  };

  const handleAddOption = (preset) => {
    if (preset.options.length < 5) {
      const updatedPreset = { ...preset, options: [...preset.options, { text: '', votes: 0 }] };
      setPresets(presets.map(p => p._id === preset._id ? updatedPreset : p));
    }
  };

  const handleRemoveOption = (preset, index) => {
    if (preset.options.length > 2) {
      const updatedOptions = preset.options.filter((_, i) => i !== index);
      const updatedPreset = { ...preset, options: updatedOptions };
      setPresets(presets.map(p => p._id === preset._id ? updatedPreset : p));
    }
  };

  const handleDeployPreset = async (preset) => {
    if (isActivePoll) {
      showErrorToast('There is already an active poll. Please wait for it to end before deploying a new one.');
      return;
    }

    try {
      const response = await api.post(`/events/${eventId}/deploy-poll`, {
        question: preset.question,
        options: preset.options.map(option => option.text),
        duration: preset.duration
      });
      showSuccessToast('Poll deployed successfully');
      setIsActivePoll(true);
      onClose(); // Close the event settings window
    } catch (error) {
      showErrorToast('Failed to deploy poll: ' + (error.response?.data?.details || error.message));
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Poll Presets</h2>
      {presets.map(preset => (
        <div key={preset._id} className="border p-4 rounded-md">
          {editingPresetId === preset._id ? (
            <>
              <Input
                value={preset.question}
                onChange={(e) => setPresets(presets.map(p => p._id === preset._id ? { ...p, question: e.target.value } : p))}
                className="mb-2"
              />
              {preset.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <Input
                    value={option.text}
                    onChange={(e) => {
                      const updatedOptions = [...preset.options];
                      updatedOptions[index] = { ...updatedOptions[index], text: e.target.value };
                      setPresets(presets.map(p => p._id === preset._id ? { ...p, options: updatedOptions } : p));
                    }}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveOption(preset, index)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => handleAddOption(preset)} className="mb-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
              <div className="flex items-center space-x-2">
                <Label htmlFor={`duration-${preset._id}`}>Duration (seconds)</Label>
                <Input
                  id={`duration-${preset._id}`}
                  type="number"
                  value={preset.duration}
                  onChange={(e) => setPresets(presets.map(p => p._id === preset._id ? { ...p, duration: Number(e.target.value) } : p))}
                  min="10"
                  max="300"
                />
              </div>
              <Button onClick={() => handleUpdatePreset(preset._id)} className="mt-2">Save</Button>
            </>
          ) : (
            <>
              <h3 className="font-semibold">{preset.question}</h3>
              <ul className="list-disc list-inside">
                {preset.options.map((option, index) => (
                  <li key={index}>{option.text}</li>
                ))}
              </ul>
              <p>Duration: {preset.duration} seconds</p>
              <div className="flex space-x-2 mt-2">
                <Button onClick={() => setEditingPresetId(preset._id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDeletePreset(preset._id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => handleDeployPreset(preset)}
                  disabled={isActivePoll}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Deploy
                </Button>
              </div>
            </>
          )}
        </div>
      ))}
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-2">Add New Preset</h3>
        <Input
          value={newPreset.question}
          onChange={(e) => setNewPreset({ ...newPreset, question: e.target.value })}
          placeholder="Question"
          className="mb-2"
        />
        {newPreset.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <Input
              value={option}
              onChange={(e) => {
                const updatedOptions = [...newPreset.options];
                updatedOptions[index] = e.target.value;
                setNewPreset({ ...newPreset, options: updatedOptions });
              }}
              placeholder={`Option ${index + 1}`}
            />
            {index > 1 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => setNewPreset({ ...newPreset, options: newPreset.options.filter((_, i) => i !== index) })}>
                <Minus className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {newPreset.options.length < 5 && (
          <Button type="button" variant="outline" onClick={() => setNewPreset({ ...newPreset, options: [...newPreset.options, ''] })} className="mb-2">
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        )}
        <div className="flex items-center space-x-2 mb-2">
          <Label htmlFor="new-preset-duration">Duration (seconds)</Label>
          <Input
            id="new-preset-duration"
            type="number"
            value={newPreset.duration}
            onChange={(e) => setNewPreset({ ...newPreset, duration: Number(e.target.value) })}
            min="10"
            max="300"
          />
        </div>
        <Button onClick={handleAddPreset}>Add Preset</Button>
      </div>
    </div>
  );
}