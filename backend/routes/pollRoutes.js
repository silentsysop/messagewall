const express = require('express');
const { createPoll, getActivePoll, votePoll, endPoll, getUserVote } = require('../controllers/pollController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const optionalAuth = require('../middleware/optionalAuth');

const router = express.Router();

router.post('/:eventId', [auth, checkRole('organizer')], createPoll);
router.get('/:eventId', getActivePoll);
router.post('/:pollId/vote', optionalAuth, votePoll);
router.put('/:pollId/end', [auth, checkRole('organizer')], endPoll);
router.get('/:pollId/user-vote', optionalAuth, getUserVote);

module.exports = router;