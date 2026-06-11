import { Response } from 'express';
import { isMockMode, localDb } from '../config/db';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// @desc    Create a new order
// @route   POST /api/orders
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderItems, shippingAddress, paymentDetails, pricing } = req.body;

  if (!req.user) {
    res.status(401).json({ error: 'Not authorized' });
    return;
  }

  if (!orderItems || orderItems.length === 0) {
    res.status(400).json({ error: 'No order items provided' });
    return;
  }

  try {
    // 1. Validate Stock and Update Inventory
    for (const item of orderItems) {
      if (isMockMode) {
        const prod = localDb.findById('products', item.productId);
        if (!prod) {
          res.status(404).json({ error: `Product not found: ${item.title}` });
          return;
        }
        if (prod.stock < item.quantity) {
          res.status(400).json({ error: `Insufficient stock for product: ${item.title}` });
          return;
        }
        // Deduct stock
        localDb.findByIdAndUpdate('products', item.productId, { stock: prod.stock - item.quantity });
      } else {
        const prod = await Product.findById(item.productId);
        if (!prod) {
          res.status(404).json({ error: `Product not found: ${item.title}` });
          return;
        }
        if (prod.stock < item.quantity) {
          res.status(400).json({ error: `Insufficient stock for product: ${item.title}` });
          return;
        }
        // Deduct stock
        prod.stock -= item.quantity;
        await prod.save();
      }
    }

    // 2. Build Order Timeline
    const initialTimeline = [
      {
        status: 'Order Placed',
        message: 'Your order has been placed and is awaiting confirmation.',
        timestamp: new Date().toISOString()
      }
    ];

    const orderData = {
      userId: req.user.id,
      orderItems,
      shippingAddress,
      paymentDetails: {
        ...paymentDetails,
        status: paymentDetails.method === 'COD' ? 'PENDING' : 'PAID'
      },
      pricing,
      orderStatus: 'PENDING' as const,
      trackingTimeline: initialTimeline
    };

    let newOrder: any;
    if (isMockMode) {
      newOrder = localDb.create('orders', orderData);
    } else {
      const orderDoc = new Order(orderData);
      newOrder = await orderDoc.save();
    }

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Server order creation error' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authorized' });
    return;
  }

  try {
    let orders: any[];
    if (isMockMode) {
      orders = localDb.find('orders', o => o.userId === req.user!.id);
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server orders fetch error' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!req.user) {
    res.status(401).json({ error: 'Not authorized' });
    return;
  }

  try {
    let order: any;
    if (isMockMode) {
      order = localDb.findById('orders', id);
    } else {
      order = await Order.findById(id);
    }

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // User must be creator of the order OR an Admin
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized to view this order' });
      return;
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server order fetch error' });
  }
};

// @desc    Update order status & add timeline updates (Admin)
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, message } = req.body; // e.g. status = "SHIPPED", message = "Order handed over to shipping partner"

  if (!status) {
    res.status(400).json({ error: 'Please provide status' });
    return;
  }

  try {
    let order: any;
    if (isMockMode) {
      order = localDb.findById('orders', id);
    } else {
      order = await Order.findById(id);
    }

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Build standard default messages if not custom
    let timelineMessage = message || '';
    if (!timelineMessage) {
      if (status === 'PROCESSING') timelineMessage = 'Your order is being packed and prepared.';
      else if (status === 'SHIPPED') timelineMessage = 'Your order has been shipped and is on its way.';
      else if (status === 'DELIVERED') timelineMessage = 'Your order has been delivered. Thank you for shopping!';
      else if (status === 'CANCELLED') timelineMessage = 'Your order has been cancelled.';
      else timelineMessage = `Status updated to ${status}.`;
    }

    const newTimelineItem = {
      status: status.charAt(0) + status.slice(1).toLowerCase(),
      message: timelineMessage,
      timestamp: new Date().toISOString()
    };

    const trackingTimeline = [...(order.trackingTimeline || []), newTimelineItem];
    const updatePayload: any = {
      orderStatus: status,
      trackingTimeline
    };

    // If order is delivered, auto-mark payment as PAID
    if (status === 'DELIVERED') {
      updatePayload['paymentDetails.status'] = 'PAID';
      updatePayload.paymentDetails = {
        ...order.paymentDetails,
        status: 'PAID'
      };
    }

    let updatedOrder: any;
    if (isMockMode) {
      updatedOrder = localDb.findByIdAndUpdate('orders', id, updatePayload);
    } else {
      updatedOrder = await Order.findByIdAndUpdate(id, { $set: updatePayload }, { new: true });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Server order status update error' });
  }
};

// @desc    Get Sales Analytics and Dashboard metrics (Admin)
// @route   GET /api/orders/admin/analytics
export const getSalesAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let orders: any[] = [];
    let products: any[] = [];
    let users: any[] = [];

    if (isMockMode) {
      orders = localDb.find('orders');
      products = localDb.find('products');
      users = localDb.find('users');
    } else {
      orders = await Order.find();
      products = await Product.find();
      users = await User.find();
    }

    // 1. Calculate General Metrics
    const totalOrders = orders.length;
    const totalCustomers = users.filter(u => u.role === 'CUSTOMER').length;
    const totalRevenue = orders
      .filter(o => o.orderStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + o.pricing.total, 0);

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // 2. Inventory tracking (low stock items < 5)
    const lowStockProducts = products.filter(p => p.stock <= 5).map(p => ({
      id: p._id || p.id,
      title: p.title,
      stock: p.stock,
      category: p.category
    }));

    // 3. Sales chart timeline (aggregating sales by month/date)
    // For mock dashboard, let's group by month
    const monthlySalesMap: Record<string, { month: string; sales: number; orders: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months
    const currentMonthIndex = new Date().getMonth();
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12;
      monthlySalesMap[months[idx]] = { month: months[idx], sales: 0, orders: 0 };
    }

    orders.forEach(o => {
      if (o.orderStatus !== 'CANCELLED') {
        const orderDate = new Date(o.createdAt);
        const m = months[orderDate.getMonth()];
        if (monthlySalesMap[m]) {
          monthlySalesMap[m].sales += o.pricing.total;
          monthlySalesMap[m].orders += 1;
        }
      }
    });

    const salesChartData = Object.values(monthlySalesMap);

    // 4. Sales by category chart
    const categorySalesMap: Record<string, number> = {};
    orders.forEach(o => {
      if (o.orderStatus !== 'CANCELLED') {
        o.orderItems.forEach((item: any) => {
          // Find category of product (fallback to 'Miscellaneous')
          const prod = products.find(p => (p._id || p.id) === item.productId);
          const cat = prod ? prod.category : 'Miscellaneous';
          categorySalesMap[cat] = (categorySalesMap[cat] || 0) + (item.price * item.quantity);
        });
      }
    });

    const categorySalesData = Object.keys(categorySalesMap).map(name => ({
      name,
      value: categorySalesMap[name]
    }));

    // 5. Recent orders lists
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(o => {
        const user = users.find(u => (u._id || u.id) === o.userId);
        return {
          id: o._id || o.id,
          customerName: user ? user.name : 'Guest Customer',
          total: o.pricing.total,
          status: o.orderStatus,
          date: o.createdAt
        };
      });

    res.json({
      metrics: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        averageOrderValue
      },
      salesChartData,
      categorySalesData,
      lowStockProducts,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ error: 'Server sales analytics error' });
  }
};
