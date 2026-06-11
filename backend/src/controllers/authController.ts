import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isMockMode, localDb } from '../config/db';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ecommerce_secret_key_123', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Please enter all fields' });
    return;
  }

  const userRole = role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';

  try {
    let userExists = false;
    if (isMockMode) {
      userExists = !!localDb.findOne('users', (u) => u.email === email.toLowerCase());
    } else {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      userExists = !!existingUser;
    }

    if (userExists) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let newUser: any;
    if (isMockMode) {
      newUser = localDb.create('users', {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: userRole,
        addresses: [],
        wishlist: []
      });
    } else {
      const userDoc = new User({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: userRole,
        addresses: [],
        wishlist: []
      });
      newUser = await userDoc.save();
    }

    const token = generateToken(newUser._id || newUser.id);

    res.status(201).json({
      token,
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        addresses: newUser.addresses || [],
        wishlist: newUser.wishlist || []
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server registration error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Please enter email and password' });
    return;
  }

  try {
    let user: any;
    if (isMockMode) {
      user = localDb.findOne('users', (u) => u.email === email.toLowerCase());
    } else {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user._id || user.id);

    res.json({
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses || [],
        wishlist: user.wishlist || []
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server login error' });
  }
};

// @desc    Get user profile session
// @route   GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    let user: any;
    if (isMockMode) {
      user = localDb.findById('users', req.user.id);
    } else {
      user = await User.findById(req.user.id).select('-passwordHash');
    }

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses || [],
        wishlist: user.wishlist || []
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server profile fetch error' });
  }
};

// @desc    Reset password (mock simulation)
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Please provide email' });
    return;
  }

  try {
    let userExists = false;
    if (isMockMode) {
      userExists = !!localDb.findOne('users', (u) => u.email === email.toLowerCase());
    } else {
      userExists = await User.exists({ email: email.toLowerCase() }) !== null;
    }

    if (!userExists) {
      res.status(404).json({ error: 'No user registered with this email' });
      return;
    }

    // Success response simulating reset link dispatch
    res.json({ message: 'Password reset instructions have been dispatched to your email address.' });
  } catch (error) {
    res.status(500).json({ error: 'Server password reset error' });
  }
};

// @desc    Update user profile info
// @route   PUT /api/auth/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, password } = req.body;
  if (!req.user) {
    res.status(401).json({ error: 'Not authorized' });
    return;
  }

  try {
    const updateData: any = {};
    if (name) updateData.name = name;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(password, salt);
    }

    let updatedUser: any;
    if (isMockMode) {
      updatedUser = localDb.findByIdAndUpdate('users', req.user.id, updateData);
    } else {
      updatedUser = await User.findByIdAndUpdate(req.user.id, { $set: updateData }, { new: true }).select('-passwordHash');
    }

    res.json({
      user: {
        id: updatedUser._id || updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        addresses: updatedUser.addresses || [],
        wishlist: updatedUser.wishlist || []
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server profile update error' });
  }
};

// @desc    Add address
// @route   POST /api/auth/addresses
export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { fullName, street, city, state, zipCode, phone, isDefault } = req.body;
  if (!req.user) {
    res.status(401).json({ error: 'Not authorized' });
    return;
  }

  try {
    let updatedUser: any;
    const newAddress = {
      fullName,
      street,
      city,
      state,
      zipCode,
      phone,
      isDefault: !!isDefault
    };

    if (isMockMode) {
      const user = localDb.findById('users', req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      const addresses = user.addresses || [];
      if (newAddress.isDefault) {
        addresses.forEach((addr: any) => addr.isDefault = false);
      }
      // Add manual ID for addresses in mock mode
      const addedAddress = {
        _id: Math.random().toString(36).substring(2, 9),
        ...newAddress
      };
      addresses.push(addedAddress);
      
      updatedUser = localDb.findByIdAndUpdate('users', req.user.id, { addresses });
    } else {
      const user = await User.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      if (newAddress.isDefault) {
        user.addresses.forEach((addr: any) => addr.isDefault = false);
      }
      user.addresses.push(newAddress);
      updatedUser = await user.save();
    }

    res.json({ addresses: updatedUser.addresses });
  } catch (error) {
    res.status(500).json({ error: 'Server address addition error' });
  }
};

// @desc    Delete address
// @route   DELETE /api/auth/addresses/:addressId
export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { addressId } = req.params;
  if (!req.user) {
    res.status(401).json({ error: 'Not authorized' });
    return;
  }

  try {
    let updatedUser: any;

    if (isMockMode) {
      const user = localDb.findById('users', req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      const addresses = (user.addresses || []).filter((a: any) => a._id !== addressId && a.id !== addressId);
      updatedUser = localDb.findByIdAndUpdate('users', req.user.id, { addresses });
    } else {
      const user = await User.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      user.addresses = user.addresses.filter((a: any) => a.id !== addressId && a._id.toString() !== addressId);
      updatedUser = await user.save();
    }

    res.json({ addresses: updatedUser.addresses });
  } catch (error) {
    res.status(500).json({ error: 'Server address removal error' });
  }
};

// @desc    Toggle wishlist item (Add or Remove)
// @route   POST /api/auth/wishlist
export const toggleWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.body;
  if (!req.user) {
    res.status(401).json({ error: 'Not authorized' });
    return;
  }

  try {
    let updatedUser: any;

    if (isMockMode) {
      const user = localDb.findById('users', req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      let wishlist: string[] = user.wishlist || [];
      if (wishlist.includes(productId)) {
        wishlist = wishlist.filter(id => id !== productId);
      } else {
        wishlist.push(productId);
      }
      updatedUser = localDb.findByIdAndUpdate('users', req.user.id, { wishlist });
    } else {
      const user = await User.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      const pIndex = user.wishlist.indexOf(productId);
      if (pIndex > -1) {
        user.wishlist.splice(pIndex, 1);
      } else {
        user.wishlist.push(productId);
      }
      updatedUser = await user.save();
    }

    res.json({ wishlist: updatedUser.wishlist });
  } catch (error) {
    res.status(500).json({ error: 'Server wishlist toggle error' });
  }
};
