const mongoose = require('mongoose');

const screeningSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  data: {
    // Step 1: Basic
    fever: String,
    bp: String,
    sugar: String,
    pulse: String,
    oxygen: String,
    temperature: String,
    
    // Step 2: Lifestyle
    sleep: String,
    appetite: String,
    energy: String,
    stress: String,
    waterIntake: String,
    workFatigue: String,

    // Step 3: Mental
    sadness: String,
    anxiety: String,
    loneliness: String,
    emotionalStress: String,
    overthinking: String,

    // Step 4: Observation
    swelling: String,
    paleSkin: String,
    fatigue: String,
    cough: String,
    weakness: String,
    visibleDiscomfort: String,

    // Step 5: Voice Notes
    voiceNotes: String,
    extractedSymptoms: [String]
  },
  result: {
    riskLevel: { type: String, enum: ['Low Risk', 'Medium Risk', 'High Risk'] },
    riskScore: Number,
    confidence: Number,
    reason: String,
    nextAction: String,
    drift: [String],
    trend: { type: String, enum: ['Improving', 'Stable', 'Declining', 'Critical Drift', 'No Data'] },
    explanation: String,
    driftScore: Number,
    driftStatus: { type: String, enum: ['Stable', 'Improving', 'Declining', 'Critical Drift', 'No Data'] },
    trendDirection: { type: String, enum: ['Improving', 'Stable', 'Declining', 'Critical Drift', 'No Data', 'N/A'] },
    previousComparison: [String],
    aiExplanation: String,
    followUpRecommendation: String,
    previousData: Object,
    currentData: Object
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Screening', screeningSchema);
