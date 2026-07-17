const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Screening = require('../models/Screening');

// GET /api/public/patient/:id
router.get('/patient/:id', async (req, res) => {
  try {
    // Check if it's a valid MongoDB ObjectId
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ error: 'Patient not found or not yet synchronized' });
    }

    const patient = await Patient.findById(req.params.id).populate('worker', 'name');
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Fetch the single most recent screening
    const screenings = await Screening.find({ patientId: patient._id })
      .sort({ createdAt: -1 })
      .limit(1);
      
    const latestScreening = screenings[0] || null;

    let healthScore = null;
    let riskLevel = 'Unknown';
    let isVerified = false;

    if (latestScreening && latestScreening.result) {
      healthScore = Math.max(0, Math.min(100, Math.round(100 - (latestScreening.result.confidence || 0))));
      riskLevel = latestScreening.result.riskLevel || 'Unknown';
    }

    if (latestScreening && latestScreening.verification && latestScreening.verification.status === 'VERIFIED') {
      isVerified = true;
    }

    res.json({
      _id: patient._id,
      name: patient.name,
      age: patient.age,
      village: patient.village,
      familyId: patient.familyId,
      workerName: patient.worker ? patient.worker.name : 'Unknown',
      healthScore,
      riskLevel,
      isVerified
    });
  } catch (err) {
    console.error('Error fetching public patient data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
