// backend/routes/roleRoutes.js

const express = require('express');
const { getOrganizers, assignCustomRole, removeCustomRole } = require('../controllers/roleController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

const router = express.Router();

router.get('/organizers', auth, checkRole('organizer'), getOrganizers);
router.post('/assign-custom-role', auth, checkRole('organizer'), assignCustomRole);
router.post('/remove-custom-role', auth, checkRole('organizer'), removeCustomRole);

module.exports = router;
