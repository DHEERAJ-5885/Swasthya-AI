const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  date: { type: Date, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FollowUp', followUpSchema);
