const Patient = require('../models/Patient');
const Screening = require('../models/Screening');
const FollowUp = require('../models/FollowUp');
const Alert = require('../models/Alert');

const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    
    // Calculate high risk patients from latest screenings
    const latestScreenings = await Screening.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$patientId", latestScreening: { $first: "$$ROOT" } } }
    ]);
    
    const highRiskPatients = latestScreenings.filter(s => s.latestScreening.result?.riskLevel === 'High').length;
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
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'Pending'
    });

    const pendingAlerts = await Alert.countDocuments({ read: false });

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
