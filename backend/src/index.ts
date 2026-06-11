import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';

// Route imports
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import couponRoutes from './routes/couponRoutes';
import reviewRoutes from './routes/reviewRoutes';
import adminRoutes from './routes/adminRoutes';

// Load environment configurations
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database connection (MongoDB / Fallback JSON DB)
connectDB();

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Diagnostic status endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    databaseMode: require('./config/db').isMockMode ? 'Local JSON DB Fallback' : 'MongoDB Production'
  });
});

// Register api routers
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({
    error: 'Internal server error occurred.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Express Listener
app.listen(PORT, () => {
  console.log(`🚀 E-Commerce Server online and listening on http://localhost:${PORT}`);
});

export default app;
