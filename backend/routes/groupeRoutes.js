const express = require('express');
const router = express.Router();
const { getGroupes, createGroupe, deleteGroupe } = require('../controllers/groupeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getGroupes);
router.post('/', protect, createGroupe);
router.delete('/:id', protect, deleteGroupe);

module.exports = router;
