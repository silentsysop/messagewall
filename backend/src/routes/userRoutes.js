const express = require('express');
const router = express.Router();
const { getSavedEvents, saveEvent, unsaveEvent } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/saved-events', auth, getSavedEvents);
router.post('/saved-events/:eventId', auth, saveEvent);
router.delete('/saved-events/:eventId', auth, unsaveEvent);

module.exports = router;