import express from 'express';
import { body } from 'express-validator';
import { protect, validateRequest } from '../controller/authController.js';
import { submitRating } from '../controller/feedbackController.js';

const router = express.Router();
router.use(protect);

router.post(
  '/',
  [
    body('complaintId').isMongoId().withMessage('Complaint is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1 to 5'),
    body('comment').optional({ checkFalsy: true }).trim()
  ],
  validateRequest,
  submitRating
);

export default router;
