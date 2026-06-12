import express from 'express';
import { body } from 'express-validator';
import { getCaptcha, login, me, protect, register, validateRequest } from '../controller/authController.js';

const router = express.Router();
router.get('/captcha', getCaptcha);

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('phone').trim().isLength({ min: 7 }).withMessage('Phone is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('captchaToken').notEmpty(),
    body('captchaAnswer').notEmpty()
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    body('captchaToken').notEmpty(),
    body('captchaAnswer').notEmpty()
  ],
  validateRequest,
  login
);

router.get('/me', protect, me);

export default router;
