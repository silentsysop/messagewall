const Event = require('../models/Event');
const Message = require('../models/Message'); // Lisää tämä rivi
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment');
const Poll = require('../models/Poll'); // Make sure to import the Poll model

exports.createEvent = async (req, res) => {
  try {
    const { name, description, startTime, endTime, requiresApproval, cooldownEnabled, cooldown } = req.body;
    const newEvent = new Event({
      name,
      description,
      startTime,
      endTime,
      organizer: req.user.id,
      requiresApproval: requiresApproval === 'true',
      cooldownEnabled: cooldownEnabled === 'true',
      cooldown: parseInt(cooldown, 10),
      imageUrl: req.file ? `/uploads/${req.file.filename}` : ''
    });

    const savedEvent = await newEvent.save();
    
    const populatedEvent = await Event.findById(savedEvent._id).populate('organizer', 'username');
    
    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const currentDate = new Date();
    const events = await Event.find({ endTime: { $gte: currentDate } })
      .sort({ startTime: 1 })
      .populate('organizer', 'username');
    res.json(events);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).send('Server error');
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'email');
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event not found' });
    }
    res.status(500).send('Server error');
  }
};

exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    if (req.user.role !== 'organizer') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Update fields
    if (req.body.name !== undefined) event.name = req.body.name;
    if (req.body.description !== undefined) event.description = req.body.description;
    if (req.body.requiresApproval !== undefined) {
      event.requiresApproval = req.body.requiresApproval;
      // Emit socket event for approval status change
      req.app.locals.io.to(event._id.toString()).emit('approval status changed', {
        eventId: event._id,
        requiresApproval: event.requiresApproval
      });
    }
    if (req.body.cooldownEnabled !== undefined) event.cooldownEnabled = req.body.cooldownEnabled;
    if (req.body.cooldown !== undefined) event.cooldown = req.body.cooldown;
    if (req.body.startTime !== undefined) event.startTime = new Date(req.body.startTime);
    if (req.body.endTime !== undefined) event.endTime = new Date(req.body.endTime);

    if (req.body.clearImage) {
      // Delete the old image file if it exists
      if (event.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', event.imageUrl);
        try {
          await fs.unlink(oldImagePath);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      event.imageUrl = '';
    }

    console.log('Updating event with data:', event); // Add this line for debugging

    await event.save();
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Change this condition
    if (req.user.role !== 'organizer') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Delete the event image if it exists
    if (event.imageUrl) {
      const imagePath = path.join(__dirname, '..', event.imageUrl);
      try {
        await fs.unlink(imagePath);
        console.log(`Deleted image: ${imagePath}`);
      } catch (err) {
        console.error(`Error deleting image: ${err.message}`);
        // Continue with event deletion even if image deletion fails
      }
    }

    // Delete all messages associated with the event
    await Message.deleteMany({ event: req.params.id });

    // Delete the event
    await Event.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Event and related messages removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event not found' });
    }
    res.status(500).send('Server error');
  }
};

exports.getPastEvents = async (req, res) => {
  try {
    const currentDate = new Date();
    const pastEvents = await Event.find({ endTime: { $lt: currentDate } })
      .sort({ endTime: -1 })
      .populate('organizer', 'username');
    res.json(pastEvents);
  } catch (error) {
    console.error('Error fetching past events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addPollPreset = async (req, res) => {
  try {
    const { question, options, duration } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Ensure options is an array of objects with text and votes properties
    const formattedOptions = options.map(option => ({
      text: option,
      votes: 0
    }));

    event.pollPresets.push({ question, options: formattedOptions, duration });
    await event.save();

    res.status(201).json(event.pollPresets[event.pollPresets.length - 1]);
  } catch (error) {
    console.error('Error adding poll preset:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

exports.getPollPresets = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event.pollPresets);
  } catch (error) {
    console.error('Error fetching poll presets:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updatePollPreset = async (req, res) => {
  try {
    const { question, options, duration } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const presetIndex = event.pollPresets.findIndex(preset => preset._id.toString() === req.params.presetId);

    if (presetIndex === -1) {
      return res.status(404).json({ error: 'Poll preset not found' });
    }

    // Ensure options is an array of objects with text and votes properties
    const formattedOptions = options.map(option => ({
      text: option,
      votes: 0
    }));

    event.pollPresets[presetIndex] = { 
      question, 
      options: formattedOptions, 
      duration 
    };

    await event.save();

    res.json(event.pollPresets[presetIndex]);
  } catch (error) {
    console.error('Error updating poll preset:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

exports.deletePollPreset = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    event.pollPresets = event.pollPresets.filter(preset => preset._id.toString() !== req.params.presetId);
    await event.save();

    res.json({ message: 'Poll preset deleted successfully' });
  } catch (error) {
    console.error('Error deleting poll preset:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deployPoll = async (req, res) => {
  try {
    const { question, options, duration } = req.body;
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const existingActivePoll = await Poll.findOne({ event: eventId, isActive: true });
    if (existingActivePoll) {
      return res.status(400).json({ error: 'There is already an active poll for this event' });
    }

    const endTime = new Date(Date.now() + duration * 1000);

    const newPoll = new Poll({
      event: eventId,
      question,
      options: options.map(option => ({ text: option, votes: 0 })),
      createdBy: req.user.id,
      duration,
      endTime
    });

    await newPoll.save();

    // Emit socket event to notify clients about the new poll
    req.app.locals.io.to(eventId).emit('new poll', newPoll);

    // Schedule poll ending
    setTimeout(() => endPoll(newPoll._id, req.app.locals.io), duration * 1000);

    res.status(201).json(newPoll);
  } catch (error) {
    console.error('Error deploying poll:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const endPoll = async (pollId, io) => {
  try {
    const poll = await Poll.findById(pollId);
    if (!poll || !poll.isActive) return;

    poll.isActive = false;
    await poll.save();

    // Emit socket event to notify clients that the poll has ended
    io.to(poll.event.toString()).emit('poll ended', poll);

    // Schedule poll deletion after 10 seconds
    setTimeout(() => deletePoll(pollId, io), 10000);
  } catch (error) {
    console.error('Error ending poll:', error);
  }
};

const deletePoll = async (pollId, io) => {
  try {
    const poll = await Poll.findByIdAndDelete(pollId);
    if (!poll) return;

    // Emit socket event to notify clients that the poll has been deleted
    io.to(poll.event.toString()).emit('poll deleted', pollId);
  } catch (error) {
    console.error('Error deleting poll:', error);
  }
};

exports.getActivePoll = async (req, res) => {
  try {
    const eventId = req.params.id;
    const activePoll = await Poll.findOne({ event: eventId, isActive: true });
    res.json({ activePoll });
  } catch (error) {
    console.error('Error fetching active poll:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPollHistory = async (req, res) => {
  try {
    const eventId = req.params.id;
    const polls = await Poll.find({ event: eventId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username');

    res.json(polls);
  } catch (error) {
    console.error('Error fetching poll history:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.clearPollHistory = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Delete all ended polls for this event
    const result = await Poll.deleteMany({ event: eventId, isActive: false });

    res.json({ message: `Deleted ${result.deletedCount} polls from history.` });
  } catch (error) {
    console.error('Error clearing poll history:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.toggleChatLock = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    event.isChatLocked = !event.isChatLocked;
    await event.save();

    // Emit socket event to notify clients about the chat lock status change
    req.app.locals.io.to(event._id.toString()).emit('chat lock changed', event.isChatLocked);

    res.json({ isChatLocked: event.isChatLocked });
  } catch (error) {
    console.error('Error toggling chat lock:', error);
    res.status(500).json({ error: 'Server error' });
  }
};