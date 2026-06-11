import { Request, Response } from 'express';
import { isMockMode, localDb } from '../config/db';
import Coupon from '../models/Coupon';
import { AuthRequest } from '../middleware/auth';

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  const { code, cartSubtotal } = req.body;

  if (!code) {
    res.status(400).json({ error: 'Please enter a coupon code' });
    return;
  }

  try {
    let coupon: any;
    if (isMockMode) {
      coupon = localDb.findOne('coupons', c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    } else {
      coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    }

    if (!coupon) {
      res.status(400).json({ error: 'Invalid or inactive coupon code' });
      return;
    }

    // Check expiry
    if (new Date(coupon.expiryDate).getTime() < Date.now()) {
      res.status(400).json({ error: 'Coupon code has expired' });
      return;
    }

    // Check minimum purchase amount
    const subtotal = parseFloat(cartSubtotal) || 0;
    if (subtotal < coupon.minPurchase) {
      res.status(400).json({ error: `Minimum purchase of ₹${coupon.minPurchase} is required for this coupon` });
      return;
    }

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    });
  } catch (error) {
    res.status(500).json({ error: 'Server coupon validation error' });
  }
};

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
export const getCoupons = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let coupons: any[];
    if (isMockMode) {
      coupons = localDb.find('coupons');
    } else {
      coupons = await Coupon.find();
    }
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: 'Server coupons fetch error' });
  }
};

// @desc    Create a new coupon (Admin)
// @route   POST /api/coupons
export const createCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  const { code, discountType, discountValue, minPurchase, expiryDate } = req.body;

  if (!code || !discountType || !discountValue || !expiryDate) {
    res.status(400).json({ error: 'Please enter all coupon details' });
    return;
  }

  try {
    const couponData = {
      code: code.toUpperCase(),
      discountType,
      discountValue: parseFloat(discountValue),
      minPurchase: parseFloat(minPurchase) || 0,
      expiryDate: new Date(expiryDate),
      active: true
    };

    let newCoupon: any;
    if (isMockMode) {
      const exists = !!localDb.findOne('coupons', c => c.code === code.toUpperCase());
      if (exists) {
        res.status(400).json({ error: 'Coupon code already exists' });
        return;
      }
      newCoupon = localDb.create('coupons', couponData);
    } else {
      const exists = await Coupon.findOne({ code: code.toUpperCase() });
      if (exists) {
        res.status(400).json({ error: 'Coupon code already exists' });
        return;
      }
      const couponDoc = new Coupon(couponData);
      newCoupon = await couponDoc.save();
    }

    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(500).json({ error: 'Server coupon creation error' });
  }
};
