const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['customer', 'agent', 'admin'],
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

// Index to fetch all messages for a complaint efficiently
messageSchema.index({ complaint: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
