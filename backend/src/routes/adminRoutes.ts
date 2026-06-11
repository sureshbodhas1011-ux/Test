import express from 'express';
import { getUsers, updateUserRole } from '../controllers/adminController';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

router.get('/users', protect, admin, getUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);

export default router;
