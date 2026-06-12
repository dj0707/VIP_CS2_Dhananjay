import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true },
    internal: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'NOT_RESOLVED', 'COMPLETED', 'NOT_COMPLETED', 'CANCELLED', 'REOPENED'],
      required: true
    },
    note: { type: String, trim: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    trackingId: { type: String, unique: true, sparse: true, index: true },
    description: { type: String, required: true, trim: true },
    department: {
      type: String,
      required: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      index: true
    },
    location: { type: String, required: true, trim: true, index: true },
    priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low', 'Urgent'], default: 'Medium', index: true },
    status: {
      type: String,
      enum: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'NOT_RESOLVED', 'COMPLETED', 'NOT_COMPLETED', 'CANCELLED', 'REOPENED'],
      default: 'PENDING',
      index: true
    },
    evidenceImages: [{ type: String, trim: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    resolution: { type: String, trim: true },
    resolutionImages: [{ type: String, trim: true }],
    agentNote: { type: String, trim: true },
    adminNote: { type: String, trim: true },
    resolvedAt: Date,
    messages: [messageSchema],
    statusHistory: [statusHistorySchema],
    comments: [messageSchema],
    history: [statusHistorySchema],
    spamFlag: { type: Boolean, default: false }
    ,
    archived: { type: Boolean, default: false, index: true },
    archivedAt: Date
  },
  { timestamps: true }
);

complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ createdBy: 1, department: 1, category: 1, location: 1, status: 1 });

export const Complaint = mongoose.model('Complaint', complaintSchema);
