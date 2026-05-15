const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const Patient = require('../models/Patient');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const patientIds = await Patient.find({ worker: req.userId }).distinct('_id');
    const alerts = await Alert.find({ patientId: { $in: patientIds } })
      .sort({ createdAt: -1 })
      .populate('patientId', 'name');
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    const patient = await Patient.findOne({ _id: alert.patientId, worker: req.userId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const updated = await Alert.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// GET specific alert with detailed patient & screening context
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    let patient = null;
    let latestScreening = null;
    let previousScreenings = [];

    if (alert.patientId) {
      patient = await Patient.findOne({ _id: alert.patientId, worker: req.userId });
      if (patient) {
        const Screening = require('../models/Screening');
        latestScreening = await Screening.findOne({ patientId: patient._id }).sort({ createdAt: -1 });
        previousScreenings = await Screening.find({ patientId: patient._id }).sort({ createdAt: -1 }).limit(5);
      }
    }

    res.json({
      alert,
      patient,
      latestScreening,
      previousScreenings
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alert details' });
  }
});

// Mark alert as resolved
router.put('/:id/resolve', authMiddleware, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    if (alert.patientId) {
      const patient = await Patient.findOne({ _id: alert.patientId, worker: req.userId });
      if (!patient) return res.status(404).json({ error: 'Patient not found' });
    }

    const updated = await Alert.findByIdAndUpdate(req.params.id, { resolved: true, read: true }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

// Create Emergency Alert
router.post('/emergency', authMiddleware, async (req, res) => {
  try {
    const { village } = req.body;
    const alert = new Alert({
      type: 'Emergency',
      title: 'Emergency Medical Assistance Required',
      message: `Emergency reported by ASHA worker in ${village || 'your area'}. Immediate assistance requested.`,
      village: village || 'Unknown',
      read: false,
      resolved: false
    });
    await alert.save();
    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create emergency alert' });
  }
});

module.exports = router;
