import { Announcement } from '../model/Announcement.js';
import { Category } from '../model/Category.js';
import { Notification } from '../model/Notification.js';

export async function listAnnouncements(_req, res, next) {
  try {
    res.json(await Announcement.find({ active: true }).sort({ createdAt: -1 }).limit(10));
  } catch (error) {
    next(error);
  }
}

export async function listCategories(_req, res, next) {
  try {
    res.json(await Category.find({ active: true }).sort({ name: 1 }));
  } catch (error) {
    next(error);
  }
}

export async function listNotifications(req, res, next) {
  try {
    res.json(await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50));
  } catch (error) {
    next(error);
  }
}

export async function createAnnouncement(req, res, next) {
  try {
    const announcement = await Announcement.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(announcement);
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
}

export async function updateAnnouncement(req, res, next) {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    res.json(announcement);
  } catch (error) {
    next(error);
  }
}

export async function deleteAnnouncement(req, res, next) {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
}
