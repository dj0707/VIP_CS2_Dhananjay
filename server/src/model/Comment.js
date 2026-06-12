import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export const Comment = mongoose.model('Comment', commentSchema);
