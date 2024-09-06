const express = require('express');
const { createEvent, getEvents, getEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

const router = express.Router();

router.post('/', [auth, checkRole('organizer')], createEvent);
router.get('/', getEvents);
router.get('/:id', getEvent);
router.put('/:id', [auth, checkRole('organizer')], updateEvent);
router.delete('/:id', [auth, checkRole('organizer')], deleteEvent);

module.exports = router;