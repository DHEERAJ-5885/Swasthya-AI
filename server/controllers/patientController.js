const Patient = require('../models/Patient');

// Create a patient
const createPatient = async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all patients
const getPatients = async (req, res) => {
  try {
    const Patient = require('../models/Patient');
    const Screening = require('../models/Screening');
    
    const patients = await Patient.find().sort({ createdAt: -1 }).lean();
    
    // Attach latest screening risk
    const enhancedPatients = await Promise.all(patients.map(async (p) => {
      const latestScreening = await Screening.findOne({ patientId: p._id }).sort({ createdAt: -1 }).lean();
      return {
        ...p,
        risk: latestScreening?.result?.riskLevel || 'Unknown',
        date: latestScreening?.createdAt ? new Date(latestScreening.createdAt).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString()
      };
    }));

    res.json(enhancedPatients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a patient by ID
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a patient
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!patient) return res.status(404).json({ error: 'Not found' });
    res.json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a patient
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient
};
