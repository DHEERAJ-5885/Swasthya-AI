const Screening = require('../models/Screening');
const Alert = require('../models/Alert');
const { analyzePatientData } = require('../services/aiEngine');

const createScreening = async (req, res) => {
  try {
    const { patientId, data } = req.body;
    
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

    // Auto-create Emergency Alert
    if (finalResult.riskLevel === 'High' || finalResult.trendDirection === 'Critical Drift') {
      const alert = new Alert({
        type: 'Emergency',
        title: 'Emergency Referral Required',
        message: `Patient needs immediate attention. ${finalResult.aiExplanation || finalResult.reason}`,
        patientId: patientId
      });
      await alert.save();
    }

    // Auto-create FollowUp for declining trends or high risk
    if (['Declining', 'Critical Drift'].includes(finalResult.trendDirection) || finalResult.riskLevel === 'High') {
      const FollowUp = require('../models/FollowUp');
      
      let followUpDays = 3; // default
      if (finalResult.trendDirection === 'Critical Drift' || finalResult.riskLevel === 'High') followUpDays = 1;
      
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + followUpDays);
      
      const followUp = new FollowUp({
        patientId,
        date: followUpDate,
        reason: finalResult.followUpRecommendation || 'Urgent AI Drift Detection Follow-up',
        status: 'Pending'
      });
      await followUp.save();
    }
    
    res.json({ success: true, result: finalResult, screeningId: screening._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Analysis failed' });
  }
};

const getScreenings = async (req, res) => {
  try {
    const screenings = await Screening.find({ patientId: req.params.patientId }).sort({ createdAt: 1 });
    res.json(screenings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch screenings' });
  }
};

module.exports = {
  createScreening,
  getScreenings
};
