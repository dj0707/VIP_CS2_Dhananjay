import express from 'express';
import { body, param } from 'express-validator';
import { authorize, protect, validateRequest } from '../controller/authController.js';
import {
  createAnnouncement,
  createCategory,
  deleteAnnouncement,
  deleteCategory,
  listAnnouncements,
  listCategories,
  listNotifications,
  updateAnnouncement,
  updateCategory
} from '../controller/portalController.js';

const router = express.Router();

router.get('/announcements', listAnnouncements);
router.get('/categories', listCategories);
router.get('/notifications', protect, listNotifications);
router.post('/announcements', protect, authorize('ADMIN', 'SUPER_ADMIN'), [body('title').trim().notEmpty(), body('message').trim().notEmpty()], validateRequest, createAnnouncement);
router.post('/categories', protect, authorize('ADMIN', 'SUPER_ADMIN'), [body('name').trim().notEmpty(), body('department').trim().notEmpty()], validateRequest, createCategory);
router.patch('/announcements/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), [param('id').isMongoId()], validateRequest, updateAnnouncement);
router.delete('/announcements/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), [param('id').isMongoId()], validateRequest, deleteAnnouncement);
router.patch('/categories/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), [param('id').isMongoId()], validateRequest, updateCategory);
router.delete('/categories/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), [param('id').isMongoId()], validateRequest, deleteCategory);

export default router;
