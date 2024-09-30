const express = require('express');
const { createMessage, getMessages, approveMessage, deleteMessage, getPendingMessages, reactToMessage } = require('../controllers/messageController');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const { reactRateLimiter } = require('../middleware/rateLimiter'); // Import the rate limiter

const router = express.Router();

router.get('/pending', auth, getPendingMessages);
router.post('/', optionalAuth, createMessage);
router.get('/:eventId', getMessages);
router.put('/approve/:id', auth, approveMessage);
router.delete('/:id', auth, deleteMessage);
router.post('/:id/react', optionalAuth, reactRateLimiter, reactToMessage); // Apply rate limiter here

module.exports = router;