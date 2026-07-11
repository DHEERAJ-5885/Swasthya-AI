const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName: { type: String },
  village: { type: String },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'AshaWorker', required: true },
  date: { type: Date, required: true },
  time: { type: String }, // optional time string
  priority: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  status: { type: String, enum: ['Pending', 'Completed', 'Missed'], default: 'Pending' },
  riskLevel: { type: String, default: 'Unknown' },
  reason: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

followUpSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FollowUp', followUpSchema);
