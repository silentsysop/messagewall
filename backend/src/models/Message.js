const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    default: 'Anonymous'
  },
  approved: {
    type: Boolean,
    default: true,
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  reactions: {
    thumbsUp: { type: Number, default: 0 },
    thumbDown: { type: Number, default: 0 }
  },
  userReactions: [{
    userId: { type: String, required: true },
    reaction: { type: String, enum: ['thumbsUp', 'thumbDown'], required: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);