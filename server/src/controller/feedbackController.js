import { Rating } from '../model/Rating.js';
import { Complaint } from '../model/Complaint.js';
import { User } from '../model/User.js';

export async function submitRating(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.body.complaintId);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (String(complaint.createdBy) !== String(req.user._id)) return res.status(403).json({ message: 'Only complaint owner can rate' });
    if (complaint.status !== 'RESOLVED') return res.status(400).json({ message: 'Rating allowed after resolution only' });
    if (!complaint.assignedTo) return res.status(400).json({ message: 'No agent assigned' });

    const feedback = await Rating.findOneAndUpdate(
      { complaint: complaint._id },
      { complaint: complaint._id, user: req.user._id, agent: complaint.assignedTo, rating: req.body.rating, comment: req.body.comment },
      { upsert: true, new: true, runValidators: true }
    );

    const stats = await Rating.aggregate([
      { $match: { agent: complaint.assignedTo } },
      { $group: { _id: '$agent', ratingAverage: { $avg: '$rating' }, ratingCount: { $sum: 1 } } }
    ]);
    await User.findByIdAndUpdate(complaint.assignedTo, {
      ratingAverage: stats[0]?.ratingAverage || 0,
      ratingCount: stats[0]?.ratingCount || 0
    });

    res.status(201).json(feedback);
  } catch (error) {
    next(error);
  }
}
