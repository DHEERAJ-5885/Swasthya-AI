const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: { type: String, enum: ['Outbreak', 'Emergency', 'Missed', 'Insight'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  village: { type: String }, // For community alerts
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }, // For patient specific alerts
  familyId: { type: String }, // For family alerts
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);
