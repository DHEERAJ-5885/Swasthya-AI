const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
  createFollowUp, 
  updateFollowUp,
  deleteFollowUp,
  getFollowUps, 
  getAllCalendarFollowUps,
  markComplete, 
  getFollowUpsByPatient 
} = require('../controllers/followUpController');

router.post('/', authMiddleware, createFollowUp);
router.get('/', authMiddleware, getFollowUps);
router.get('/calendar', authMiddleware, getAllCalendarFollowUps);
router.put('/:id', authMiddleware, updateFollowUp);
router.delete('/:id', authMiddleware, deleteFollowUp);
router.put('/:id/complete', authMiddleware, markComplete);
router.get('/patient/:patientId', authMiddleware, getFollowUpsByPatient);

module.exports = router;
