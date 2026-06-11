import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
  minPurchase: number;
  expiryDate: Date;
  active: boolean;
}

const CouponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true, index: true },
  discountType: { type: String, enum: ['PERCENT', 'FLAT'], required: true },
  discountValue: { type: Number, required: true },
  minPurchase: { type: Number, default: 0 },
  expiryDate: { type: Date, required: true },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
