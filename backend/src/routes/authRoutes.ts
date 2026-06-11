import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  updateProfile,
  addAddress,
  deleteAddress,
  toggleWishlist
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/profile', protect, updateProfile);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.post('/wishlist', protect, toggleWishlist);

export default router;
