const FollowUp = require('../models/FollowUp');

const createFollowUp = async (req, res) => {
  try {
    const { patientId, date, priority, notes } = req.body;
    const followUp = new FollowUp({ patientId, date, priority, notes });
    await followUp.save();
    res.status(201).json(followUp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getFollowUps = async (req, res) => {
  try {
    const followUps = await FollowUp.find({ status: 'Pending' }).populate('patientId').sort({ date: 1 });
    res.json(followUps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markComplete = async (req, res) => {
  try {
    const followUp = await FollowUp.findByIdAndUpdate(req.params.id, { status: 'Completed' }, { new: true });
    res.json(followUp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createFollowUp,
  getFollowUps,
  markComplete
};
