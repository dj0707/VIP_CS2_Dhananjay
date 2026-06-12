import express from 'express';
import { User } from '../model/User.js';
import { authorize, protect } from '../controller/authController.js';

const router = express.Router();
router.use(protect);

router.get('/agents', authorize('ADMIN', 'SUPER_ADMIN'), async (_req, res, next) => {
  try {
    const agents = await User.find({ role: { $in: ['AGENT', 'SENIOR_AGENT'] }, active: true }).select('name email department ratingAverage ratingCount');
    res.json(agents);
  } catch (error) {
    next(error);
  }
});

router.get('/', authorize('ADMIN', 'SUPER_ADMIN'), async (_req, res, next) => {
  try {
    res.json(await User.find().select('-password').sort({ createdAt: -1 }));
  } catch (error) {
    next(error);
  }
});

export default router;
