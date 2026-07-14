const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'assigned', 'in-progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    category: { type: String, default: 'general', trim: true },
    subcategory: { type: String, default: '', trim: true },
    channel: {
      type: String,
      enum: ['web', 'email', 'phone', 'chat'],
      default: 'web',
    },
    contactPreference: {
      type: String,
      enum: ['email', 'phone', 'chat'],
      default: 'email',
    },
    productOrderRef: { type: String, default: '', trim: true },
    urgencyNote: { type: String, default: '', trim: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    feedback: { type: feedbackSchema, default: null },
  },
  { timestamps: true }
);

// Index for common query patterns
complaintSchema.index({ customer: 1, createdAt: -1 });
complaintSchema.index({ assignedAgent: 1, createdAt: -1 });
complaintSchema.index({ status: 1 });

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
