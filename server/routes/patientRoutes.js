const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { createPatient, getPatients, getPatientById, updatePatient, deletePatient } = require('../controllers/patientController');

router.post('/', createPatient);
router.get('/', getPatients);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

// Family route logic is moved to familyRoutes but kept here if needed for backward compatibility. 
// The actual FamilyHealthPulse uses /api/family
router.get('/family/:id', async (req, res) => {
  try {
    const familyMembers = await Patient.find({ familyId: req.params.id });
    const riskInsight = familyMembers.length > 1 ? 'Multiple family members have recorded visits recently. Monitor for contagious symptoms.' : null;
    res.json({ familyMembers, riskInsight });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
