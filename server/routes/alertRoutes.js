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

module.exports = router;
