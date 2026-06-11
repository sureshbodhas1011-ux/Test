import express from 'express';
import { validateCoupon, getCoupons, createCoupon } from '../controllers/couponController';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

router.post('/validate', validateCoupon);
router.get('/', protect, admin, getCoupons);
router.post('/', protect, admin, createCoupon);

export default router;
