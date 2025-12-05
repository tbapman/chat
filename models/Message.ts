import mongoose, { Schema, models, model } from 'mongoose';

const MessageSchema = new Schema({
  roomId: {
    type: String,
    required: true,
    index: true,
  },
  sender: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
});

// Create index for efficient querying
MessageSchema.index({ roomId: 1, timestamp: 1 });

const Message = models.Message || model('Message', MessageSchema);

export default Message;