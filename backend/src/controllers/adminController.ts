import { Response } from 'express';
import { isMockMode, localDb } from '../config/db';
import User from '../models/User';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let users: any[];
    let orders: any[];

    if (isMockMode) {
      users = localDb.find('users');
      orders = localDb.find('orders');
    } else {
      users = await User.find().select('-passwordHash');
      orders = await Order.find();
    }

    // Attach order count to users
    const usersWithOrderCount = users.map(user => {
      const uId = user._id || user.id;
      const userOrders = orders.filter(o => o.userId === uId);
      return {
        id: uId,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        orderCount: userOrders.length,
        totalSpent: userOrders.reduce((sum, o) => sum + o.pricing.total, 0)
      };
    });

    res.json(usersWithOrderCount);
  } catch (error) {
    res.status(500).json({ error: 'Server users fetch error' });
  }
};

// @desc    Update user role (Admin)
// @route   PUT /api/admin/users/:id/role
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { role } = req.body;

  if (role !== 'CUSTOMER' && role !== 'ADMIN') {
    res.status(400).json({ error: 'Invalid role' });
    return;
  }

  try {
    let updatedUser: any;
    if (isMockMode) {
      updatedUser = localDb.findByIdAndUpdate('users', id, { role });
    } else {
      updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-passwordHash');
    }

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: updatedUser._id || updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ error: 'Server user role update error' });
  }
};
