// backend/controllers/notificationController.js
const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort('-createdAt');
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification marked as read and deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    res.json({ message: 'All notifications marked as read and deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
};

exports.createNotification = async (userId, content, type, relatedId, eventId) => {
  try {
    console.log('Creating notification with eventId:', eventId); // Add this log
    const notification = new Notification({
      user: userId,
      eventId,
      content,
      type,
      relatedId
    });
    await notification.save();
    console.log('Saved notification:', notification); // Add this log
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

exports.deleteNotification = async (relatedId) => {
  try {
    await Notification.deleteMany({ relatedId });
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};
