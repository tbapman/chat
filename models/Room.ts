import mongoose, { Schema, models, model } from 'mongoose';
import { nanoid } from 'nanoid';

const RoomSchema = new Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    default: () => nanoid(8), // Generate unique room ID
  },
  name: {
    type: String,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

const Room = models.Room || model('Room', RoomSchema);

export default Room;
