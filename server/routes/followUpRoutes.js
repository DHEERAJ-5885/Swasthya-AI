const express = require('express');
const router = express.Router();
const { createFollowUp, getFollowUps, markComplete, getFollowUpsByPatient } = require('../controllers/followUpController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createFollowUp);
router.get('/', authMiddleware, getFollowUps);
router.get('/patient/:patientId', authMiddleware, getFollowUpsByPatient);
router.put('/:id/complete', authMiddleware, markComplete);

module.exports = router;
