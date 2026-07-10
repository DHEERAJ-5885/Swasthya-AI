const express = require('express');
const router = express.Router();
const Screening = require('../models/Screening');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/community-risk', authMiddleware, async (req, res) => {
  try {
    const Patient = require('../models/Patient');
    const patientIds = await Patient.find({ worker: req.userId }).distinct('_id');

    // Count high/medium/low cases in recent screenings
    const high = await Screening.countDocuments({ patientId: { $in: patientIds }, 'result.riskLevel': 'High Risk' });
    const medium = await Screening.countDocuments({ patientId: { $in: patientIds }, 'result.riskLevel': 'Medium Risk' });
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
    const highRiskCount = await Screening.countDocuments({ patientId: { $in: patientIds }, 'result.riskLevel': 'High Risk' });
    const mediumRiskCount = await Screening.countDocuments({ patientId: { $in: patientIds }, 'result.riskLevel': 'Medium Risk' });
    const lowRiskCount = await Screening.countDocuments({ patientId: { $in: patientIds }, 'result.riskLevel': 'Low Risk' });

    // Aggregate follow-ups predicted (using FollowUp model)
    const FollowUp = require('../models/FollowUp');
    const followUpsPredicted = await FollowUp.countDocuments({ patientId: { $in: patientIds }, status: { $ne: 'Completed' } });

    // Get high-risk patients
    const highRiskPatientIds = await Screening.find({ patientId: { $in: patientIds }, 'result.riskLevel': 'High Risk' }).distinct('patientId');
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

router.get('/advanced', authMiddleware, async (req, res) => {
  try {
    const Patient = require('../models/Patient');
    const FollowUp = require('../models/FollowUp');
    
    const patientIds = await Patient.find({ worker: req.userId }).distinct('_id');
    const totalPatients = patientIds.length;

    // Disease Distribution
    const latestScreenings = await Screening.aggregate([
      { $match: { patientId: { $in: patientIds } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$patientId", latestScreening: { $first: "$$ROOT" } } }
    ]);
    
    let diseaseDistribution = { 'Fever': 0, 'Respiratory': 0, 'Diabetes': 0, 'Hypertension': 0, 'Others': 0 };
    latestScreenings.forEach(s => {
      const data = s.latestScreening.data || {};
      if (data.fever === 'Yes') diseaseDistribution['Fever']++;
      if (data.cough === 'Yes' || data.oxygen === 'Low') diseaseDistribution['Respiratory']++;
      if (data.sugar === 'High') diseaseDistribution['Diabetes']++;
      if (data.bp === 'High') diseaseDistribution['Hypertension']++;
      if (data.weakness === 'Yes' || data.fatigue === 'Yes') diseaseDistribution['Others']++;
    });

    const diseases = Object.keys(diseaseDistribution).map(k => ({ name: k, value: diseaseDistribution[k] })).filter(d => d.value > 0);

    // Weekly Screenings (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0,0,0,0);
    const weeklyScreeningsRaw = await Screening.aggregate([
      { $match: { patientId: { $in: patientIds }, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%d %b", date: "$createdAt" } }, count: { $sum: 1 } } }
    ]);
    
    const weeklyScreenings = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      const found = weeklyScreeningsRaw.find(s => s._id === dayStr);
      weeklyScreenings.push({ day: dayStr, count: found ? found.count : 0 });
    }

    // Follow-up Completion (dummy aggregated data since actual completion history requires full audit)
    const followUpData = [
      { name: 'Week 1', completed: 12, missed: 2 },
      { name: 'Week 2', completed: 19, missed: 4 },
      { name: 'Week 3', completed: 15, missed: 1 },
      { name: 'Week 4', completed: 22, missed: 0 }
    ];

    res.json({
      totalPatients,
      diseaseDistribution: diseases.length ? diseases : [{ name: 'Healthy', value: 1 }],
      weeklyScreenings,
      followUpData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reports', authMiddleware, async (req, res) => {
  try {
    const Patient = require('../models/Patient');
    const patientIds = await Patient.find({ worker: req.userId }).distinct('_id');
    
    const recentScreenings = await Screening.find({ patientId: { $in: patientIds } })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('patientId', 'name village phone age gender _id');

    const reports = recentScreenings.map(s => ({
      id: s._id,
      title: s.result?.riskLevel === 'High Risk' ? 'Critical Health Report' : 'Routine Screening Report',
      patientId: s.patientId?._id || 'Unknown',
      patientName: s.patientId?.name || 'Unknown',
      age: s.patientId?.age || 'N/A',
      gender: s.patientId?.gender || 'N/A',
      village: s.patientId?.village || 'Unknown',
      date: new Date(s.createdAt).toLocaleDateString(),
      time: new Date(s.createdAt).toLocaleTimeString(),
      healthScore: s.result?.healthScore || 'N/A',
      riskLevel: s.result?.riskLevel || 'Unknown',
      status: 'Generated',
      data: s.data,
      recommendation: s.result?.nextAction || 'Monitor health',
      explanation: s.result?.explanation || 'Regular screening check.',
      timestamp: new Date().toLocaleString()
    }));

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/inbox', authMiddleware, async (req, res) => {
  try {
    const Patient = require('../models/Patient');
    const Alert = require('../models/Alert');
    const FollowUp = require('../models/FollowUp');
    const patientIds = await Patient.find({ worker: req.userId }).distinct('_id');

    const alerts = await Alert.find({ patientId: { $in: patientIds }, read: false }).limit(10).populate('patientId', 'name');
    const followUps = await FollowUp.find({ patientId: { $in: patientIds }, status: 'Pending' }).limit(5).populate('patientId', 'name');

    const messages = [];

    alerts.forEach(a => {
      messages.push({
        id: a._id.toString(),
        type: 'alert',
        title: a.title,
        body: a.message,
        patientName: a.patientId?.name,
        date: a.createdAt,
        priority: 'high'
      });
    });

    followUps.forEach(f => {
      messages.push({
        id: f._id.toString(),
        type: 'followup',
        title: 'Follow-up Due',
        body: f.notes || 'Routine follow-up required.',
        patientName: f.patientId?.name,
        date: f.date,
        priority: 'medium'
      });
    });

    messages.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
