const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    trim: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
}, { _id: false });

const ReviewSchema = new mongoose.Schema({
  strangenessScore: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  roleAdherenceScore: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  consistencyScore: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  helpfulnessScore: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  aiIssueFlags: {
    type: [String],
    default: [],
  },
  controlImprovement: {
    type: String,
    required: true,
    trim: true,
  },
  notes: {
    type: String,
    default: '',
    trim: true,
  },
}, { _id: false });

const ConversationSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  mode: {
    type: String,
    required: true,
    enum: ['baseline', 'structured'],
  },
  debugVisible: {
    type: Boolean,
    required: true,
    default: false,
  },
  messages: {
    type: [MessageSchema],
    required: true,
    validate: [(arr) => arr.length > 0, 'At least one message is required.'],
  },
  finalAttitude: {
    type: String,
    required: true,
    trim: true,
  },
  finalObjective: {
    type: String,
    required: true,
    trim: true,
  },
  turnCount: {
    type: Number,
    required: true,
    min: 0,
  },
  review: {
    type: ReviewSchema,
    required: true,
  },
}, {
  timestamps: true,
});

ConversationSchema.statics.toAPI = (doc) => ({
  id: doc._id,
  title: doc.title,
  mode: doc.mode,
  debugVisible: doc.debugVisible,
  messages: doc.messages,
  finalAttitude: doc.finalAttitude,
  finalObjective: doc.finalObjective,
  turnCount: doc.turnCount,
  review: doc.review,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

const ConversationModel = mongoose.model('Conversation', ConversationSchema);
module.exports = ConversationModel;