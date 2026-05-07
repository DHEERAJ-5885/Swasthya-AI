const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).populate('patientId', 'name');
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

module.exports = router;
