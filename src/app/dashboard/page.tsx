'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { useAuth, IUserAddress } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { api } from '@/services/api';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Lock,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  Compass,
  Package,
  Calendar,
  AlertCircle
} from 'lucide-react';

type DashboardTab = 'profile' | 'orders' | 'addresses' | 'wishlist';

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderDetail {
  _id: string;
  createdAt: string;
  orderStatus: string;
  pricing: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
  };
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  paymentDetails: {
    method: string;
    status: string;
    transactionId?: string;
  };
  orderItems: OrderItem[];
  trackingTimeline: Array<{
    status: string;
    message: string;
    timestamp: string;
  }>;
}

export default function UserDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser, logout } = useAuth();
  const { addToCart, wishlist, toggleWishlist } = useCart();

  // Selected Tab state
  const [activeTab, setActiveTab] = useState<DashboardTab>('profile');

  // Profile Form state
  const [profileName, setProfileName] = useState('');
  const [profilePass, setProfilePass] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Address Form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [addressError, setAddressError] = useState('');

  // Orders lists state
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Wishlist products state
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/dashboard');
    } else if (user) {
      setProfileName(user.name);
    }
  }, [user, authLoading]);

  // Load orders when orders tab is active
  useEffect(() => {
    async function loadOrders() {
      if (!user || activeTab !== 'orders') return;
      try {
        const orderData = await api.getMyOrders();
        setOrders(orderData || []);
      } catch (err) {
        console.error('Failed to load user orders:', err);
      }
    }
    loadOrders();
  }, [user, activeTab]);

  // Load wishlist products details when wishlist tab is active
  useEffect(() => {
    async function loadWishlistItems() {
      if (!user || activeTab !== 'wishlist') return;
      setLoadingWishlist(true);
      try {
        const items = [];
        for (const pId of wishlist) {
          try {
            const p = await api.getProduct(pId);
            if (p) items.push(p);
          } catch (e) {
            // product might have been deleted, clean up silently
          }
        }
        setWishlistProducts(items);
      } catch (err) {
        console.error('Failed to load wishlist items details:', err);
      } finally {
        setLoadingWishlist(false);
      }
    }
    loadWishlistItems();
  }, [user, activeTab, wishlist]);

  // Actions
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);

    if (!profileName.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }

    try {
      const payload: any = { name: profileName.trim() };
      if (profilePass) {
        if (profilePass.length < 6) {
          setProfileError('Password must be at least 6 characters.');
          return;
        }
        payload.password = profilePass;
      }

      await api.updateProfile(payload);
      setProfileSuccess(true);
      setProfilePass('');
      await refreshUser();
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.');
    }
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError('');

    if (!fullName || !street || !city || !state || !zipCode || !phone) {
      setAddressError('Please fill out all address fields.');
      return;
    }

    try {
      const addressData = {
        fullName,
        street,
        city,
        state,
        zipCode,
        phone,
        isDefault: user?.addresses.length === 0
      };

      await api.addAddress(addressData);
      await refreshUser();
      
      // Reset address form
      setFullName('');
      setStreet('');
      setCity('');
      setState('');
      setZipCode('');
      setPhone('');
      setShowAddressForm(false);
    } catch (err: any) {
      setAddressError(err.message || 'Failed to add address.');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await api.deleteAddress(addressId);
      await refreshUser();
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const handleWishlistToCart = (prod: any) => {
    addToCart({
      productId: prod._id || prod.id,
      title: prod.title,
      price: prod.price,
      discountPrice: prod.discountPrice,
      image: prod.images[0],
      stock: prod.stock
    });
    toggleWishlist(prod._id || prod.id, true); // remove from wishlist
  };

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  if (authLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-[#09090b]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full text-left">
        <h1 className="text-3xl font-black text-white mb-8">User Dashboard 📊</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar Menu - Col Span 3 */}
          <aside className="lg:col-span-3 glass-card p-5 rounded-2xl border border-zinc-850 space-y-4 text-left">
            <div className="pb-4 border-b border-zinc-900">
              <strong className="text-white text-base block truncate">{user.name}</strong>
              <span className="text-xs text-zinc-500 truncate block">{user.email}</span>
            </div>

            <div className="flex flex-col gap-2 font-semibold">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                  activeTab === 'profile' ? 'bg-violet-950/40 border border-violet-850 text-violet-400 font-bold' : 'text-zinc-400 hover:text-zinc-300'
                }`}
              >
                <User className="w-4 h-4" /> Account Details
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                  activeTab === 'orders' ? 'bg-violet-950/40 border border-violet-850 text-violet-400 font-bold' : 'text-zinc-400 hover:text-zinc-300'
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> Order History
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                  activeTab === 'addresses' ? 'bg-violet-950/40 border border-violet-850 text-violet-400 font-bold' : 'text-zinc-400 hover:text-zinc-300'
                }`}
              >
                <MapPin className="w-4 h-4" /> Saved Addresses
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                  activeTab === 'wishlist' ? 'bg-violet-950/40 border border-violet-850 text-violet-400 font-bold' : 'text-zinc-400 hover:text-zinc-300'
                }`}
              >
                <Heart className="w-4 h-4" /> My Wishlist ({wishlist.length})
              </button>
              
              <button
                onClick={logout}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-rose-400 hover:bg-rose-950/10 transition-colors border-t border-zinc-900 mt-2 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </aside>

          {/* Right Panel Display - Col Span 9 */}
          <div className="lg:col-span-9">
            
            {/* 1. Account details tab */}
            {activeTab === 'profile' && (
              <div className="glass-card p-6 rounded-2xl border border-zinc-850 space-y-6">
                <h3 className="font-extrabold text-white text-base pb-3 border-b border-zinc-900">
                  Profile Management
                </h3>

                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold block">User Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full glass-input px-3 py-2.5 rounded-lg text-xs"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold block">Email Address (Non-modifiable)</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full glass-input px-3 py-2.5 rounded-lg text-xs opacity-50 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold block">Update Password (Optional)</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={profilePass}
                        onChange={(e) => setProfilePass(e.target.value)}
                        className="w-full glass-input pl-10 pr-3 py-2.5 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {profileError && (
                    <p className="text-xs text-rose-400 font-semibold">{profileError}</p>
                  )}
                  {profileSuccess && (
                    <p className="text-xs text-emerald-400 font-semibold">✓ Profile successfully updated!</p>
                  )}

                  <button
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg transition-colors cursor-pointer"
                  >
                    Save Modifications
                  </button>
                </form>
              </div>
            )}

            {/* 2. Order History tab */}
            {activeTab === 'orders' && (
              <div className="glass-card p-6 rounded-2xl border border-zinc-850 space-y-6">
                <h3 className="font-extrabold text-white text-base pb-3 border-b border-zinc-900">
                  My Orders History
                </h3>

                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((ord) => {
                      const isExpanded = expandedOrderId === ord._id;
                      return (
                        <div key={ord._id} className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/20 text-left">
                          
                          {/* Top Summarized Row */}
                          <div
                            onClick={() => toggleExpandOrder(ord._id)}
                            className="p-4 flex flex-wrap gap-4 items-center justify-between cursor-pointer hover:bg-zinc-900/40 transition-colors"
                          >
                            <div className="space-y-1">
                              <span className="text-[9px] bg-zinc-900 text-zinc-500 border border-zinc-800 font-bold px-2 py-0.5 rounded">
                                ID: {ord._id.substring(0, 10)}...
                              </span>
                              <div className="text-xs text-zinc-400 flex items-center gap-1.5 pt-0.5">
                                <Calendar className="w-3.5 h-3.5" /> {new Date(ord.createdAt).toLocaleDateString()}
                              </div>
                            </div>

                            <div className="flex gap-6 items-center">
                              <div className="text-right">
                                <span className="text-xs text-zinc-500 block">Total Price</span>
                                <strong className="text-white text-sm">₹{ord.pricing.total.toLocaleString('en-IN')}</strong>
                              </div>

                              <div className="text-right">
                                <span className="text-xs text-zinc-500 block">Status</span>
                                <strong className={`text-xs uppercase ${
                                  ord.orderStatus === 'DELIVERED' ? 'text-emerald-400' : ord.orderStatus === 'CANCELLED' ? 'text-rose-400' : 'text-amber-400'
                                }`}>
                                  {ord.orderStatus}
                                </strong>
                              </div>
                              
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                            </div>
                          </div>

                          {/* Expandable Order Detail Segment */}
                          {isExpanded && (
                            <div className="p-4 border-t border-zinc-900 bg-zinc-950/45 space-y-6 animate-fadeIn">
                              
                              {/* Tracking Timeline */}
                              <div className="space-y-3">
                                <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-black block">Delivery Tracking Timeline</span>
                                <div className="border-l border-zinc-900 pl-4 space-y-4 relative">
                                  {ord.trackingTimeline.map((track, i) => (
                                    <div key={i} className="relative">
                                      <span className="absolute -left-7 top-1 w-4 h-4 rounded-full bg-violet-650 border-2 border-zinc-950" />
                                      <div className="text-xs">
                                        <strong className="text-zinc-200">{track.status}</strong>
                                        <p className="text-zinc-450">{track.message}</p>
                                        <span className="text-[9px] text-zinc-600 block">{new Date(track.timestamp).toLocaleString()}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Items list summary */}
                              <div className="space-y-2.5">
                                <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-black block">Products Ordered</span>
                                <div className="divide-y divide-zinc-900/60 border-t border-b border-zinc-900/60 py-1">
                                  {ord.orderItems.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 items-center py-2.5">
                                      <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover bg-zinc-900" />
                                      <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-xs text-white truncate">{item.title}</h5>
                                        <span className="text-[10px] text-zinc-500">Qty: {item.quantity} × ₹{item.price}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Address recap */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="space-y-1">
                                  <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-black block">Delivery Address</span>
                                  <strong className="text-zinc-300">{ord.shippingAddress.fullName}</strong>
                                  <p className="text-zinc-500">{ord.shippingAddress.street}</p>
                                  <p className="text-zinc-500">{ord.shippingAddress.city}, {ord.shippingAddress.state} - {ord.shippingAddress.zipCode}</p>
                                  <p className="text-zinc-600">Phone: {ord.shippingAddress.phone}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-black block">Payment Details</span>
                                  <p className="text-zinc-400">Method: <strong className="text-zinc-200 uppercase">{ord.paymentDetails.method}</strong></p>
                                  <p className="text-zinc-400">Status: <strong className="text-emerald-400 uppercase">{ord.paymentDetails.status}</strong></p>
                                  {ord.paymentDetails.transactionId && (
                                    <p className="text-[10px] text-zinc-550">ID: {ord.paymentDetails.transactionId}</p>
                                  )}
                                </div>
                              </div>

                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-zinc-900 rounded-2xl text-sm text-zinc-500">
                    <Package className="w-8 h-8 mx-auto mb-2 text-zinc-650" />
                    You haven't placed any orders yet.
                  </div>
                )}
              </div>
            )}

            {/* 3. Saved Addresses tab */}
            {activeTab === 'addresses' && (
              <div className="glass-card p-6 rounded-2xl border border-zinc-850 space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
                  <h3 className="font-extrabold text-white text-base">
                    Saved Shipping Addresses
                  </h3>
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-xs font-semibold text-zinc-300 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Address
                    </button>
                  )}
                </div>

                {showAddressForm ? (
                  /* Form to create addresses */
                  <form onSubmit={handleAddNewAddress} className="space-y-4 text-left border border-zinc-900 p-5 rounded-2xl bg-zinc-950/20 max-w-xl">
                    <h4 className="font-bold text-white text-sm">Add New Address</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        required
                        placeholder="Receiver Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Street details"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="sm:col-span-2 w-full glass-input px-3 py-2 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Zip/Pin Code"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                      />
                    </div>
                    {addressError && <p className="text-xs text-rose-400 font-semibold">{addressError}</p>}
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-4 py-2 text-xs border border-zinc-850 rounded-lg text-zinc-400 hover:bg-zinc-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs bg-violet-650 hover:bg-violet-600 text-white font-bold rounded-lg"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                ) : user.addresses && user.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    {user.addresses.map((addr) => (
                      <div
                        key={addr._id || addr.id}
                        className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/20 relative group hover:border-zinc-700 transition-all"
                      >
                        {/* Remove address */}
                        <button
                          onClick={() => handleDeleteAddress(addr._id || addr.id || '')}
                          className="absolute top-4 right-4 text-zinc-600 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="mb-2">
                          <strong className="text-sm text-white">{addr.fullName}</strong>
                          {addr.isDefault && (
                            <span className="text-[8px] bg-zinc-900 text-zinc-450 border border-zinc-800 font-semibold px-2 py-0.5 rounded ml-2">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed max-w-[200px] truncate">{addr.street}</p>
                        <p className="text-xs text-zinc-400">{addr.city}, {addr.state} - {addr.zipCode}</p>
                        <p className="text-xs text-zinc-550 font-semibold mt-2">Phone: {addr.phone}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-zinc-850 rounded-2xl text-sm text-zinc-500">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-zinc-650" />
                    No shipping addresses declared yet.
                  </div>
                )}
              </div>
            )}

            {/* 4. Wishlist tab */}
            {activeTab === 'wishlist' && (
              <div className="glass-card p-6 rounded-2xl border border-zinc-850 space-y-6">
                <h3 className="font-extrabold text-white text-base pb-3 border-b border-zinc-900">
                  My Wishlist Products
                </h3>

                {loadingWishlist ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array(2).fill(0).map((_, i) => (
                      <div key={i} className="h-44 rounded-xl bg-zinc-900 animate-pulse border border-zinc-850" />
                    ))}
                  </div>
                ) : wishlistProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    {wishlistProducts.map((prod) => (
                      <div
                        key={prod._id}
                        className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/20 flex gap-4 hover:border-zinc-700 transition-all relative group"
                      >
                        <button
                          onClick={() => toggleWishlist(prod._id, true)}
                          className="absolute top-3 right-3 text-zinc-600 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="w-20 h-20 rounded-xl object-cover bg-zinc-900"
                        />
                        
                        <div className="flex-1 min-w-0 flex flex-col justify-between pr-4">
                          <div>
                            <h4
                              onClick={() => router.push(`/products/${prod._id}`)}
                              className="font-bold text-sm text-white hover:text-violet-400 hover:underline truncate cursor-pointer"
                            >
                              {prod.title}
                            </h4>
                            <span className="text-xs font-extrabold text-white block mt-0.5">₹{(prod.discountPrice || prod.price).toLocaleString('en-IN')}</span>
                          </div>

                          <button
                            onClick={() => handleWishlistToCart(prod)}
                            className="w-fit mt-2 bg-violet-650/10 hover:bg-violet-650/20 text-violet-400 border border-violet-900/50 font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer"
                          >
                            Move to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-6 border border-zinc-900 rounded-2xl max-w-sm mx-auto space-y-4">
                    <Heart className="w-10 h-10 mx-auto text-zinc-650" />
                    <h4 className="font-bold text-white text-sm">Your Wishlist is Empty</h4>
                    <p className="text-zinc-550 text-xs leading-normal">
                      Save products while browsing to keep track of premium items you like.
                    </p>
                    <button
                      onClick={() => router.push('/products')}
                      className="bg-violet-650 hover:bg-violet-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Explore Products
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
