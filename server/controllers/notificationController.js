const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const { unreadOnly } = req.query;
    const query = { worker: req.userId };
    
    if (unreadOnly === 'true') {
      query.read = false;
    }
    
    const notifications = await Notification.find(query)
      .populate('patient', 'name healthId riskLevel')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      worker: req.userId, 
      read: false 
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, worker: req.userId },
      { read: true, readAt: Date.now() },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { worker: req.userId, read: false },
      { read: true, readAt: Date.now() }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const deleted = await Notification.findOneAndDelete({ _id: notificationId, worker: req.userId });
    if (!deleted) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Internal function to create notification
exports.createNotification = async (workerId, patientId, type, title, message, severity = 'medium', data = {}) => {
  try {
    const notification = new Notification({
      worker: workerId,
      patient: patientId,
      type,
      title,
      message,
      severity,
      data
    });
    await notification.save();
    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};
