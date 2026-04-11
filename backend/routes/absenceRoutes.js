const express = require('express');
const router = express.Router();
const { recordAbsence, getMyAbsences } = require('../controllers/absenceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Record absence - Teacher or Admin only
router.post('/', protect, authorize('teacher', 'admin'), recordAbsence);

// Get personal absences - Student only
router.get('/me', protect, getMyAbsences);

module.exports = router;
