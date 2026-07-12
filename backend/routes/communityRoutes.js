const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Screening = require('../models/Screening');

router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find({ worker: req.userId }).select('_id village').lean();
    const patientMap = new Map(patients.map((p) => [String(p._id), p]));
    const patientIds = patients.map((p) => p._id);

    if (!patientIds.length) {
      return res.json({ villages: [], clusters: { fever: 0, weakness: 0, stress: 0, highBp: 0 } });
    }

    const screenings = await Screening.find({ patientId: { $in: patientIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Aggregate data for community risk pulse
    const villageData = {};
    const diseaseClusters = { fever: 0, weakness: 0, stress: 0, highBp: 0 };
    const latestByPatient = new Map();
    
    // Group by village
    screenings.forEach((s) => {
      const patientKey = String(s.patientId);
      if (!latestByPatient.has(patientKey)) {
        latestByPatient.set(patientKey, s);
      }
    });

    latestByPatient.forEach((s, patientKey) => {
      const village = patientMap.get(patientKey)?.village || 'Unknown';

      if (!villageData[village]) {
        villageData[village] = { total: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0 };
      }

      villageData[village].total++;

      const riskLevel = s.result?.riskLevel || 'Low Risk';
      if (riskLevel === 'High Risk') villageData[village].highRisk++;
      else if (riskLevel === 'Medium Risk') villageData[village].mediumRisk++;
      else villageData[village].lowRisk++;

      const fever = String(s.data?.fever || '').toLowerCase();
      const weakness = String(s.data?.weakness || '').toLowerCase();
      const stress = String(s.data?.stress || '').toLowerCase();
      const bp = String(s.data?.bp || '').toLowerCase();

      if (['mild', 'high', 'hot'].includes(fever)) diseaseClusters.fever++;
      if (['some', 'severe', 'yes'].includes(weakness)) diseaseClusters.weakness++;
      if (['high', 'often'].includes(stress)) diseaseClusters.stress++;
      if (bp === 'high') diseaseClusters.highBp++;
    });

    const villagesList = Object.keys(villageData).map(name => ({
      name,
      ...villageData[name],
      riskScore: Math.round(((villageData[name].highRisk * 2 + villageData[name].mediumRisk) / (villageData[name].total * 2)) * 100) || 0
    })).sort((a, b) => b.riskScore - a.riskScore);

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
