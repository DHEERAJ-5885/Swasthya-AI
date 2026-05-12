const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'AshaWorker', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  type: { type: String, enum: ['high_risk', 'emergency', 'overdue_followup', 'risk_increase', 'new_alert'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  read: { type: Boolean, default: false },
  actionUrl: { type: String },
  data: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  readAt: { type: Date }
});

module.exports = mongoose.model('Notification', notificationSchema);
