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
    trend: { type: String },
    explanation: String,
    driftScore: Number,
    driftStatus: { type: String },
    trendDirection: { type: String },
    previousComparison: [String],
    aiExplanation: String,
    followUpRecommendation: String,
    previousData: Object,
    currentData: Object
  },
  verification: {
    version: {
      type: String,
      default: "1.0"
    },
    status: {
      type: String,
      enum: [
        "READY_FOR_BLOCKCHAIN",
        "PENDING",
        "VERIFIED",
        "FAILED"
      ],
      default: "READY_FOR_BLOCKCHAIN"
    },
    recordHash: {
      type: String
    },
    payloadVersion: {
      type: String,
      default: "1.0"
    },
    generatedAt: {
      type: Date
    },
    anchoredAt: {
      type: Date,
      default: null
    },
    txHash: {
      type: String,
      default: null
    },
    blockchainNetwork: {
      type: String,
      default: "Preprod"
    },
    verificationPayload: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Screening', screeningSchema);
