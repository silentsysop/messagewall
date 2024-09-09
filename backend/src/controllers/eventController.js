const Event = require('../models/Event');
const Message = require('../models/Message'); // Lisää tämä rivi
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment');

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
    
    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Only update fields that are provided in the request body
    if (req.body.name !== undefined) event.name = req.body.name;
    if (req.body.description !== undefined) event.description = req.body.description;
    if (req.body.requiresApproval !== undefined) event.requiresApproval = req.body.requiresApproval;
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

    if (event.organizer.toString() !== req.user.id) {
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