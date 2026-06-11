'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth, IUserAddress } from '@/context/AuthContext';
import { api } from '@/services/api';
import { CreditCard, Wallet, Truck, ShoppingCart, ShieldCheck, MapPin, Plus, ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { cart, cartSubtotal, discountAmount, shippingCharge, cartTotal, clearCart, coupon } = useCart();

  // Selected Address State
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // New Address Form Inputs
  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [addressError, setAddressError] = useState('');

  // Payment Method Selection
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'COD'>('CARD');
  
  // Payment Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  // Global Checkout Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Protect route
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/checkout');
    }
    if (cart.length === 0) {
      router.push('/cart');
    }
  }, [user, cart]);

  // Set default selected address index
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultIdx = user.addresses.findIndex((addr) => addr.isDefault);
      setSelectedAddressIndex(defaultIdx > -1 ? defaultIdx : 0);
    }
  }, [user]);

  // Handle new address creation
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
        isDefault: user?.addresses.length === 0 // default if first address
      };

      await api.addAddress(addressData);
      await refreshUser(); // reload user data to show new address
      
      // Clear form
      setFullName('');
      setStreet('');
      setCity('');
      setState('');
      setZipCode('');
      setPhone('');
      setShowNewAddressForm(false);
    } catch (err: any) {
      setAddressError(err.message || 'Failed to add address.');
    }
  };

  // Process checkout order
  const handlePlaceOrder = async () => {
    setCheckoutError('');
    if (!user) return;

    if (!user.addresses || user.addresses.length === 0) {
      setCheckoutError('Please add a shipping address.');
      return;
    }

    const shippingAddress = user.addresses[selectedAddressIndex];

    // Validate payment inputs
    if (paymentMethod === 'CARD') {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        setCheckoutError('Please enter Credit Card details.');
        return;
      }
    } else if (paymentMethod === 'UPI') {
      if (!upiId || !upiId.includes('@')) {
        setCheckoutError('Please enter a valid UPI ID (e.g. name@upi).');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const paymentDetails = {
        method: paymentMethod,
        transactionId: paymentMethod !== 'COD' ? `TXN_${Math.random().toString(36).substring(2, 11).toUpperCase()}` : undefined
      };

      const orderPayload = {
        orderItems: cart.map(item => ({
          productId: item.productId,
          title: item.title,
          price: item.discountPrice || item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shippingAddress: {
          fullName: shippingAddress.fullName,
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          phone: shippingAddress.phone
        },
        paymentDetails,
        pricing: {
          subtotal: cartSubtotal,
          discount: discountAmount,
          shipping: shippingCharge,
          total: cartTotal
        }
      };

      const createdOrder = await api.createOrder(orderPayload);
      clearCart();
      router.push(`/checkout/success?id=${createdOrder._id || createdOrder.id}`);
    } catch (err: any) {
      setCheckoutError(err.message || 'Checkout failed. Please review items stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || cart.length === 0) {
    return null; // let useEffect redirect
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full text-left">
        <h1 className="text-3xl font-black text-white mb-8">Secure Checkout 🔒</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 1. Address & Payment Form - Col Span 8 */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Shipping Address Selection Section */}
            <div className="glass-card p-6 rounded-2xl border border-zinc-850 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-violet-400" /> Shipping Address
                </h3>
                {!showNewAddressForm && (
                  <button
                    onClick={() => setShowNewAddressForm(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-violet-400 hover:text-violet-350 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Address
                  </button>
                )}
              </div>

              {showNewAddressForm ? (
                /* New Address creation form */
                <form onSubmit={handleAddNewAddress} className="space-y-4 text-left border border-zinc-850 p-4 rounded-xl">
                  <h4 className="font-bold text-white text-sm">Create Shipping Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Receiver's Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Contact Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Street, Landmark, Apartment"
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
                      placeholder="Pin Code / Zip"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                    />
                  </div>
                  {addressError && <p className="text-xs text-rose-400 font-semibold">{addressError}</p>}
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-4 py-2 text-xs border border-zinc-850 hover:bg-zinc-900 rounded-lg text-zinc-400"
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
                /* Select from existing addresses */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((addr, idx) => (
                    <div
                      key={addr._id || addr.id}
                      onClick={() => setSelectedAddressIndex(idx)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedAddressIndex === idx
                          ? 'border-violet-500 bg-violet-950/10'
                          : 'border-zinc-850 hover:border-zinc-750 bg-zinc-950/20'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <strong className="text-sm text-white">{addr.fullName}</strong>
                        {addr.isDefault && (
                          <span className="text-[9px] bg-zinc-900 text-zinc-400 font-semibold px-2 py-0.5 rounded border border-zinc-800">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed truncate">{addr.street}</p>
                      <p className="text-xs text-zinc-400">{addr.city}, {addr.state} - {addr.zipCode}</p>
                      <p className="text-xs text-zinc-550 mt-2 font-medium">📞 {addr.phone}</p>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty state - requires address */
                <div className="text-center py-6 border border-dashed border-zinc-800 rounded-xl space-y-3">
                  <p className="text-zinc-500 text-sm">No saved shipping addresses found.</p>
                  <button
                    onClick={() => setShowNewAddressForm(true)}
                    className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2 rounded-xl text-xs"
                  >
                    Create Address
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method Selection Card */}
            <div className="glass-card p-6 rounded-2xl border border-zinc-850 space-y-6">
              <h3 className="font-extrabold text-white text-base pb-3 border-b border-zinc-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-violet-400" /> Payment Method
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'CARD'
                      ? 'border-violet-500 bg-violet-950/15 text-white font-bold'
                      : 'border-zinc-850 hover:border-zinc-750 text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs">Credit/Debit Card</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'UPI'
                      ? 'border-violet-500 bg-violet-950/15 text-white font-bold'
                      : 'border-zinc-850 hover:border-zinc-750 text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                  <span className="text-xs">UPI QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'COD'
                      ? 'border-violet-500 bg-violet-950/15 text-white font-bold'
                      : 'border-zinc-850 hover:border-zinc-750 text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  <Truck className="w-5 h-5" />
                  <span className="text-xs">Cash on Delivery</span>
                </button>
              </div>

              {/* Payment inputs details */}
              <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-900/60">
                {paymentMethod === 'CARD' && (
                  <div className="space-y-4 max-w-sm">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block">Card Number</label>
                      <input
                        type="text"
                        required
                        placeholder="4532 9876 1234 5678"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block">Expiry Date</label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block">CVV</label>
                        <input
                          type="password"
                          required
                          maxLength={3}
                          placeholder="***"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'UPI' && (
                  <div className="space-y-3 max-w-sm">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block">UPI ID Address</label>
                      <input
                        type="text"
                        required
                        placeholder="suresh@okaxis"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal">
                      A transaction request will be pushed straight to your mobile UPI application. Accept to pay.
                    </p>
                  </div>
                )}

                {paymentMethod === 'COD' && (
                  <div className="text-zinc-400 text-xs py-2 space-y-1 leading-relaxed">
                    <p>✓ Pay with cash, UPI or cards upon delivery at your doorstep.</p>
                    <p className="text-zinc-550">Note: Please keep precise cash ready for handovers to help delivery executives.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* 2. Order Summary Panel - Col Span 4 */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Products summary list card */}
            <div className="glass-card p-5 rounded-2xl border border-zinc-850 space-y-4">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider pb-2 border-b border-zinc-900 flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-violet-400" /> Order Summary
              </h4>

              <div className="max-h-[220px] overflow-y-auto divide-y divide-zinc-900/60 pr-1.5 space-y-3">
                {cart.map((item) => (
                  <div key={item.productId} className="flex gap-3 items-center py-2.5">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-11 h-11 rounded-lg object-cover bg-zinc-900 border border-zinc-850"
                    />
                    <div className="text-left flex-1 min-w-0">
                      <h5 className="font-bold text-white text-xs truncate">{item.title}</h5>
                      <span className="text-[10px] text-zinc-500">Qty: {item.quantity} × ₹{(item.discountPrice || item.price).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Billing Calculations card */}
            <div className="glass-card p-6 rounded-2xl border border-zinc-850 text-left space-y-6">
              <h4 className="font-extrabold text-white text-sm uppercase tracking-wider pb-3 border-b border-zinc-900">
                Billing Details
              </h4>

              <div className="space-y-3.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="font-semibold text-white">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Discount</span>
                    <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-white">
                    {shippingCharge === 0 ? <span className="text-emerald-400 font-bold">FREE Delivery</span> : `₹${shippingCharge}`}
                  </span>
                </div>
              </div>

              <hr className="border-zinc-900" />

              <div className="flex justify-between text-white font-black text-lg">
                <span>Order Total</span>
                <span className="text-glow text-violet-400">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>

              {checkoutError && (
                <p className="text-xs text-rose-400 font-semibold animate-pulse">{checkoutError}</p>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-violet-500/25 btn-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? 'Processing Order...' : 'Pay & Place Order'}
              </button>

              <p className="text-[10px] text-zinc-550 text-center leading-relaxed">
                By placing the order, you authorize Veloce to dispatch catalog items and accept user terms of service.
              </p>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
