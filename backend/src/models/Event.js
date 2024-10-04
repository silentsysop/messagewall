const mongoose = require('mongoose');

const PollPresetSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [{
    text: String,
    votes: {
      type: Number,
      default: 0
    }
  }],
  duration: {
    type: Number,
    default: 60 // Duration in seconds
  }
});

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    default: ''
  },
  cooldown: {
    type: Number,
    default: 3,
  },
  cooldownEnabled: {
    type: Boolean,
    default: true,
  },
  pollPresets: [PollPresetSchema]
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);