const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { createPatient, getPatients, getPatientById, updatePatient, deletePatient, addObservation, assignExistingPatients } = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createPatient);
router.post('/assign-existing', authMiddleware, assignExistingPatients);
router.get('/', authMiddleware, getPatients);
router.get('/:id', authMiddleware, getPatientById);
router.post('/:id/observations', authMiddleware, addObservation);
router.put('/:id', authMiddleware, updatePatient);
router.delete('/:id', authMiddleware, deletePatient);

// Family route logic is moved to familyRoutes but kept here if needed for backward compatibility. 
// The actual FamilyHealthPulse uses /api/family
router.get('/family/:id', authMiddleware, async (req, res) => {
  try {
    const familyMembers = await Patient.find({ familyId: req.params.id, worker: req.userId });
    const riskInsight = familyMembers.length > 1 ? 'Multiple family members have recorded visits recently. Monitor for contagious symptoms.' : null;
    res.json({ familyMembers, riskInsight });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
