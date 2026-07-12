const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'AshaWorker', required: true },
  screening: { type: mongoose.Schema.Types.ObjectId, ref: 'Screening' },
  severity: { type: String, enum: ['critical', 'severe', 'urgent'], required: true },
  reason: { type: String, required: true },
  symptoms: [String],
  vitals: mongoose.Schema.Types.Mixed,
  actionRequired: { type: String, required: true },
  escalated: { type: Boolean, default: false },
  escalatedTo: String,
  resolvedAt: Date,
  status: { type: String, enum: ['active', 'acknowledged', 'resolved'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);
