const EmergencyRecord = require('../models/EmergencyRecord');
const Patient = require('../models/Patient');
const Alert = require('../models/Alert');
const FollowUp = require('../models/FollowUp');

const createEmergency = async (req, res) => {
  try {
    const { patientId, emergencyType, emergencyContactCalled, emergencyNumber, notes } = req.body;
    const workerId = req.userId;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Create Emergency Record
    const newEmergency = new EmergencyRecord({
      patientId,
      patientName: patient.name,
      healthId: patient.healthId || '',
      village: patient.village,
      emergencyType,
      emergencyContactCalled,
      emergencyNumber,
      notes,
      workerId
    });
    await newEmergency.save();

    // Create Alert
    try {
      const alert = new Alert({
        type: 'Emergency',
        title: 'Emergency Assistance',
        message: `Emergency Assistance Initiated: ${emergencyType}`,
        patientId: patient._id,
        patientName: patient.name,
        village: patient.village,
        workerId: workerId,
        status: 'Pending',
        priority: 'High'
      });
      await alert.save();
    } catch (e) {
      console.error('Failed to create emergency alert:', e);
    }

    // Create FollowUp for tomorrow
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const followUp = new FollowUp({
        patientId: patient._id,
        patientName: patient.name,
        village: patient.village,
        workerId: workerId,
        date: tomorrow,
        time: '09:00', // Default morning
        priority: 'High',
        riskLevel: 'High Risk',
        reason: 'Emergency Follow-up',
        notes: `Follow up on emergency: ${emergencyType}`
      });
      await followUp.save();
    } catch (e) {
      console.error('Failed to schedule emergency follow-up:', e);
    }

    res.status(201).json(newEmergency);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPatientEmergencies = async (req, res) => {
  try {
    const records = await EmergencyRecord.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateEmergencyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const record = await EmergencyRecord.findOneAndUpdate(
      { _id: req.params.id, workerId: req.userId },
      { status },
      { new: true }
    );
    if (!record) {
      return res.status(404).json({ error: 'Emergency record not found' });
    }
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createEmergency,
  getPatientEmergencies,
  updateEmergencyStatus
};
