const Message = require('../models/Message');
const Event = require('../models/Event');
const MAX_MESSAGE_LENGTH = 255; // Add this at the top of the file
const User = require('../models/User');
const { createNotification, deleteNotification } = require('./notificationController');


exports.createMessage = async (req, res) => {
  const { content, eventId, name, replyTo } = req.body;
  const io = req.app.locals.io;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    const now = new Date();
    if (event.isChatLocked || now < new Date(event.startTime) || now > new Date(event.endTime)) {
      return res.status(403).json({ error: 'Chat is locked' });
    }

    // Add this check
    if (!content || content.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: `Message content must be between 1 and ${MAX_MESSAGE_LENGTH} characters.` });
    }

    const user = req.user ? await User.findById(req.user.id) : null;
    
    const newMessage = new Message({
      content,
      event: eventId,
      user: user ? user._id : null,
      name: user ? user.username : (name || 'Anonymous'),
      approved: event.requiresApproval ? false : true,
      replyTo: replyTo || null,
      customRole: user ? user.customRole : null
    });

    const savedMessage = await newMessage.save();
    
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('user', 'username role customRole')
      .populate('event', 'name')
      .populate({
        path: 'replyTo',
        select: 'content user name',
        populate: { path: 'user', select: 'username' }
      });

    if (savedMessage.approved) {
      console.log('Emitting new message to room:', eventId);
      io.to(eventId).emit('new message', populatedMessage);
    } else {
      console.log('Emitting new message to moderate');
      io.emit('new message to moderate', populatedMessage);
    }

    if (!savedMessage.approved) {
      const organizers = await User.find({ role: 'organizer' });
      for (const organizer of organizers) {
        console.log('Creating notification for event:', event._id); // Add this log
        const notification = await createNotification(
          organizer._id,
          `New message requires moderation in event: ${event.name}`,
          'moderation',
          savedMessage._id,
          event._id
        );
        console.log('Created notification:', notification); // Add this log
        // Emit socket event for real-time updates
        io.to(organizer._id.toString()).emit('new notification', notification);
      }
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).send('Server error');
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ event: req.params.eventId, approved: true })
      .populate('user', 'username role customRole')
      .populate({
        path: 'replyTo',
        select: 'content user name',
        populate: { path: 'user', select: 'username customRole' }
      })
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

exports.approveMessage = async (req, res) => {
  const io = req.app.locals.io;

  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    // Check if the user has the 'organizer' role
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ msg: 'User not authorized. Only organizers can approve messages.' });
    }

    message.approved = true;
    await message.save();

    // Populate the message before emitting
    const populatedMessage = await Message.findById(message._id)
      .populate('user', 'username role customRole')
      .populate('event', 'name')
      .populate({
        path: 'replyTo',
        select: 'content user name',
        populate: { path: 'user', select: 'username' }
      });

    io.to(message.event.toString()).emit('new message', populatedMessage);
    io.emit('message approved', populatedMessage._id);

    await deleteNotification(message._id);

    res.json(populatedMessage);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

exports.deleteMessage = async (req, res) => {
  const io = req.app.locals.io;
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    // Check if the user is an organizer or the message creator
    if (req.user.role !== 'organizer' && message.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Message.deleteOne({ _id: req.params.id });
    
    // Emit a 'message deleted' event to all clients in the event room
    io.to(message.event.toString()).emit('message deleted', req.params.id);
    
    await deleteNotification(req.params.id);
    
    res.json({ msg: 'Message removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Message not found' });
    }
    res.status(500).send('Server error');
  }
};

exports.getPendingMessages = async (req, res) => {
  try {
    console.log('Fetching pending messages');
    const messages = await Message.find({ approved: false })
      .populate('user', 'username role')
      .populate('event', 'name')
      .sort({ createdAt: -1 });
    console.log('Pending messages:', messages);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching pending messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.reactToMessage = async (req, res) => {
  const io = req.app.locals.io; // Access the io instance

  try {
    const { reaction } = req.body;
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const userId = req.user ? req.user.id : req.ip;
    const existingReaction = message.userReactions.find(r => r.userId === userId);

    if (existingReaction) {
      if (existingReaction.reaction === reaction) {
        // Remove reaction if clicking the same button
        message.reactions[reaction]--;
        message.userReactions = message.userReactions.filter(r => r.userId !== userId);
        await message.save();
        io.to(message.event.toString()).emit('reaction updated', { messageId: message._id, reactions: message.reactions });
        return res.json({ reactions: message.reactions, userReaction: null });
      } else {
        // Change reaction
        message.reactions[existingReaction.reaction]--;
        message.reactions[reaction]++;
        existingReaction.reaction = reaction;
      }
    } else {
      // Add new reaction
      message.reactions[reaction]++;
      message.userReactions.push({ userId, reaction });
    }

    await message.save();

    // Emit the reaction update event
    io.to(message.event.toString()).emit('reaction updated', { messageId: message._id, reactions: message.reactions });

    res.json({ reactions: message.reactions, userReaction: reaction });
  } catch (error) {
    console.error('Error reacting to message:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add this new method to get user's reaction
exports.getUserReaction = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const userId = req.user ? req.user.id : req.ip;
    const userReaction = message.userReactions.find(r => r.userId === userId);

    res.json({ reaction: userReaction ? userReaction.reaction : null });
  } catch (error) {
    console.error('Error getting user reaction:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
