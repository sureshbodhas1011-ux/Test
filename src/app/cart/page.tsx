'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, ArrowLeft, Trash2, Bookmark, BookmarkCheck, Tag, Ticket, Percent } from 'lucide-react';

export default function ShoppingCartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cart,
    saveForLater,
    addToCart,
    removeFromCart,
    updateQuantity,
    moveToSaveForLater,
    moveToCart,
    coupon,
    couponError,
    applyCoupon,
    removeCoupon,
    cartSubtotal,
    discountAmount,
    shippingCharge,
    cartTotal
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setLoadingCoupon(true);
    const success = await applyCoupon(couponInput.trim());
    setLoadingCoupon(false);
    if (success) setCouponInput('');
  };

  const handleCheckoutRedirect = () => {
    if (!user) {
      // Send user to login, then redirect back to checkout
      router.push('/auth/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full text-left">
        <h1 className="text-3xl font-black text-white mb-8">Shopping Cart 🛒</h1>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* 1. Cart Items List - Col Span 8 */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="rounded-2xl border border-zinc-900 bg-zinc-950/20 overflow-hidden divide-y divide-zinc-900">
                {cart.map((item) => {
                  const finalPrice = item.discountPrice || item.price;
                  return (
                    <div key={item.productId} className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                      {/* Product details info */}
                      <div className="flex gap-4 items-center flex-1">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-20 h-20 rounded-xl object-cover bg-zinc-900 border border-zinc-850"
                        />
                        <div className="space-y-1 text-left">
                          <Link href={`/products/${item.productId}`} className="font-bold text-white text-sm hover:text-violet-400 hover:underline line-clamp-1">
                            {item.title}
                          </Link>
                          <p className="text-[10px] text-zinc-550 uppercase font-semibold">Category: Tech & Gear</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-extrabold text-white">₹{finalPrice.toLocaleString('en-IN')}</span>
                            {item.discountPrice && (
                              <span className="text-xs text-zinc-600 line-through">₹{item.price.toLocaleString('en-IN')}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity counter, remove, save for later controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-zinc-900">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/30">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-3 py-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-3 py-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                          >
                            +
                          </button>
                        </div>

                        {/* Actions buttons */}
                        <div className="flex gap-2.5">
                          <button
                            onClick={() => moveToSaveForLater(item.productId)}
                            className="p-2 border border-zinc-800 bg-zinc-900/40 rounded-lg text-zinc-500 hover:text-violet-400 transition-colors cursor-pointer"
                            title="Save for Later"
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="p-2 border border-zinc-800 bg-zinc-900/40 rounded-lg text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping button */}
              <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-violet-400 hover:text-violet-350 hover:underline">
                <ArrowLeft className="w-4 h-4" /> Continue Shopping
              </Link>

              {/* 2. Save For Later Shelve */}
              {saveForLater.length > 0 && (
                <div className="pt-8 space-y-4">
                  <h3 className="text-lg font-black text-white">Saved For Later ({saveForLater.length})</h3>
                  <div className="rounded-2xl border border-zinc-900 bg-zinc-950/20 overflow-hidden divide-y divide-zinc-900">
                    {saveForLater.map((item) => (
                      <div key={item.productId} className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                        <div className="flex gap-4 items-center flex-1">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-16 rounded-xl object-cover bg-zinc-900 border border-zinc-850"
                          />
                          <div className="space-y-0.5 text-left">
                            <Link href={`/products/${item.productId}`} className="font-bold text-white text-sm hover:text-violet-400 line-clamp-1">
                              {item.title}
                            </Link>
                            <span className="text-sm font-extrabold text-white">₹{(item.discountPrice || item.price).toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => moveToCart(item.productId)}
                            className="text-xs bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-900/50 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Move to Cart
                          </button>
                          <button
                            onClick={() => {
                              // Custom delete from saveForLater
                              const updated = saveForLater.filter((i) => i.productId !== item.productId);
                              localStorage.setItem('saveForLater', JSON.stringify(updated));
                              window.location.reload(); // Quick refresh to update state
                            }}
                            className="p-2 border border-zinc-850 bg-zinc-900/20 rounded-lg text-zinc-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* 3. Pricing Details Box - Col Span 4 */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Coupon Form card */}
              <div className="glass-card p-5 rounded-2xl border border-zinc-850 space-y-4">
                <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-violet-400" /> Apply Coupon Code
                </h4>

                {coupon ? (
                  <div className="p-3.5 rounded-xl border border-emerald-900/40 bg-emerald-950/20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Percent className="w-4 h-4 animate-bounce" />
                      <div className="text-left">
                        <strong className="text-sm uppercase">{coupon.code}</strong>
                        <p className="text-[10px] text-emerald-500">
                          {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}% Off applied` : `₹${coupon.discountValue} Off applied`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10, MEGA20"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 glass-input px-3 py-2 rounded-xl text-xs uppercase"
                    />
                    <button
                      type="submit"
                      disabled={loadingCoupon}
                      className="bg-violet-650 hover:bg-violet-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-xs text-rose-400 font-semibold">{couponError}</p>}
                
                {/* Micro available coupon helpers */}
                {!coupon && (
                  <div className="text-[10px] text-zinc-550 border-t border-zinc-900 pt-3 text-left space-y-1">
                    <p>💡 Available Promo Codes:</p>
                    <p>• <strong className="text-zinc-400">WELCOME10</strong>: 10% Off on orders above ₹1,000</p>
                    <p>• <strong className="text-zinc-400">MEGA20</strong>: 20% Off on orders above ₹3,000</p>
                  </div>
                )}
              </div>

              {/* Total Summary card */}
              <div className="glass-card p-6 rounded-2xl border border-zinc-850 text-left space-y-6 shadow-xl">
                <h4 className="font-extrabold text-white text-sm uppercase tracking-wider pb-3 border-b border-zinc-900">
                  Billing Summary
                </h4>

                <div className="space-y-3.5 text-xs text-zinc-400">
                  <div className="flex justify-between">
                    <span>Cart Subtotal</span>
                    <span className="font-semibold text-white">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Promo Discount</span>
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

                <button
                  onClick={handleCheckoutRedirect}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-violet-500/25 btn-glow transition-all cursor-pointer"
                >
                  Proceed to Checkout
                </button>
              </div>

            </div>

          </div>
        ) : (
          // Empty State
          <div className="text-center py-20 px-6 glass-card rounded-3xl border border-zinc-850 max-w-lg mx-auto space-y-5">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Your Shopping Cart is Empty</h2>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
              Explore AcoustiMax wireless gadgets, autumn collection denim jackets, and wellness serums to fill your cart.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Browse Products
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
