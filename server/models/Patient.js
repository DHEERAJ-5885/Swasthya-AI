const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'AshaWorker', required: true },
  healthId: { type: String, unique: true }, // e.g. SWA-1234
  name: { type: String, required: true },
  phone: { type: String }, // For login/identification
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  village: { type: String, required: true },
  familyId: { type: String, required: true },
  occupation: { type: String },
  photoUrl: { type: String },
  chronicConditions: { type: [String], default: [] },
  pregnancyStatus: { type: String, default: 'No' },
  disabilityStatus: { type: String, default: 'None' },
  observations: [
    {
      note: { type: String, required: true },
      worker: { type: mongoose.Schema.Types.ObjectId, ref: 'AshaWorker', required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema);
