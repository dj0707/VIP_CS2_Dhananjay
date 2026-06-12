import express from 'express';
import { body, param } from 'express-validator';
import { authorize, protect, validateRequest } from '../controller/authController.js';
import { createUser, dashboard, deleteUser, listUsers, rawComplaints, updateUser } from '../controller/adminController.js';

const router = express.Router();
router.use(protect, authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/stats', dashboard);
router.get('/mongo/complaints', rawComplaints);
router.get('/users', listUsers);
router.post(
  '/users',
  [
    body('name').trim().isLength({ min: 2 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('role').isIn(['USER', 'AGENT', 'SENIOR_AGENT', 'ADMIN', 'SUPER_ADMIN'])
  ],
  validateRequest,
  createUser
);
router.patch('/users/:id', [param('id').isMongoId()], validateRequest, updateUser);
router.delete('/users/:id', [param('id').isMongoId()], validateRequest, deleteUser);

export default router;
