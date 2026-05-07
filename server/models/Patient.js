const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  healthId: { type: String, unique: true }, // e.g. SWA-1234
  name: { type: String, required: true },
  phone: { type: String }, // For login/identification
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  village: { type: String, required: true },
  familyId: { type: String, required: true },
  occupation: { type: String },
  chronicConditions: { type: [String], default: [] },
  pregnancyStatus: { type: String, default: 'No' },
  disabilityStatus: { type: String, default: 'None' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema);
