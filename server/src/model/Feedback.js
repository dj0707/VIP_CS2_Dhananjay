import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true }
  },
  { timestamps: true }
);

export const Feedback = mongoose.model('Feedback', feedbackSchema);
