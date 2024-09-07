const Event = require('../models/Event');
const Message = require('../models/Message'); // Lisää tämä rivi
const fs = require('fs').promises;
const path = require('path');

exports.createEvent = async (req, res) => {
  try {
    const { name, description, date, requiresApproval } = req.body;
    const newEvent = new Event({
      name,
      description,
      date,
      organizer: req.user.id,
      requiresApproval,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : ''
    });

    const savedEvent = await newEvent.save();
    
    // Populate the organizer information
    const populatedEvent = await Event.findById(savedEvent._id).populate('organizer', 'username');
    
    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};


exports.getEvents = async (req, res) => {
  try {
    const currentDate = new Date();
    const events = await Event.find({ date: { $gte: currentDate } })
      .sort({ date: 1 })
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
  const { requiresApproval } = req.body;
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    event.requiresApproval = requiresApproval;

    await event.save();
    res.json(event);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
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
    const pastEvents = await Event.find({ date: { $lt: currentDate } })
      .sort({ date: -1 })
      .populate('organizer', 'username');
    res.json(pastEvents);
  } catch (error) {
    console.error('Error fetching past events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};