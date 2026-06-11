import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  stock: number;
  specifications: Record<string, string>;
  ratingsAvg: number;
  reviewCount: number;
  bestSeller: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  images: [{ type: String, required: true }],
  category: { type: String, required: true, index: true },
  stock: { type: Number, required: true, default: 0 },
  specifications: { type: Map, of: String, default: {} },
  ratingsAvg: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  bestSeller: { type: Boolean, default: false },
  featured: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
