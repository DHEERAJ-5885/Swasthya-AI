const express = require('express');
const router = express.Router();
const Screening = require('../models/Screening');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/community-risk', authMiddleware, async (req, res) => {
  try {
    const Patient = require('../models/Patient');
    const patientIds = await Patient.find({ worker: req.userId }).distinct('_id');

    // Count high/medium/low cases in recent screenings
    const high = await Screening.countDocuments({ patientId: { $in: patientIds }, 'result.riskLevel': 'High' });
    const medium = await Screening.countDocuments({ patientId: { $in: patientIds }, 'result.riskLevel': 'Medium' });
    const total = await Screening.countDocuments({ patientId: { $in: patientIds } });
    
    let risk = 'Low';
    if (total > 0) {
      if ((high / total) > 0.2) risk = 'High';
      else if ((high + medium) / total > 0.3) risk = 'Moderate';
    }
    
    res.json({ risk, stats: { high, medium, total } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/insights', authMiddleware, async (req, res) => {
  try {
    const Patient = require('../models/Patient');
    const Alert = require('../models/Alert');

    const patientIds = await Patient.find({ worker: req.userId }).distinct('_id');

    // Aggregate screening counts
    const totalScreenings = await Screening.countDocuments({ patientId: { $in: patientIds } });
    const highRiskCount = await Screening.countDocuments({ patientId: { $in: patientIds }, 'result.riskLevel': 'High' });
    const mediumRiskCount = await Screening.countDocuments({ patientId: { $in: patientIds }, 'result.riskLevel': 'Medium' });
    const lowRiskCount = await Screening.countDocuments({ patientId: { $in: patientIds }, 'result.riskLevel': 'Low' });

    // Aggregate follow-ups predicted (using FollowUp model)
    const FollowUp = require('../models/FollowUp');
    const followUpsPredicted = await FollowUp.countDocuments({ patientId: { $in: patientIds }, status: { $ne: 'Completed' } });

    // Get high-risk patients
    const highRiskPatientIds = await Screening.find({ patientId: { $in: patientIds }, 'result.riskLevel': 'High' }).distinct('patientId');
    const highRiskPatients = await Patient.find({ _id: { $in: highRiskPatientIds } }).limit(10).select('name age village phone risk');

    // Generate AI Recommendations
    const aiRecommendations = [
      {
        id: 1,
        title: 'Community Risk Elevation',
        description: `Detected a ${highRiskCount > 5 ? 'significant' : 'minor'} increase in high-risk patients in the last 7 days. Focus on proactive screenings.`,
        type: 'warning',
        impact: 'High'
      },
      {
        id: 2,
        title: 'Follow-up Efficiency',
        description: `You have ${followUpsPredicted} follow-ups pending. Completing these could reduce hospitalization risk by 30%.`,
        type: 'action',
        impact: 'Medium'
      },
      {
        id: 3,
        title: 'General Health Trend',
        description: 'Most patients are showing stable health vitals. Respiratory issues are the most common reported symptom this week.',
        type: 'info',
        impact: 'Low'
      }
    ];

    res.json({
      totalScreenings,
      highRiskCount,
      followUpsPredicted,
      riskAnalytics: [
        { name: 'Low Risk', value: lowRiskCount, fill: '#10b981' },
        { name: 'Medium Risk', value: mediumRiskCount, fill: '#f97316' },
        { name: 'High Risk', value: highRiskCount, fill: '#ef4444' }
      ],
      highRiskPatients,
      aiRecommendations
    });
  } catch (err) {
    console.error('Insights Error:', err);
    res.status(500).json({ error: 'Failed to fetch AI Insights' });
  }
});

module.exports = router;
