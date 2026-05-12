const Patient = require('../models/Patient');
const Screening = require('../models/Screening');
const FollowUp = require('../models/FollowUp');
const Alert = require('../models/Alert');

const getDashboardStats = async (req, res) => {
  try {
    const patientIds = await Patient.find({ worker: req.userId }).distinct('_id');
    const totalPatients = patientIds.length;
    
    // Calculate high risk patients from latest screenings
    const latestScreenings = await Screening.aggregate([
      { $match: { patientId: { $in: patientIds } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$patientId", latestScreening: { $first: "$$ROOT" } } }
    ]);
    
    const highRiskPatients = latestScreenings.filter(s =>
      ['High', 'Critical'].includes(s.latestScreening.result?.riskLevel)
    ).length;
    const decliningDriftPatients = latestScreenings.filter(s => 
      ['Declining', 'Critical Drift'].includes(s.latestScreening.result?.trendDirection) || 
      ['Declining', 'Critical Drift'].includes(s.latestScreening.result?.trend)
    ).length;
    
    // Follow ups due today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const followUpsToday = await FollowUp.countDocuments({
      patientId: { $in: patientIds },
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'Pending'
    });

    const pendingAlerts = await Alert.countDocuments({ read: false, patientId: { $in: patientIds } });

    // Calculate community risk pulse simply
    let communityRisk = 'Low';
    if (totalPatients > 0) {
      if (highRiskPatients / totalPatients > 0.2) communityRisk = 'High';
      else if (highRiskPatients / totalPatients > 0.05) communityRisk = 'Moderate';
    }

    res.json({
      totalPatients,
      highRiskPatients,
      decliningDriftPatients,
      followUpsToday,
      pendingAlerts,
      communityRisk
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

module.exports = {
  getDashboardStats
};
