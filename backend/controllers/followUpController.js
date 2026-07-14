const FollowUp = require('../models/FollowUp');
const Patient = require('../models/Patient');
const Alert = require('../models/Alert');

const createFollowUp = async (req, res) => {
  try {
    const { patientId, date, time, priority, riskLevel, reason, notes } = req.body;
    const patient = await Patient.findOne({ _id: patientId, worker: req.userId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const followUp = new FollowUp({ 
      patientId, 
      patientName: patient.name,
      village: patient.village,
      workerId: req.userId,
      date, 
      time,
      priority, 
      riskLevel: riskLevel || 'Unknown',
      reason: reason || notes,
      notes 
    });
    await followUp.save();
    res.status(201).json(followUp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateFollowUp = async (req, res) => {
  try {
    const { date, time, priority, riskLevel, reason, notes, status } = req.body;
    const followUp = await FollowUp.findOne({ _id: req.params.id, workerId: req.userId });
    if (!followUp) return res.status(404).json({ error: 'Follow-up not found' });

    if (date) followUp.date = date;
    if (time !== undefined) followUp.time = time;
    if (priority) followUp.priority = priority;
    if (riskLevel) followUp.riskLevel = riskLevel;
    if (reason) followUp.reason = reason;
    if (notes) followUp.notes = notes;
    if (status) followUp.status = status;

    await followUp.save();
    res.json(followUp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findOneAndDelete({ _id: req.params.id, workerId: req.userId });
    if (!followUp) return res.status(404).json({ error: 'Follow-up not found' });
    res.json({ message: 'Follow-up deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getFollowUps = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Auto mark missed
    const overdue = await FollowUp.find({
      workerId: req.userId,
      status: 'Pending',
      date: { $lt: startOfDay }
    });

    for (const item of overdue) {
      try {
        item.status = 'Missed';
        await item.save();
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
      } catch (e) {
        console.error('Failed to auto-mark follow-up as missed', e.message);
      }
    }

    const followUps = await FollowUp.find({ status: 'Pending', workerId: req.userId })
      .populate('patientId')
      .sort({ date: 1 });
    res.json(followUps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllCalendarFollowUps = async (req, res) => {
  try {
    // Allows filtering by date range if provided, otherwise returns all for the worker
    const query = { workerId: req.userId };
    if (req.query.start && req.query.end) {
      query.date = { $gte: new Date(req.query.start), $lte: new Date(req.query.end) };
    }
    const followUps = await FollowUp.find(query).populate('patientId').populate('workerId').sort({ date: 1 });
    res.json(followUps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markComplete = async (req, res) => {
  try {
    const followUp = await FollowUp.findOneAndUpdate(
      { _id: req.params.id, workerId: req.userId }, 
      { status: 'Completed' }, 
      { new: true }
    );
    if (!followUp) return res.status(404).json({ error: 'Follow-up not found' });
    res.json(followUp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getFollowUpsByPatient = async (req, res) => {
  try {
    const followUps = await FollowUp.find({ patientId: req.params.patientId, workerId: req.userId })
      .sort({ date: -1 });
    res.json(followUps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
  getFollowUps,
  getAllCalendarFollowUps,
  markComplete,
  getFollowUpsByPatient
};
