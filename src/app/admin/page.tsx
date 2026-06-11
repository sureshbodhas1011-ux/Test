'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import {
  ShieldAlert,
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  ListOrdered,
  LogOut,
  X,
  Star,
  CheckCircle,
  Truck,
  DollarSign,
  Compass
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

type AdminTab = 'analytics' | 'products' | 'categories' | 'orders' | 'customers';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  // Sidebar Tab state
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');

  // Load States
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Data States
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  // Product CRUD Form Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editProductId, setEditProductId] = useState('');
  
  // Product Form Inputs
  const [prodTitle, setProdTitle] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscount, setProdDiscount] = useState('');
  const [prodImages, setProdImages] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodBestSeller, setProdBestSeller] = useState(false);
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodSpecs, setProdSpecs] = useState<Array<{ key: string; val: string }>>([]);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');
  const [productError, setProductError] = useState('');

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');
  const [categoryError, setCategoryError] = useState('');

  // Protect route
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      // do not redirect automatically to allow showing custom unauthorized panel with login helper
    }
  }, [user, authLoading]);

  // Load Analytics data
  const loadAnalytics = async () => {
    if (!user || user.role !== 'ADMIN') return;
    setLoadingAnalytics(true);
    try {
      const data = await api.getSalesAnalytics();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Load Products list
  const loadProductsList = async () => {
    setLoadingProducts(true);
    try {
      const data = await api.getProducts('limit=100');
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Load Categories list
  const loadCategoriesList = async () => {
    setLoadingCategories(true);
    try {
      const data = await api.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Load All Orders
  const loadAllOrdersList = async () => {
    setLoadingOrders(true);
    try {
      if (analyticsData) {
        setOrders(analyticsData.recentOrders || []);
      } else {
        const data = await api.getSalesAnalytics();
        setOrders(data.recentOrders || []);
      }
    } catch (err) {
      console.error('Failed to load orders list:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    } else if (activeTab === 'products') {
      loadProductsList();
      loadCategoriesList();
    } else if (activeTab === 'categories') {
      loadCategoriesList();
    } else if (activeTab === 'orders') {
      loadAnalytics(); // loads orders through analytics recentOrders/allOrders
    } else if (activeTab === 'customers') {
      loadCustomersList();
    }
  }, [activeTab]);

  const loadCustomersList = async () => {
    setLoadingCustomers(true);
    try {
      const data = await api.getUsers();
      setCustomers(data || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Product CRUD Submissions
  const handleOpenProductModal = (mode: 'create' | 'edit', prod?: any) => {
    setProductError('');
    setModalMode(mode);
    
    if (mode === 'edit' && prod) {
      setEditProductId(prod._id || prod.id);
      setProdTitle(prod.title);
      setProdDesc(prod.description);
      setProdPrice(prod.price.toString());
      setProdDiscount(prod.discountPrice ? prod.discountPrice.toString() : '');
      setProdImages(prod.images.join(', '));
      setProdCategory(prod.category);
      setProdStock(prod.stock.toString());
      setProdBestSeller(prod.bestSeller);
      setProdFeatured(prod.featured);
      
      // Convert spec map to array
      const specsArr = Object.entries(prod.specifications || {}).map(([key, val]) => ({
        key,
        val: val as string
      }));
      setProdSpecs(specsArr);
    } else {
      setEditProductId('');
      setProdTitle('');
      setProdDesc('');
      setProdPrice('');
      setProdDiscount('');
      setProdImages('');
      setProdCategory('');
      setProdStock('');
      setProdBestSeller(false);
      setProdFeatured(false);
      setProdSpecs([]);
    }
    setShowProductModal(true);
  };

  const handleAddSpec = () => {
    if (!newSpecKey.trim() || !newSpecVal.trim()) return;
    setProdSpecs([...prodSpecs, { key: newSpecKey.trim(), val: newSpecVal.trim() }]);
    setNewSpecKey('');
    setNewSpecVal('');
  };

  const handleRemoveSpec = (idx: number) => {
    setProdSpecs(prodSpecs.filter((_, i) => i !== idx));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductError('');

    if (!prodTitle || !prodDesc || !prodPrice || !prodImages || !prodCategory || !prodStock) {
      setProductError('Please fill out all required fields.');
      return;
    }

    const imgArray = prodImages.split(',').map(img => img.trim()).filter(img => img.length > 0);
    if (imgArray.length === 0) {
      setProductError('Please enter at least one image URL.');
      return;
    }

    // Convert spec array to record
    const specifications: Record<string, string> = {};
    prodSpecs.forEach(spec => {
      specifications[spec.key] = spec.val;
    });

    const productData = {
      title: prodTitle,
      description: prodDesc,
      price: parseFloat(prodPrice),
      discountPrice: prodDiscount ? parseFloat(prodDiscount) : undefined,
      images: imgArray,
      category: prodCategory,
      stock: parseInt(prodStock, 10),
      specifications,
      bestSeller: prodBestSeller,
      featured: prodFeatured
    };

    try {
      if (modalMode === 'create') {
        await api.createProduct(productData);
      } else {
        await api.updateProduct(editProductId, productData);
      }
      setShowProductModal(false);
      loadProductsList();
      loadAnalytics();
    } catch (err: any) {
      setProductError(err.message || 'Failed to save product.');
    }
  };

  const handleDeleteProduct = async (pId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(pId);
        loadProductsList();
        loadAnalytics();
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  // Category Submissions
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError('');

    if (!catName || !catImage) {
      setCategoryError('Please enter category name and image URL.');
      return;
    }

    try {
      await api.createCategory({ name: catName.trim(), image: catImage.trim() });
      setCatName('');
      setCatImage('');
      loadCategoriesList();
    } catch (err: any) {
      setCategoryError(err.message || 'Failed to create category.');
    }
  };

  // Order Status updates
  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      loadAnalytics(); // reloads lists
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // User Role updates
  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    if (confirm(`Promote/Demote user role to ${nextRole}?`)) {
      try {
        await api.updateUserRole(userId, nextRole);
        loadCustomersList();
      } catch (err) {
        console.error('Failed to update user role:', err);
      }
    }
  };

  // Check auth roles
  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#09090b]">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500" />
        </div>
      </div>
    );
  }

  // Guard view if not Admin
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center py-12 px-6">
        <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-zinc-850 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-950/40 border border-rose-800 flex items-center justify-center mx-auto text-rose-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Access Denied</h2>
            <p className="text-zinc-550 text-sm leading-relaxed">
              Administrative permissions are required to access this console. Please sign in with an Admin account.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => router.push('/auth/login?redirect=/admin')}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition-all"
            >
              Sign In as Admin
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 py-3 rounded-xl text-sm transition-all"
            >
              Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Analytics helper calculations
  const metrics = analyticsData?.metrics || { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, averageOrderValue: 0 };
  const salesChartData = analyticsData?.salesChartData || [];
  const categorySalesData = analyticsData?.categorySalesData || [];
  const lowStockProducts = analyticsData?.lowStockProducts || [];
  const adminOrders = analyticsData?.recentOrders || [];

  // Colors for category sales pie chart
  const COLORS = ['#8b5cf6', '#6366f1', '#a78bfa', '#ec4899', '#f43f5e'];

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      
      {/* Top Banner header */}
      <header className="glass-navbar border-b border-zinc-900 px-6 py-4 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-650 flex items-center justify-center text-white font-black text-base shadow shadow-violet-500/25">
            V
          </span>
          <span className="font-extrabold text-lg tracking-tight text-white">VELOCE <span className="text-violet-400 font-normal text-xs uppercase tracking-widest pl-1">Admin</span></span>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="text-zinc-550 hidden sm:inline">Signed in: <strong className="text-zinc-350">{user.name}</strong></span>
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-rose-450 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* Workspace Area Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Admin Navigation Sidebar */}
        <aside className="lg:w-64 border-r border-zinc-900 bg-zinc-950/40 p-5 flex flex-col gap-2 font-semibold z-10">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left cursor-pointer ${
              activeTab === 'analytics' ? 'bg-violet-950/40 border border-violet-850 text-violet-400 font-bold' : 'text-zinc-455 hover:text-zinc-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Revenue Analytics
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left cursor-pointer ${
              activeTab === 'products' ? 'bg-violet-950/40 border border-violet-850 text-violet-400 font-bold' : 'text-zinc-455 hover:text-zinc-300'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Manage Products
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left cursor-pointer ${
              activeTab === 'categories' ? 'bg-violet-950/40 border border-violet-850 text-violet-400 font-bold' : 'text-zinc-455 hover:text-zinc-300'
            }`}
          >
            <FolderOpen className="w-4 h-4" /> Manage Categories
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left cursor-pointer ${
              activeTab === 'orders' ? 'bg-violet-950/40 border border-violet-850 text-violet-400 font-bold' : 'text-zinc-455 hover:text-zinc-300'
            }`}
          >
            <ListOrdered className="w-4 h-4" /> Order Requests
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left cursor-pointer ${
              activeTab === 'customers' ? 'bg-violet-950/40 border border-violet-850 text-violet-400 font-bold' : 'text-zinc-455 hover:text-zinc-300'
            }`}
          >
            <Users className="w-4 h-4" /> Customer Accounts
          </button>

          <hr className="border-zinc-900 my-4" />

          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-zinc-450 hover:text-white"
          >
            <Compass className="w-4 h-4" /> Visit Storefront
          </Link>
        </aside>

        {/* Content panel view switcher */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl">
          
          {/* TAB 1: ANALYTICS DASHBOARD */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-fadeIn text-left">
              <h2 className="text-2xl font-black text-white">Sales & Revenue Analytics 📈</h2>

              {loadingAnalytics ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-28 rounded-2xl bg-zinc-900 animate-pulse border border-zinc-850" />
                  ))}
                </div>
              ) : (
                /* Analytics cards metrics */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="glass-card p-5 rounded-2xl border border-zinc-850 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-550 uppercase tracking-wider font-bold">Total Revenue</span>
                      <h3 className="text-2xl font-black text-white">₹{metrics.totalRevenue.toLocaleString('en-IN')}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-violet-950/40 border border-violet-800 flex items-center justify-center text-violet-400">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="glass-card p-5 rounded-2xl border border-zinc-850 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-550 uppercase tracking-wider font-bold">Total Orders</span>
                      <h3 className="text-2xl font-black text-white">{metrics.totalOrders}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-violet-950/40 border border-violet-800 flex items-center justify-center text-violet-400">
                      <ListOrdered className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="glass-card p-5 rounded-2xl border border-zinc-850 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-550 uppercase tracking-wider font-bold">Average Ticket</span>
                      <h3 className="text-2xl font-black text-white">₹{Math.round(metrics.averageOrderValue).toLocaleString('en-IN')}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-violet-950/40 border border-violet-800 flex items-center justify-center text-violet-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="glass-card p-5 rounded-2xl border border-zinc-850 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-550 uppercase tracking-wider font-bold">Total Customers</span>
                      <h3 className="text-2xl font-black text-white">{metrics.totalCustomers}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-violet-950/40 border border-violet-800 flex items-center justify-center text-violet-400">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Charts section */}
              {!loadingAnalytics && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Revenue timeline Area chart - Col Span 8 */}
                  <div className="lg:col-span-8 glass-card p-6 rounded-2xl border border-zinc-850 space-y-4">
                    <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Revenue Trend (Last 6 Months)</h4>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                          <XAxis dataKey="month" stroke="#71717a" fontSize={10} />
                          <YAxis stroke="#71717a" fontSize={10} />
                          <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} />
                          <Area type="monotone" dataKey="sales" name="Revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Category sales pie chart - Col Span 4 */}
                  <div className="lg:col-span-4 glass-card p-6 rounded-2xl border border-zinc-850 space-y-4">
                    <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Revenue by Category</h4>
                    <div className="h-[280px] flex flex-col justify-center items-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categorySalesData.length > 0 ? categorySalesData : [{ name: 'None', value: 1 }]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categorySalesData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => value ? `₹${Number(value).toLocaleString('en-IN')}` : ''} />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Legend */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center text-[10px] text-zinc-400 mt-2">
                        {categorySalesData.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <span>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Inventory Warning Alerts - Col Span 6 */}
                  <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-zinc-850 space-y-4">
                    <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
                      <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" /> Low Stock Alerts
                    </h4>
                    <div className="divide-y divide-zinc-900 border-t border-b border-zinc-900/60 max-h-[220px] overflow-y-auto pr-1">
                      {lowStockProducts.length > 0 ? (
                        lowStockProducts.map((prod: any) => (
                          <div key={prod.id} className="flex justify-between items-center py-2.5 text-xs">
                            <div className="text-left max-w-sm min-w-0">
                              <strong className="text-white block truncate">{prod.title}</strong>
                              <span className="text-[10px] text-zinc-550 uppercase">Category: {prod.category}</span>
                            </div>
                            <span className="bg-amber-950/40 border border-amber-900 text-amber-450 font-bold px-2 py-0.5 rounded text-[10px]">
                              {prod.stock} left
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-500 py-6 text-center text-xs">All products have sufficient stock levels.</p>
                      )}
                    </div>
                  </div>

                  {/* Recent Order list - Col Span 6 */}
                  <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-zinc-850 space-y-4">
                    <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Recent Order Requests</h4>
                    <div className="divide-y divide-zinc-900 border-t border-b border-zinc-900/60 max-h-[220px] overflow-y-auto pr-1">
                      {adminOrders.length > 0 ? (
                        adminOrders.map((ord: any) => (
                          <div key={ord.id} className="flex justify-between items-center py-2.5 text-xs">
                            <div className="text-left">
                              <strong className="text-white block">{ord.customerName}</strong>
                              <span className="text-[10px] text-zinc-550">{new Date(ord.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-4 items-center">
                              <strong className="text-white">₹{ord.total.toLocaleString()}</strong>
                              <span className={`text-[10px] font-bold uppercase ${
                                ord.status === 'DELIVERED' ? 'text-emerald-400' : 'text-amber-400'
                              }`}>
                                {ord.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-500 py-6 text-center text-xs">No orders placed recently.</p>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT CRUD */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fadeIn text-left">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-white">Manage Product Catalog 🛍️</h2>
                  <p className="text-zinc-550 text-xs mt-0.5">Add, edit, update inventory, and manage pricing tags.</p>
                </div>
                <button
                  onClick={() => handleOpenProductModal('create')}
                  className="inline-flex items-center gap-1.5 bg-violet-650 hover:bg-violet-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create Product
                </button>
              </div>

              {loadingProducts ? (
                <div className="h-96 rounded-2xl bg-zinc-900 animate-pulse border border-zinc-850" />
              ) : products.length > 0 ? (
                /* Product lists table */
                <div className="rounded-2xl border border-zinc-900 bg-zinc-950/20 overflow-x-auto shadow-md">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-900/60 border-b border-zinc-900 text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                        <th className="p-4">Product Info</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Inventory</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {products.map((prod) => (
                        <tr key={prod._id} className="hover:bg-zinc-900/20 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img src={prod.images[0]} alt={prod.title} className="w-9 h-9 rounded-lg object-cover bg-zinc-900 border border-zinc-850" />
                            <div className="min-w-0 max-w-xs">
                              <strong className="text-white block truncate">{prod.title}</strong>
                              <span className="text-[9px] text-zinc-550">ID: {prod._id.substring(0, 8)}...</span>
                            </div>
                          </td>
                          <td className="p-4 text-zinc-350">{prod.category}</td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              {prod.discountPrice ? (
                                <>
                                  <span className="text-white font-bold">₹{prod.discountPrice.toLocaleString()}</span>
                                  <span className="text-zinc-650 line-through text-[10px]">₹{prod.price.toLocaleString()}</span>
                                </>
                              ) : (
                                <span className="text-white font-bold">₹{prod.price.toLocaleString()}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                              prod.stock <= 5 ? 'bg-amber-950/40 text-amber-400 border border-amber-900/50' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                            }`}>
                              {prod.stock} units
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenProductModal('edit', prod)}
                                className="p-1.5 border border-zinc-850 bg-zinc-900/40 rounded-lg text-zinc-400 hover:text-violet-400 hover:border-violet-800 transition-all cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod._id)}
                                className="p-1.5 border border-zinc-850 bg-zinc-900/40 rounded-lg text-zinc-400 hover:text-rose-450 hover:border-rose-900 transition-all cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 border border-zinc-900 rounded-2xl text-zinc-550 text-sm">No products in database. Click Create Product to add.</div>
              )}
            </div>
          )}

          {/* TAB 3: CATEGORY MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-fadeIn">
              
              {/* Category creation form - Col Span 4 */}
              <div className="lg:col-span-4 glass-card p-6 rounded-2xl border border-zinc-850 h-fit space-y-4">
                <h3 className="font-extrabold text-white text-base">Add New Category</h3>
                
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold block">Category Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Smart Electronics"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold block">Banner Image URL</label>
                    <input
                      type="text"
                      required
                      placeholder="https://images.unsplash.com/..."
                      value={catImage}
                      onChange={(e) => setCatImage(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                    />
                  </div>

                  {categoryError && <p className="text-xs text-rose-400 font-semibold">{categoryError}</p>}

                  <button
                    type="submit"
                    className="w-full bg-violet-650 hover:bg-violet-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg transition-colors cursor-pointer"
                  >
                    Save Category
                  </button>
                </form>
              </div>

              {/* Category list display - Col Span 8 */}
              <div className="lg:col-span-8 glass-card p-6 rounded-2xl border border-zinc-850 space-y-4">
                <h3 className="font-extrabold text-white text-base">Active Product Categories</h3>
                
                {loadingCategories ? (
                  <div className="h-64 rounded-xl bg-zinc-900 animate-pulse border border-zinc-850" />
                ) : categories.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categories.map((c) => (
                      <div
                        key={c._id}
                        className="relative h-28 rounded-xl overflow-hidden border border-zinc-900 flex items-center p-4 text-left"
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `linear-gradient(to right, rgba(9, 9, 11, 0.95) 40%, rgba(9, 9, 11, 0.3) 100%), url(${c.image})`
                          }}
                        />
                        <div className="relative z-10 space-y-0.5">
                          <strong className="text-white text-sm block">{c.name}</strong>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Slug: {c.slug}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-550 py-10 text-center text-sm">No categories defined yet.</p>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: ORDER DISPATCH MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fadeIn text-left">
              <div>
                <h2 className="text-2xl font-black text-white">Manage Order Dispatches 📦</h2>
                <p className="text-zinc-550 text-xs mt-0.5">Dispatch packages, change billing states, and update tracking timelines.</p>
              </div>

              {loadingAnalytics ? (
                <div className="h-96 rounded-2xl bg-zinc-900 animate-pulse border border-zinc-850" />
              ) : adminOrders.length > 0 ? (
                <div className="rounded-2xl border border-zinc-900 bg-zinc-950/20 overflow-x-auto shadow">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-900/60 border-b border-zinc-900 text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                        <th className="p-4">Order Details</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Quick Action Dispatch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {adminOrders.map((ord: any) => (
                        <tr key={ord.id} className="hover:bg-zinc-900/20 transition-colors">
                          <td className="p-4">
                            <span className="text-[9px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded font-bold">
                              ID: {ord.id.substring(0, 8)}...
                            </span>
                            <span className="text-[10px] text-zinc-550 block pt-1.5">Placed: {new Date(ord.date).toLocaleDateString()}</span>
                          </td>
                          <td className="p-4 text-zinc-350">{ord.customerName}</td>
                          <td className="p-4 font-bold text-white">₹{ord.total.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`font-bold uppercase ${
                              ord.status === 'DELIVERED' ? 'text-emerald-400' : ord.status === 'CANCELLED' ? 'text-rose-455' : 'text-amber-400'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {ord.status !== 'DELIVERED' && ord.status !== 'CANCELLED' ? (
                              <div className="flex justify-center gap-2">
                                {ord.status === 'PENDING' && (
                                  <button
                                    onClick={() => handleUpdateStatus(ord.id, 'PROCESSING')}
                                    className="px-3 py-1 bg-violet-650/10 hover:bg-violet-650/20 text-violet-400 border border-violet-900/50 font-bold rounded-lg text-[10px] cursor-pointer"
                                  >
                                    Accept Pack
                                  </button>
                                )}
                                {ord.status === 'PROCESSING' && (
                                  <button
                                    onClick={() => handleUpdateStatus(ord.id, 'SHIPPED')}
                                    className="px-3 py-1 bg-indigo-650/10 hover:bg-indigo-650/20 text-indigo-450 border border-indigo-900/50 font-bold rounded-lg text-[10px] cursor-pointer"
                                  >
                                    Dispatch Ship
                                  </button>
                                )}
                                {ord.status === 'SHIPPED' && (
                                  <button
                                    onClick={() => handleUpdateStatus(ord.id, 'DELIVERED')}
                                    className="px-3 py-1 bg-emerald-650/10 hover:bg-emerald-650/20 text-emerald-400 border border-emerald-900/50 font-bold rounded-lg text-[10px] cursor-pointer"
                                  >
                                    Deliver Order
                                  </button>
                                )}
                                <button
                                  onClick={() => handleUpdateStatus(ord.id, 'CANCELLED')}
                                  className="px-2.5 py-1 text-[10px] border border-zinc-850 hover:bg-zinc-900 text-zinc-550 hover:text-rose-400 rounded-lg cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <span className="text-zinc-550 text-[10px]">Order Finalized</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 border border-zinc-900 rounded-2xl text-zinc-550 text-sm">No orders recorded in database.</div>
              )}
            </div>
          )}

          {/* TAB 5: CUSTOMER ACCOUNT MANAGER */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-fadeIn text-left">
              <div>
                <h2 className="text-2xl font-black text-white">Customer Accounts Directory 👥</h2>
                <p className="text-zinc-550 text-xs mt-0.5">View user spend tracking, active orders count, and promote administrator privileges.</p>
              </div>

              {loadingCustomers ? (
                <div className="h-96 rounded-2xl bg-zinc-900 animate-pulse border border-zinc-850" />
              ) : customers.length > 0 ? (
                <div className="rounded-2xl border border-zinc-900 bg-zinc-950/20 overflow-x-auto shadow">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-900/60 border-b border-zinc-900 text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                        <th className="p-4">Customer Name</th>
                        <th className="p-4">Email Address</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Orders Placed</th>
                        <th className="p-4 text-center">Promote/Demote Access</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {customers.map((c: any) => (
                        <tr key={c.id} className="hover:bg-zinc-900/20 transition-colors">
                          <td className="p-4 font-bold text-white">{c.name}</td>
                          <td className="p-4 text-zinc-350">{c.email}</td>
                          <td className="p-4">
                            <span className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                              c.role === 'ADMIN' ? 'bg-violet-950 border border-violet-900 text-violet-400' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                            }`}>
                              {c.role}
                            </span>
                          </td>
                          <td className="p-4 text-zinc-350 font-medium">{c.orderCount} orders placed</td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleToggleUserRole(c.id, c.role)}
                              className="px-3 py-1.5 border border-zinc-800 hover:bg-zinc-900 text-[10px] font-bold text-zinc-300 rounded-lg cursor-pointer"
                            >
                              Toggle Admin Status
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-zinc-550 py-10 text-center text-sm">No customers registered in database.</p>
              )}
            </div>
          )}

        </main>
      </div>

      {/* 5. Product CRUD Form Modal Editor */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn p-4 overflow-y-auto">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowProductModal(false)} />
          
          {/* Modal Panel content */}
          <div className="relative w-full max-w-2xl bg-[#09090b] border border-zinc-850 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto z-10 animate-scaleUp">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-violet-400" />
                {modalMode === 'create' ? 'Create Product Listing' : 'Edit Product Details'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="p-1 text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form inputs */}
            <form onSubmit={handleSaveProduct} className="space-y-5 flex-1 text-left">
              
              {/* Product Title */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold block">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AcoustiMax Active Wireless Headphones"
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold block">Detailed Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summarize product characteristics, warranty, sizing, etc..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-lg text-xs resize-none"
                />
              </div>

              {/* Pricing, Discount, Category, Stock grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold block">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="9999"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold block">Discounted Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 7999"
                    value={prodDiscount}
                    onChange={(e) => setProdDiscount(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold block">Category Name</label>
                  <select
                    value={prodCategory}
                    required
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-lg text-xs bg-zinc-900 border-zinc-800 cursor-pointer"
                  >
                    <option value="">Choose category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold block">Stock Inventory</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Images URL (comma separated) */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold block">Images URLs (comma separated)</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/1, https://images.unsplash.com/2"
                  value={prodImages}
                  onChange={(e) => setProdImages(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                />
              </div>

              {/* Toggles features */}
              <div className="flex gap-6 text-xs text-zinc-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodBestSeller}
                    onChange={(e) => setProdBestSeller(e.target.checked)}
                    className="rounded border-zinc-800 bg-zinc-900 text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Tag as Best Seller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodFeatured}
                    onChange={(e) => setProdFeatured(e.target.checked)}
                    className="rounded border-zinc-800 bg-zinc-900 text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Tag as Featured drop</span>
                </label>
              </div>

              {/* Specifications builder */}
              <div className="space-y-3.5 border border-zinc-850 p-4 rounded-2xl bg-zinc-950/20">
                <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-black block">Specifications Attribute Builder</span>
                
                {/* Inputs to add specs */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Spec Name (e.g. Weight)"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    className="flex-1 glass-input px-3 py-2 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Spec Value (e.g. 240 grams)"
                    value={newSpecVal}
                    onChange={(e) => setNewSpecVal(e.target.value)}
                    className="flex-1 glass-input px-3 py-2 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Specs list */}
                {prodSpecs.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    {prodSpecs.map((spec, index) => (
                      <div key={index} className="flex justify-between items-center bg-zinc-900/40 border border-zinc-900 px-3 py-1.5 rounded-lg">
                        <span className="truncate max-w-[100px]"><strong className="text-zinc-500">{spec.key}:</strong> <span className="text-zinc-300">{spec.val}</span></span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(index)}
                          className="text-zinc-600 hover:text-rose-400 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {productError && <p className="text-xs text-rose-400 font-semibold">{productError}</p>}

              {/* Bottom CTAs */}
              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 text-xs border border-zinc-850 rounded-xl text-zinc-400 hover:bg-zinc-900"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs bg-violet-650 hover:bg-violet-600 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
