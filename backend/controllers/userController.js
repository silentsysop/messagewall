// src/controllers/userController.js

const User = require('../models/User');

exports.getSavedEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedEvents',
      populate: {
        path: 'organizer',
        select: 'username'
      }
    });
    res.json(user.savedEvents);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.saveEvent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.savedEvents.includes(req.params.eventId)) {
      return res.status(400).json({ msg: 'Event already saved' });
    }
    user.savedEvents.push(req.params.eventId);
    await user.save();
    res.json(user.savedEvents);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.unsaveEvent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const index = user.savedEvents.indexOf(req.params.eventId);
    if (index > -1) {
      user.savedEvents.splice(index, 1);
      await user.save();
    }
    res.json(user.savedEvents);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};