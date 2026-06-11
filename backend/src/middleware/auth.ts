import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isMockMode, localDb } from '../config/db';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'CUSTOMER' | 'ADMIN';
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  // Read JWT token from cookies or Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, token missing' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ecommerce_secret_key_123') as { id: string };

    if (isMockMode) {
      const user = localDb.findById('users', decoded.id);
      if (!user) {
        res.status(401).json({ error: 'User not found in mock database' });
        return;
      }
      req.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      };
    } else {
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) {
        res.status(401).json({ error: 'User not found in MongoDB' });
        return;
      }
      req.user = {
        id: user.id || user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      };
    }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Not authorized, invalid token' });
  }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied, administrator role required' });
  }
};
