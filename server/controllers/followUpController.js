const FollowUp = require('../models/FollowUp');
const Patient = require('../models/Patient');
const Alert = require('../models/Alert');

const createFollowUp = async (req, res) => {
  try {
    const { patientId, date, priority, notes } = req.body;
    const patient = await Patient.findOne({ _id: patientId, worker: req.userId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const followUp = new FollowUp({ patientId, date, priority, notes });
    await followUp.save();
    res.status(201).json(followUp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getFollowUps = async (req, res) => {
  try {
    const patientIds = await Patient.find({ worker: req.userId }).distinct('_id');
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const overdue = await FollowUp.find({
      patientId: { $in: patientIds },
      status: 'Pending',
      date: { $lt: startOfDay }
    });

    for (const item of overdue) {
      const message = `Follow-up overdue since ${new Date(item.date).toLocaleDateString()}`;
      const existing = await Alert.findOne({ type: 'Missed', patientId: item.patientId, message });
      if (!existing) {
        await Alert.create({
          type: 'Missed',
          title: 'Missed Follow-up',
          message,
          patientId: item.patientId
        });
      }
    }

    const followUps = await FollowUp.find({ status: 'Pending', patientId: { $in: patientIds } })
      .populate('patientId')
      .sort({ date: 1 });
    res.json(followUps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markComplete = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);
    if (!followUp) {
      return res.status(404).json({ error: 'Follow-up not found' });
    }
    const patient = await Patient.findOne({ _id: followUp.patientId, worker: req.userId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const updated = await FollowUp.findByIdAndUpdate(req.params.id, { status: 'Completed' }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getFollowUpsByPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.patientId, worker: req.userId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const followUps = await FollowUp.find({ patientId: req.params.patientId })
      .sort({ date: -1 });
    res.json(followUps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createFollowUp,
  getFollowUps,
  markComplete,
  getFollowUpsByPatient
};
