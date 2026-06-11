'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { api } from '@/services/api';
import { CheckCircle, Truck, Package, Calendar, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

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
  orderItems: Array<{
    productId: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  trackingTimeline: Array<{
    status: string;
    message: string;
    timestamp: string;
  }>;
}

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getOrder(orderId);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order receipt:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (loading) {
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

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen bg-[#09090b]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <CheckCircle className="w-12 h-12 text-emerald-500 animate-bounce" />
          <h2 className="text-xl font-bold text-white">Order Confirmed!</h2>
          <p className="text-zinc-500 text-sm">We couldn't retrieve the live invoice. Check your dashboard for details.</p>
          <button onClick={() => router.push('/dashboard')} className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
            View Dashboard
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full text-left space-y-8">
        
        {/* Success header banner */}
        <div className="text-center space-y-4 py-8 border-b border-zinc-900">
          <div className="w-20 h-20 rounded-full bg-emerald-950/40 border border-emerald-800 flex items-center justify-center mx-auto text-emerald-400 filter drop-shadow-[0_0_12px_rgba(16,185,129,0.2)] animate-pulse">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white">Thank You for Your Order! 🎉</h1>
            <p className="text-zinc-500 text-sm">
              Your purchase was successful. Order ID: <strong className="text-zinc-350">{order._id}</strong>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Tracking Timeline - Col Span 7 */}
          <div className="md:col-span-7 glass-card p-6 rounded-2xl border border-zinc-850 space-y-6">
            <h3 className="font-extrabold text-white text-base pb-3 border-b border-zinc-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-violet-400" /> Delivery Status Tracker
            </h3>

            {/* Timeline graphics */}
            <div className="relative border-l border-zinc-800 pl-6 space-y-6 text-left">
              {order.trackingTimeline.map((item, idx) => (
                <div key={idx} className="relative">
                  {/* Dot icon */}
                  <span className="absolute -left-9 top-1 w-6 h-6 rounded-full bg-violet-600 border-4 border-[#09090b] flex items-center justify-center text-white" />
                  
                  <div className="space-y-0.5">
                    <strong className="text-sm text-white">{item.status}</strong>
                    <p className="text-xs text-zinc-400">{item.message}</p>
                    <span className="text-[10px] text-zinc-550 block pt-0.5">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}

              {/* Standard remaining stages */}
              {order.orderStatus === 'PENDING' && (
                <>
                  <div className="relative opacity-40">
                    <span className="absolute -left-9 top-1 w-6 h-6 rounded-full bg-zinc-900 border-4 border-[#09090b] flex items-center justify-center text-zinc-500" />
                    <div className="space-y-0.5">
                      <strong className="text-sm text-zinc-400">Order Processing</strong>
                      <p className="text-xs text-zinc-550">We are packing your item in the fulfillment center.</p>
                    </div>
                  </div>
                  <div className="relative opacity-40">
                    <span className="absolute -left-9 top-1 w-6 h-6 rounded-full bg-zinc-900 border-4 border-[#09090b] flex items-center justify-center text-zinc-500" />
                    <div className="space-y-0.5">
                      <strong className="text-sm text-zinc-400">Shipped</strong>
                      <p className="text-xs text-zinc-550">Dispatched from hub. Tracking link active.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Billing Recap - Col Span 5 */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Receipt Summary card */}
            <div className="glass-card p-6 rounded-2xl border border-zinc-850 space-y-4">
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider pb-2 border-b border-zinc-900 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-violet-400" /> Shipping Details
              </h3>
              
              <div className="text-xs text-zinc-400 space-y-2 text-left">
                <div className="flex gap-2 items-start">
                  <MapPin className="w-4 h-4 text-zinc-550 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-zinc-200">{order.shippingAddress.fullName}</strong>
                    <p className="text-zinc-500 pt-0.5">{order.shippingAddress.street}</p>
                    <p className="text-zinc-500">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 items-center pt-2 border-t border-zinc-900/60">
                  <Calendar className="w-4 h-4 text-zinc-550" />
                  <span>Placed on: {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Total recap card */}
            <div className="glass-card p-6 rounded-2xl border border-zinc-850 text-left space-y-4">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider pb-2 border-b border-zinc-900">
                Payment Status
              </h4>

              <div className="space-y-2 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Method</span>
                  <span className="font-semibold text-white uppercase">{order.paymentDetails.method}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="font-bold text-emerald-400 uppercase">{order.paymentDetails.status}</span>
                </div>
                {order.paymentDetails.transactionId && (
                  <div className="flex justify-between">
                    <span>Transaction ID</span>
                    <span className="text-[10px] text-zinc-550">{order.paymentDetails.transactionId}</span>
                  </div>
                )}
              </div>

              <hr className="border-zinc-900" />

              <div className="flex justify-between text-white font-black text-sm">
                <span>Amount Paid</span>
                <span className="text-violet-400 text-base">₹{order.pricing.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Navigation CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6 border-t border-zinc-900">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 font-bold px-6 py-3.5 rounded-xl text-sm transition-all"
          >
            Track in Dashboard
          </button>
          
          <button
            onClick={() => router.push('/products')}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-[#09090b] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
