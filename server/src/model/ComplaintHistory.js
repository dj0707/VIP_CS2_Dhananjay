import mongoose from 'mongoose';

const complaintHistorySchema = new mongoose.Schema(
  {
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'NOT_RESOLVED', 'CANCELLED', 'REOPENED'],
      required: true
    },
    note: { type: String, trim: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export const ComplaintHistory = mongoose.model('ComplaintHistory', complaintHistorySchema);
