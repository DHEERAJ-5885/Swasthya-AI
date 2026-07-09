const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createScreening, getScreenings, getAllScreenings } = require('../controllers/screeningController');

router.post('/', authMiddleware, createScreening);
router.get('/all', authMiddleware, getAllScreenings);
router.get('/:patientId', authMiddleware, getScreenings);

module.exports = router;
