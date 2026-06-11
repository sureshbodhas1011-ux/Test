import express from 'express';
import { getProductReviews, createProductReview } from '../controllers/reviewController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/', protect, createProductReview);

export default router;
