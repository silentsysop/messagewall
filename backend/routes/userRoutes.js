const express = require('express');
const router = express.Router();
const { getSavedEvents, saveEvent, unsaveEvent, getMutePreference, updateMutePreference } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/saved-events', auth, getSavedEvents);
router.post('/saved-events/:eventId', auth, saveEvent);
router.delete('/saved-events/:eventId', auth, unsaveEvent);
router.get('/mute-preference', auth, getMutePreference);
router.put('/mute-preference', auth, updateMutePreference);

module.exports = router;
