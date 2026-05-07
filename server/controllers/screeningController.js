const Screening = require('../models/Screening');
const Alert = require('../models/Alert');
const { analyzePatientData } = require('../services/aiEngine');

function calculateDrift(current, previous) {
  const drift = [];
  let negative_changes = 0;
  let positive_changes = 0;

  const compareField = (field, levels, label) => {
    const currVal = levels[current[field]?.toLowerCase()] || 0;
    const prevVal = levels[previous[field]?.toLowerCase()] || 0;
    if (currVal > 0 && prevVal > 0 && currVal !== prevVal) {
      if (currVal > prevVal) {
        drift.push(`${label} worsened (${previous[field]} → ${current[field]})`);
        negative_changes++;
      } else {
        drift.push(`${label} improved (${previous[field]} → ${current[field]})`);
        positive_changes++;
      }
    }
  };

  const severityLevels = { 'none': 1, 'low': 2, 'mild': 2, 'medium': 3, 'some': 3, 'high': 4, 'severe': 5, 'poor': 4 };
  const invertedLevels = { 'high': 1, 'good': 1, 'normal': 2, 'medium': 3, 'average': 3, 'low': 4, 'poor': 5 };

  compareField('stress', severityLevels, 'Stress');
  compareField('anxiety', severityLevels, 'Anxiety');
  compareField('weakness', severityLevels, 'Weakness');
  compareField('workFatigue', severityLevels, 'Work Fatigue');
  
  compareField('sleep', invertedLevels, 'Sleep');
  compareField('appetite', invertedLevels, 'Appetite');
  compareField('energy', invertedLevels, 'Energy');

  const badStates = {
    fever: ['yes', 'mild', 'high'],
    fatigue: ['yes', 'some', 'severe'],
    swelling: ['yes', 'some', 'severe'],
    cough: ['yes', 'some', 'severe']
  };

  for (const [field, badValues] of Object.entries(badStates)) {
    const currVal = current[field]?.toLowerCase();
    const prevVal = previous[field]?.toLowerCase();
    
    if (currVal && prevVal && currVal !== prevVal) {
      const currIsBad = badValues.includes(currVal);
      const prevIsBad = badValues.includes(prevVal);
      
      if (currIsBad && !prevIsBad) {
        drift.push(`${field.charAt(0).toUpperCase() + field.slice(1)} appeared`);
        negative_changes++;
      } else if (!currIsBad && prevIsBad) {
        drift.push(`${field.charAt(0).toUpperCase() + field.slice(1)} resolved`);
        positive_changes++;
      }
    }
  }

  let trend = 'Stable';
  if (negative_changes >= 3) {
    trend = 'Critical Drift';
  } else if (negative_changes > positive_changes) {
    trend = 'Declining';
  } else if (positive_changes > negative_changes) {
    trend = 'Improving';
  }

  let explanation = '';
  if (trend === 'Critical Drift') {
    explanation = 'CRITICAL: Patient shows rapid health deterioration across multiple vital and lifestyle markers.';
  } else if (trend === 'Declining') {
    explanation = 'Health trend indicates a gradual decline due to negative changes in lifestyle and symptoms.';
  } else if (trend === 'Improving') {
    explanation = 'Health trend is improving with positive shifts in symptoms and lifestyle markers.';
  } else {
    explanation = 'Health trend is stable, though continued monitoring of symptoms is recommended.';
  }

  return { drift, trend, explanation };
}

const createScreening = async (req, res) => {
  try {
    const { patientId, data } = req.body;
    
    const aiResult = await analyzePatientData(data);
    
    const previousScreening = await Screening.findOne({ patientId }).sort({ createdAt: -1 });

    let finalResult = { ...aiResult };
    
    if (!previousScreening) {
      finalResult.drift = [];
      finalResult.trend = "No Data";
      finalResult.explanation = "No previous data available. This is the first screening.";
      finalResult.previousData = null;
      finalResult.currentData = data;
    } else {
      const { drift, trend, explanation } = calculateDrift(data, previousScreening.data);
      finalResult.drift = drift;
      finalResult.trend = trend;
      finalResult.explanation = explanation;
      finalResult.previousData = previousScreening.data;
      finalResult.currentData = data;
    }
    
    const screening = new Screening({
      patientId,
      data,
      result: finalResult
    });
    
    await screening.save();

    if (finalResult.riskLevel === 'High' || finalResult.trend === 'Critical Drift') {
      const alert = new Alert({
        type: 'Emergency',
        title: 'Emergency Referral Required',
        message: `Patient needs immediate attention. ${finalResult.explanation || finalResult.reason}`,
        patientId: patientId
      });
      await alert.save();
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
