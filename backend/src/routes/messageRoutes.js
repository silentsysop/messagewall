const express = require('express');
const { createMessage, getMessages, approveMessage, deleteMessage, getPendingMessages } = require('../controllers/messageController');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

const router = express.Router();

router.get('/pending', auth, getPendingMessages);
router.post('/', optionalAuth, createMessage);
router.get('/:eventId', getMessages);
router.put('/approve/:id', auth, approveMessage);
router.delete('/:id', auth, deleteMessage);

module.exports = router;