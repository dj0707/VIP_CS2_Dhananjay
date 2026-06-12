import { User } from '../model/User.js';
import { Complaint } from '../model/Complaint.js';
import { Rating } from '../model/Rating.js';

export async function dashboard(req, res, next) {
  try {
    const [allUsers, complaints, allFeedback, users, byStatus, byCategory, feedback, agentLoads] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }),
      Complaint.find().populate('createdBy', 'name email').populate('assignedTo', 'name email department').sort({ createdAt: -1 }),
      Rating.find().populate('agent', 'name email department').sort({ createdAt: -1 }),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Rating.aggregate([{ $group: { _id: null, averageRating: { $avg: '$rating' }, count: { $sum: 1 } } }]),
      Complaint.aggregate([
        { $match: { assignedTo: { $ne: null } } },
        { $group: { _id: '$assignedTo', total: { $sum: 1 }, open: { $sum: { $cond: [{ $eq: ['$status', 'RESOLVED'] }, 0, 1] } } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'agent' } },
        { $unwind: '$agent' },
        { $project: { total: 1, open: 1, agentName: '$agent.name', agentEmail: '$agent.email', ratingAverage: '$agent.ratingAverage', ratingCount: '$agent.ratingCount' } }
      ])
    ]);
    res.json({
      users,
      byStatus,
      byCategory,
      feedback: feedback[0] || { averageRating: 0, count: 0 },
      agentLoads,
      recentComplaints: complaints.slice(0, 8),
      allUsers,
      complaints,
      allFeedback
    });
  } catch (error) {
    next(error);
  }
}

export async function rawComplaints(_req, res, next) {
  try {
    res.json(await Complaint.find().lean().sort({ createdAt: -1 }).limit(200));
  } catch (error) {
    next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) return res.status(409).json({ message: 'Email already exists' });
    const user = await User.create({ ...req.body, emailVerified: true });
    res.status(201).json(await User.findById(user._id).select('-password'));
  } catch (error) {
    next(error);
  }
}

export async function listUsers(_req, res, next) {
  try {
    res.json(await User.find().select('-password').sort({ createdAt: -1 }));
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { active: false }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deactivated', user });
  } catch (error) {
    next(error);
  }
}
