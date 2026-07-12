const express = require('express');
const router = express.Router();
const { createEmergency, getPatientEmergencies, updateEmergencyStatus } = require('../controllers/emergencyController');

router.post('/', createEmergency);
router.get('/patient/:patientId', getPatientEmergencies);
router.put('/:id/status', updateEmergencyStatus);

module.exports = router;
