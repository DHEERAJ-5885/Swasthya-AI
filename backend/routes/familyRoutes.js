const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Screening = require('../models/Screening');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:familyId', authMiddleware, async (req, res) => {
  try {
    const { familyId } = req.params;
    const patients = await Patient.find({ familyId, worker: req.userId });
    
    // Fetch latest screening for each
    const membersWithData = await Promise.all(patients.map(async (p) => {
      const screening = await Screening.findOne({ patientId: p._id }).sort({ createdAt: -1 });
      return {
        ...p.toObject(),
        latestScreening: screening ? screening.result : null
      };
    }));

    // Generate quick AI insight for the family
    let insight = "Monitor family health regularly.";
    let riskLevel = "Low Risk";
    
    const highRiskCount = membersWithData.filter(m => m.latestScreening && m.latestScreening.riskLevel === 'High Risk').length;
    const mediumRiskCount = membersWithData.filter(m => m.latestScreening && m.latestScreening.riskLevel === 'Medium Risk').length;
    
    if (highRiskCount > 0) {
      riskLevel = "High Risk";
      insight = `${highRiskCount} family member(s) require immediate medical attention.`;
    } else if (mediumRiskCount > 0) {
      riskLevel = "Medium Risk";
      insight = `${mediumRiskCount} member(s) showing moderate risk. Ensure proper nutrition and rest.`;
    }

    res.json({ familyId, riskLevel, insight, members: membersWithData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch family data' });
  }
});

module.exports = router;
