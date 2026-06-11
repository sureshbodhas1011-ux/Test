import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IPaymentDetails {
  method: 'CARD' | 'UPI' | 'COD';
  status: 'PAID' | 'PENDING' | 'FAILED';
  transactionId?: string;
}

export interface IOrderTimeline {
  status: string;
  message: string;
  timestamp: string;
}

export interface IOrder extends Document {
  userId: string;
  orderItems: IOrderItem[];
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  paymentDetails: IPaymentDetails;
  pricing: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
  };
  orderStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  trackingTimeline: IOrderTimeline[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true }
});

const OrderSchema = new Schema<IOrder>({
  userId: { type: String, required: true, index: true },
  orderItems: [OrderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    phone: { type: String, required: true }
  },
  paymentDetails: {
    method: { type: String, enum: ['CARD', 'UPI', 'COD'], required: true },
    status: { type: String, enum: ['PAID', 'PENDING', 'FAILED'], default: 'PENDING' },
    transactionId: { type: String }
  },
  pricing: {
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  orderStatus: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING'
  },
  trackingTimeline: [
    {
      status: { type: String, required: true },
      message: { type: String, required: true },
      timestamp: { type: String, required: true }
    }
  ]
}, {
  timestamps: true
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
