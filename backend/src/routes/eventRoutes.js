const express = require('express');
const { createEvent, getEvents, getEvent, updateEvent, deleteEvent, getPastEvents } = require('../controllers/eventController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs').promises;
const Event = require('../models/Event'); // Add this line

const router = express.Router();

// Add this new route for past events BEFORE the /:id route
router.get('/past', getPastEvents);

router.post('/', [auth, checkRole('organizer'), upload.single('image')], createEvent);
router.get('/', getEvents);
router.get('/:id', getEvent);
router.put('/:id', [auth, checkRole('organizer')], updateEvent);
router.delete('/:id', [auth, checkRole('organizer')], deleteEvent);

// Add this new route for updating the event image
router.put('/:id/image', [auth, checkRole('organizer'), upload.single('image')], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    if (req.file) {
      // Delete old image if it exists
      if (event.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', event.imageUrl);
        try {
          await fs.unlink(oldImagePath);
        } catch (error) {
          console.error('Error deleting old image:', error);
          // Continue even if old image deletion fails
        }
      }

      event.imageUrl = `/uploads/${req.file.filename}`;
      await event.save();
    }

    res.json(event);
  } catch (error) {
    console.error('Error updating event image:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;