const Patient = require('../models/Patient');
const AshaWorker = require('../models/AshaWorker');

// Create a patient
const createPatient = async (req, res) => {
  try {
    const { name, phone, age, gender, village, familyId } = req.body;

    if (!name || !age || !gender || !village || !familyId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }

    const duplicateQuery = { worker: req.userId };
    if (phone) {
      duplicateQuery.phone = phone;
    } else {
      duplicateQuery.name = name;
      duplicateQuery.familyId = familyId;
    }

    const existing = await Patient.findOne(duplicateQuery);
    if (existing) {
      return res.status(400).json({ error: 'Patient already exists for this ASHA worker' });
    }

    const patient = new Patient({
      ...req.body,
      worker: req.userId
    });
    await patient.save();
    // Add reference to worker's assignedPatients and update stats
    try {
      await AshaWorker.findByIdAndUpdate(req.userId, {
        $addToSet: { assignedPatients: patient._id },
        $inc: { 'stats.totalPatients': 1 }
      });
    } catch (e) {
      // non-fatal
      console.error('Failed to update worker assignedPatients/stats', e.message);
    }

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
    
    const patients = await Patient.find({ worker: req.userId }).sort({ createdAt: -1 }).lean();
    
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
    const patient = await Patient.findOne({ _id: req.params.id, worker: req.userId });
    if (!patient) return res.status(404).json({ error: 'Not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a patient
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, worker: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!patient) return res.status(404).json({ error: 'Not found' });
    res.json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a patient
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({ _id: req.params.id, worker: req.userId });
    if (!patient) return res.status(404).json({ error: 'Not found' });
    // Remove from worker assignedPatients and decrement total
    try {
      await AshaWorker.findByIdAndUpdate(req.userId, {
        $pull: { assignedPatients: req.params.id },
        $inc: { 'stats.totalPatients': -1 }
      });
    } catch (e) {
      console.error('Failed to update worker after patient delete', e.message);
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addObservation = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ error: 'Observation note is required' });
    }
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, worker: req.userId },
      { $push: { observations: { note: note.trim(), worker: req.userId } } },
      { new: true }
    );
    if (!patient) return res.status(404).json({ error: 'Not found' });
    res.json(patient.observations);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const assignExistingPatients = async (req, res) => {
  try {
    // Match patients that do not have worker assigned (missing, null or empty)
    const filter = { $or: [ { worker: { $exists: false } }, { worker: null } ] };
    const unassigned = await Patient.find(filter).select('_id');
    if (!unassigned || unassigned.length === 0) {
      return res.json({ matched: 0, updated: 0 });
    }
    const ids = unassigned.map(p => p._id);
    const result = await Patient.updateMany(
      { _id: { $in: ids } },
      { $set: { worker: req.userId } }
    );

    // Add these patients to the worker document and update stats
    try {
      await AshaWorker.findByIdAndUpdate(req.userId, {
        $addToSet: { assignedPatients: { $each: ids } },
        $inc: { 'stats.totalPatients': ids.length }
      });
    } catch (e) {
      console.error('Failed to update worker assignedPatients after claim', e.message);
    }

    res.json({ matched: result.matchedCount || ids.length, updated: result.modifiedCount || ids.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  addObservation,
  assignExistingPatients
};
