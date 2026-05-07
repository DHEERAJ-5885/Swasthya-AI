const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Screening = require('../models/Screening');

router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find();
    const screenings = await Screening.find().populate('patientId', 'village');

    // Aggregate data for community risk pulse
    const villageData = {};
    const diseaseClusters = { fever: 0, weakness: 0, stress: 0, highBp: 0 };
    
    // Group by village
    screenings.forEach(s => {
      const village = s.patientId?.village || 'Unknown';
      if (!villageData[village]) {
        villageData[village] = { total: 0, highRisk: 0, mediumRisk: 0 };
      }
      villageData[village].total++;
      if (s.result?.riskLevel === 'High') villageData[village].highRisk++;
      if (s.result?.riskLevel === 'Medium') villageData[village].mediumRisk++;

      // Clusters
      if (s.data?.fever && ['mild', 'high'].includes(s.data.fever.toLowerCase())) diseaseClusters.fever++;
      if (s.data?.weakness && ['some', 'severe'].includes(s.data.weakness.toLowerCase())) diseaseClusters.weakness++;
      if (s.data?.stress && s.data.stress.toLowerCase() === 'high') diseaseClusters.stress++;
      if (s.data?.bp && s.data.bp.toLowerCase() === 'high') diseaseClusters.highBp++;
    });

    const villagesList = Object.keys(villageData).map(name => ({
      name,
      ...villageData[name],
      riskScore: Math.round(((villageData[name].highRisk * 2 + villageData[name].mediumRisk) / (villageData[name].total * 2)) * 100) || 0
    }));

    res.json({
      villages: villagesList,
      clusters: diseaseClusters
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch community data' });
  }
});

module.exports = router;
