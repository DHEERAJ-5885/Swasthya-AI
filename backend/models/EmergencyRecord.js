const mongoose = require('mongoose');

const emergencyRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName: { type: String, required: true },
  healthId: { type: String },
  village: { type: String, required: true },
  emergencyType: { type: String, required: true },
  emergencyContactCalled: { type: String, required: true },
  emergencyNumber: { type: String, required: true },
  notes: { type: String },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'AshaWorker', required: true },
  status: { type: String, enum: ['Active', 'Under Observation', 'Hospital Referred', 'Resolved'], default: 'Active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

emergencyRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('EmergencyRecord', emergencyRecordSchema);
