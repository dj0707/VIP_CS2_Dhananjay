import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { Complaint } from '../model/Complaint.js';
import { User } from '../model/User.js';
import { Notification } from '../model/Notification.js';
import { Comment } from '../model/Comment.js';
import { ComplaintHistory } from '../model/ComplaintHistory.js';
import { Category } from '../model/Category.js';

const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

function createTrackingId() {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RX-${year}-${random}`;
}

export const uploadImages = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`)
  }),
  limits: { fileSize: 3 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  }
});

function complaintAccess(req, complaint) {
  const userId = String(req.user._id);
  if (['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) return true;
  if (req.user.role === 'USER') return String(complaint.createdBy?._id || complaint.createdBy) === userId;
  return String(complaint.assignedTo?._id || complaint.assignedTo) === userId;
}

function populateComplaint(query) {
  return query
    .populate('createdBy', 'name email phone')
    .populate('assignedTo', 'name email department ratingAverage ratingCount');
}

async function complaintDetails(id) {
  const complaint = await populateComplaint(Complaint.findById(id));
  if (!complaint) return null;
  const [comments, history] = await Promise.all([
    Comment.find({ complaint: id }).populate('sender', 'name role').sort({ createdAt: 1 }),
    ComplaintHistory.find({ complaint: id }).populate('changedBy', 'name role').sort({ createdAt: 1 })
  ]);
  const data = complaint.toObject();
  data.comments = comments.length ? comments : data.comments || data.messages || [];
  data.history = history.length ? history : data.history || data.statusHistory || [];
  return data;
}

export async function listComplaints(req, res, next) {
  try {
    const filter = { archived: req.query.archived === 'true' };
    if (req.user.role === 'USER') filter.createdBy = req.user._id;
    if (['AGENT', 'SENIOR_AGENT'].includes(req.user.role)) filter.assignedTo = req.user._id;
    ['status', 'priority', 'category', 'department'].forEach((field) => {
      if (req.query[field]) filter[field] = req.query[field];
    });
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { location: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const complaints = await populateComplaint(Complaint.find(filter).sort({ createdAt: -1 }).limit(100));
    res.json(complaints);
  } catch (error) {
    next(error);
  }
}

export async function createComplaint(req, res, next) {
  try {
    const category = await Category.findOne({ name: req.body.category, department: req.body.department, active: true });
    if (!category) return res.status(400).json({ message: 'Select a valid active complaint category' });
    const duplicate = await Complaint.findOne({
      createdBy: req.user._id,
      title: req.body.title,
      category: req.body.category,
      location: req.body.location,
      status: { $in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] }
    });
    if (duplicate) {
      return res.status(409).json({ message: 'Similar complaint already exists. Please edit the existing complaint.', complaintId: duplicate._id });
    }

    const complaint = await Complaint.create({
      trackingId: createTrackingId(),
      title: req.body.title,
      description: req.body.description,
      department: req.body.department,
      category: req.body.category,
      location: req.body.location,
      priority: req.body.priority || 'Medium',
      evidenceImages: (req.files || []).map((file) => `/uploads/${file.filename}`),
      createdBy: req.user._id
    });
    await ComplaintHistory.create({
      complaint: complaint._id,
      status: 'PENDING',
      note: 'Complaint submitted',
      changedBy: req.user._id
    });
    await Notification.create({
      user: req.user._id,
      title: 'Complaint submitted',
      message: `Your complaint "${complaint.title}" was submitted successfully.`
    });
    res.status(201).json(await complaintDetails(complaint._id));
  } catch (error) {
    next(error);
  }
}

export async function cancelComplaint(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (req.user.role !== 'USER' || String(complaint.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the complaint owner can cancel it' });
    }
    if (['RESOLVED', 'NOT_RESOLVED', 'CANCELLED'].includes(complaint.status)) {
      return res.status(400).json({ message: 'This complaint cannot be cancelled' });
    }
    complaint.status = 'CANCELLED';
    await complaint.save();
    await ComplaintHistory.create({ complaint: complaint._id, status: 'CANCELLED', note: req.body.note || 'Cancelled by user', changedBy: req.user._id });
    res.json(await complaintDetails(complaint._id));
  } catch (error) {
    next(error);
  }
}

export async function reopenComplaint(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (req.user.role !== 'USER' || String(complaint.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the complaint owner can reopen it' });
    }
    if (!['RESOLVED', 'NOT_RESOLVED', 'CANCELLED'].includes(complaint.status)) {
      return res.status(400).json({ message: 'Only closed complaints can be reopened' });
    }
    complaint.status = complaint.assignedTo ? 'ASSIGNED' : 'PENDING';
    await complaint.save();
    await ComplaintHistory.create({ complaint: complaint._id, status: 'REOPENED', note: req.body.note || 'Reopened by user', changedBy: req.user._id });
    if (complaint.assignedTo) {
      await Notification.create({ user: complaint.assignedTo, title: 'Complaint reopened', message: `"${complaint.title}" was reopened by the user.` });
    }
    res.json(await complaintDetails(complaint._id));
  } catch (error) {
    next(error);
  }
}

export async function archiveComplaint(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    complaint.archived = true;
    complaint.archivedAt = new Date();
    await complaint.save();
    await ComplaintHistory.create({ complaint: complaint._id, status: complaint.status, note: 'Complaint archived by administrator', changedBy: req.user._id });
    res.json({ message: 'Complaint archived' });
  } catch (error) {
    next(error);
  }
}

export async function trackComplaint(req, res, next) {
  try {
    const complaint = await Complaint.findOne({ trackingId: req.params.trackingId })
      .select('trackingId title category department location priority status createdAt updatedAt');
    if (!complaint) return res.status(404).json({ message: 'No complaint found for this tracking number' });
    const history = await ComplaintHistory.find({ complaint: complaint._id }).select('status note createdAt').sort({ createdAt: 1 });
    res.json({ ...complaint.toObject(), history });
  } catch (error) {
    next(error);
  }
}

export async function getComplaint(req, res, next) {
  try {
    const complaint = await complaintDetails(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (!complaintAccess(req, complaint)) return res.status(403).json({ message: 'Access denied' });
    res.json(complaint);
  } catch (error) {
    next(error);
  }
}

export async function updateComplaint(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const userCanEdit = req.user.role === 'USER' && String(complaint.createdBy) === String(req.user._id) && complaint.status === 'PENDING';
    const adminCanEdit = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
    if (!userCanEdit && !adminCanEdit) return res.status(403).json({ message: 'Only pending own complaints or admin complaints can be edited' });

    ['title', 'description', 'department', 'category', 'location', 'priority'].forEach((field) => {
      if (req.body[field] !== undefined) complaint[field] = req.body[field];
    });
    if (req.files?.length) complaint.evidenceImages.push(...req.files.map((file) => `/uploads/${file.filename}`));
    await complaint.save();
    await ComplaintHistory.create({ complaint: complaint._id, status: complaint.status, note: 'Complaint updated', changedBy: req.user._id });
    res.json(await complaintDetails(complaint._id));
  } catch (error) {
    next(error);
  }
}

export async function assignComplaint(req, res, next) {
  try {
    const [complaint, agent] = await Promise.all([
      Complaint.findById(req.params.id),
      User.findOne({ _id: req.body.agentId, role: { $in: ['AGENT', 'SENIOR_AGENT'] }, active: true })
    ]);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (!agent) return res.status(400).json({ message: 'Agent not found' });

    complaint.assignedTo = agent._id;
    complaint.status = 'ASSIGNED';
    await complaint.save();
    await ComplaintHistory.create({ complaint: complaint._id, status: 'ASSIGNED', note: `Assigned to ${agent.name}`, changedBy: req.user._id });
    await Notification.create({
      user: agent._id,
      title: 'Complaint assigned',
      message: `Complaint "${complaint.title}" has been assigned to you.`
    });
    await Notification.create({
      user: complaint.createdBy,
      title: 'Agent assigned',
      message: `${agent.name} has been assigned to your complaint.`
    });
    res.json(await complaintDetails(complaint._id));
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const allowed = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'NOT_RESOLVED'];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid status' });

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (!complaintAccess(req, complaint)) return res.status(403).json({ message: 'Access denied' });
    if (req.user.role === 'USER') return res.status(403).json({ message: 'Users cannot update status' });

    complaint.status = req.body.status;
    complaint.resolution = req.body.resolution || complaint.resolution;
    if (req.files?.length) complaint.resolutionImages.push(...req.files.map((file) => `/uploads/${file.filename}`));
    if (req.body.status === 'RESOLVED') complaint.resolvedAt = new Date();
    await complaint.save();
    await ComplaintHistory.create({
      complaint: complaint._id,
      status: req.body.status,
      note: req.body.note || 'Status updated',
      changedBy: req.user._id
    });
    await Notification.create({
      user: complaint.createdBy,
      title: 'Complaint status updated',
      message: `Your complaint "${complaint.title}" is now ${req.body.status}.`
    });
    res.json(await complaintDetails(complaint._id));
  } catch (error) {
    next(error);
  }
}

export async function addComment(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (!complaintAccess(req, complaint)) return res.status(403).json({ message: 'Access denied' });
    await Comment.create({ complaint: complaint._id, sender: req.user._id, message: req.body.message });
    await ComplaintHistory.create({ complaint: complaint._id, status: complaint.status, note: 'Comment added', changedBy: req.user._id });
    const notifyUser = String(req.user._id) === String(complaint.createdBy) ? complaint.assignedTo : complaint.createdBy;
    if (notifyUser) {
      await Notification.create({
        user: notifyUser,
        title: 'New complaint comment',
        message: `A new comment was added to "${complaint.title}".`
      });
    }
    res.status(201).json(await complaintDetails(complaint._id));
  } catch (error) {
    next(error);
  }
}

export async function deleteComplaint(req, res, next) {
  try {
    const deleted = await Complaint.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Complaint not found' });
    res.json({ message: 'Complaint deleted' });
  } catch (error) {
    next(error);
  }
}
