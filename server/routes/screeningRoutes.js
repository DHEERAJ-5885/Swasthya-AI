const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createScreening, getScreenings } = require('../controllers/screeningController');

router.post('/', authMiddleware, createScreening);
router.get('/:patientId', authMiddleware, getScreenings);

module.exports = router;
