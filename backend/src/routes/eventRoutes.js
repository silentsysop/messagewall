const express = require('express');
const { createEvent, getEvents, getEvent, updateEvent, deleteEvent, getPastEvents } = require('../controllers/eventController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const upload = require('../middleware/upload');

const router = express.Router();

// Add this new route for past events BEFORE the /:id route
router.get('/past', getPastEvents);

router.post('/', [auth, checkRole('organizer'), upload.single('image')], createEvent);
router.get('/', getEvents);
router.get('/:id', getEvent);
router.put('/:id', [auth, checkRole('organizer')], updateEvent);
router.delete('/:id', [auth, checkRole('organizer')], deleteEvent);

module.exports = router;