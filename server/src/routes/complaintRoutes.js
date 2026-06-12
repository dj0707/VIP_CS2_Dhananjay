import express from 'express';
import { body, param } from 'express-validator';
import { authorize, protect, validateRequest } from '../controller/authController.js';
import {
  addComment,
  archiveComplaint,
  assignComplaint,
  cancelComplaint,
  createComplaint,
  deleteComplaint,
  getComplaint,
  listComplaints,
  reopenComplaint,
  trackComplaint,
  updateComplaint,
  updateStatus,
  uploadImages
} from '../controller/complaintController.js';

const router = express.Router();

router.get('/track/:trackingId', trackComplaint);

router.use(protect);
router.get('/', listComplaints);
router.post(
  '/',
  authorize('USER', 'ADMIN', 'SUPER_ADMIN'),
  uploadImages.array('images', 5),
  [
    body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('location').trim().isLength({ min: 3 }).withMessage('Location is required'),
    body('priority').optional().isIn(['Critical', 'High', 'Medium', 'Low']).withMessage('Invalid priority')
  ],
  validateRequest,
  createComplaint
);

router.get('/:id', [param('id').isMongoId()], validateRequest, getComplaint);
router.patch('/:id', uploadImages.array('images', 5), [param('id').isMongoId()], validateRequest, updateComplaint);
router.patch('/:id/assign', authorize('ADMIN', 'SUPER_ADMIN'), [param('id').isMongoId(), body('agentId').isMongoId()], validateRequest, assignComplaint);
router.patch('/:id/status', authorize('AGENT', 'SENIOR_AGENT', 'ADMIN', 'SUPER_ADMIN'), uploadImages.array('resolutionImages', 5), [param('id').isMongoId()], validateRequest, updateStatus);
router.patch('/:id/cancel', authorize('USER'), [param('id').isMongoId()], validateRequest, cancelComplaint);
router.patch('/:id/reopen', authorize('USER'), [param('id').isMongoId()], validateRequest, reopenComplaint);
router.patch('/:id/archive', authorize('ADMIN', 'SUPER_ADMIN'), [param('id').isMongoId()], validateRequest, archiveComplaint);
router.post('/:id/messages', [param('id').isMongoId(), body('message').trim().notEmpty()], validateRequest, addComment);
router.delete('/:id', authorize('ADMIN', 'SUPER_ADMIN'), [param('id').isMongoId()], validateRequest, deleteComplaint);

export default router;
