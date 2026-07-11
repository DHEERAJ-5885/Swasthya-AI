const Screening = require('../models/Screening');
const Alert = require('../models/Alert');
const Patient = require('../models/Patient');
const { analyzePatientData } = require('../services/aiEngine');
const { createNotification } = require('./notificationController');

const createScreening = async (req, res) => {
  try {
    const { patientId, data } = req.body;
    const workerId = req.userId; // Use authenticated worker ID, not from body

    const patient = await Patient.findOne({ _id: patientId, worker: workerId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Fetch previous screening BEFORE analysis to send historical data to AI
    const previousScreening = await Screening.findOne({ patientId }).sort({ createdAt: -1 });
    
    // Pass both current and previous data to the new AI engine
    const aiResult = await analyzePatientData(data, previousScreening ? previousScreening.data : null);
    
    // Format final result using AI response directly
    let finalResult = { 
      ...aiResult,
      previousData: previousScreening ? previousScreening.data : null,
      currentData: data
    };
    
    // Backwards compatibility mappings
    finalResult.trend = aiResult.trendDirection || 'No Data';
    finalResult.explanation = aiResult.aiExplanation || finalResult.explanation;
    finalResult.drift = aiResult.previousComparison || [];
    
    const screening = new Screening({
      patientId,
      data,
      result: finalResult
    });
    
    await screening.save();

    // 1. Create Patient Alert if High Risk or Critical Drift
    if (['High Risk'].includes(finalResult.riskLevel) || finalResult.trendDirection === 'Critical Drift') {
      const alert = new Alert({
        type: 'Emergency',
        title: 'Emergency Referral Required',
        message: `Patient needs immediate attention. ${finalResult.aiExplanation || finalResult.reason}`,
        patientId: patientId
      });
      await alert.save();
      
      // Create notification for worker
      if (workerId) {
        await createNotification(
          workerId,
          patientId,
          'emergency',
          'Emergency Alert',
          `High-risk patient detected. ${finalResult.aiExplanation || finalResult.reason}`,
          'critical'
        );
      }
    }

    // 2. Schedule Follow-up if Declining, Critical, or High Risk
    if (['Declining', 'Critical Drift'].includes(finalResult.trendDirection) || ['High Risk'].includes(finalResult.riskLevel)) {
      const FollowUp = require('../models/FollowUp');
      
      let followUpDays = 7;
      if (finalResult.trendDirection === 'Declining') followUpDays = 3;
      if (finalResult.trendDirection === 'Critical Drift' || ['High Risk'].includes(finalResult.riskLevel)) followUpDays = 1;
      
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + followUpDays);
      
      const followUp = new FollowUp({
        patientId,
        patientName: patient.name,
        village: patient.village,
        workerId: workerId,
        date: followUpDate,
        time: "09:00",
        notes: finalResult.followUpRecommendation || 'Urgent AI Drift Detection Follow-up',
        reason: 'Automated screening follow-up due to high risk/critical drift',
        priority: ['High Risk'].includes(finalResult.riskLevel) ? 'High' : 'Medium',
        riskLevel: finalResult.riskLevel,
        status: 'Pending'
      });
      await followUp.save();
      
      // Create notification for follow-up needed
      if (workerId) {
        await createNotification(
          workerId,
          patientId,
          'high_risk',
          'Follow-up Required',
          `Patient requires follow-up in ${followUpDays} day(s). Risk level: ${finalResult.riskLevel}`,
          'high'
        );
      }
    }
    
    res.json({ success: true, result: finalResult, screeningId: screening._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Analysis failed' });
  }
};

const getScreenings = async (req, res) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.patientId, worker: req.userId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const screenings = await Screening.find({ patientId: req.params.patientId }).sort({ createdAt: 1 });
    res.json(screenings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch screenings' });
  }
};

const getAllScreenings = async (req, res) => {
  try {
    const patientIds = await Patient.find({ worker: req.userId }).distinct('_id');
    const screenings = await Screening.find({ patientId: { $in: patientIds } })
      .sort({ createdAt: -1 })
      .populate('patientId', 'name healthId village');
    res.json(screenings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch screenings' });
  }
};

module.exports = {
  createScreening,
  getScreenings,
  getAllScreenings
};
