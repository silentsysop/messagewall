const User = require('../models/User');
const Message = require('../models/Message');

exports.getOrganizers = async (req, res) => {
  try {
    const organizers = await User.find({ role: 'organizer' }).select('-password');
    res.json(organizers);
  } catch (error) {
    console.error('Error fetching organizers:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.assignCustomRole = async (req, res) => {
  try {
    const { userId, roleName, roleColor } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { customRole: { name: roleName, color: roleColor } },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update all messages by this user with the new custom role
    await Message.updateMany(
      { user: userId },
      { customRole: { name: roleName, color: roleColor } }
    );

    // Emit a socket event to update the UI for all clients
    req.app.locals.io.emit('user role updated', { userId, customRole: { name: roleName, color: roleColor } });
    
    res.json(user);
  } catch (error) {
    console.error('Error assigning custom role:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.removeCustomRole = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { $unset: { customRole: "" } },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove custom role from all messages by this user
    await Message.updateMany(
      { user: userId },
      { $unset: { customRole: "" } }
    );

    // Emit a socket event to update the UI for all clients
    req.app.locals.io.emit('user role updated', { userId, customRole: null });
    
    res.json(user);
  } catch (error) {
    console.error('Error removing custom role:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
