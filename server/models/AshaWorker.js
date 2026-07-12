const mongoose = require('mongoose');

const ashaWorkerSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, match: /^\d{10}$/ },
  password: { type: String, required: true }, // hashed
  email: { type: String },
  googleId: { type: String },
  village: { type: String, required: true },
  assignedPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }],
  profilePhoto: { type: String },
  language: { type: String, default: 'English', enum: ['English', 'Hindi', 'Telugu'] },
  gender: { type: String, enum: ['Female', 'Male', 'Other', ''] },
  dob: { type: Date },
  address: { type: String },
  assignedPHC: { type: String },
  notifications: {
    emergencyAlerts: { type: Boolean, default: true },
    followUpReminders: { type: Boolean, default: true },
    communityNotifications: { type: Boolean, default: true }
  },
  stats: {
    totalPatients: { type: Number, default: 0 },
    highRiskPatients: { type: Number, default: 0 },
    followUpCompletionRate: { type: Number, default: 0 },
    screensThisMonth: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

module.exports = mongoose.model('AshaWorker', ashaWorkerSchema);
