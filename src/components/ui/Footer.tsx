'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-400 py-16 px-6 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-600/5 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-indigo-600/5 blur-[80px] rounded-full -translate-x-1/2" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 relative z-10">
        
        {/* Brand & Tagline */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-violet-500/25">
              V
            </span>
            <span className="font-extrabold text-xl tracking-tight text-white">
              VELOCE
            </span>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
            Curating state-of-the-art tech gadgets, immersive headphones, luxury watches, and contemporary wardrobe collections. Designed for premium lifestyle enthusiasts.
          </p>
          <div className="flex gap-3 pt-2">
            <a href="https://instagram.com" className="w-9 h-9 rounded-lg border border-zinc-850 hover:border-violet-500/50 bg-zinc-900/40 flex items-center justify-center text-zinc-400 hover:text-rose-400 transition-colors">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://twitter.com" className="w-9 h-9 rounded-lg border border-zinc-850 hover:border-violet-500/50 bg-zinc-900/40 flex items-center justify-center text-zinc-400 hover:text-sky-400 transition-colors">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
            </a>
            <a href="https://facebook.com" className="w-9 h-9 rounded-lg border border-zinc-850 hover:border-violet-500/50 bg-zinc-900/40 flex items-center justify-center text-zinc-400 hover:text-indigo-400 transition-colors">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          </div>
        </div>

        {/* Quick Links - Shop */}
        <div className="md:col-span-2 space-y-4 text-left">
          <h4 className="font-bold text-white text-sm uppercase tracking-wider">Shop Collections</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/products?category=electronics" className="hover:text-violet-400 transition-colors">Electronics</Link></li>
            <li><Link href="/products?category=fashion" className="hover:text-violet-400 transition-colors">Designer Wear</Link></li>
            <li><Link href="/products?category=home-kitchen" className="hover:text-violet-400 transition-colors">Home & Living</Link></li>
            <li><Link href="/products?category=beauty-wellness" className="hover:text-violet-400 transition-colors">Beauty & Serum</Link></li>
          </ul>
        </div>

        {/* Quick Links - Support */}
        <div className="md:col-span-2 space-y-4 text-left">
          <h4 className="font-bold text-white text-sm uppercase tracking-wider">Customer Help</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/dashboard" className="hover:text-violet-400 transition-colors">My Profile</Link></li>
            <li><Link href="/dashboard" className="hover:text-violet-400 transition-colors">Order Tracking</Link></li>
            <li><Link href="/cart" className="hover:text-violet-400 transition-colors">Shopping Cart</Link></li>
            <li><span className="hover:text-violet-400 transition-colors cursor-pointer">Shipping & Returns</span></li>
          </ul>
        </div>

        {/* Newsletter Subscription */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-violet-400" /> Subscribe to newsletter
          </h4>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Get early access to holiday sales, premium product drops, and exclusive coupon codes.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-3">
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input pl-10 pr-12 py-2.5 rounded-xl text-sm"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {subscribed && (
              <p className="text-xs text-emerald-400 font-semibold animate-pulse">
                ✓ Successfully subscribed! Check your inbox for WELCOME10 coupon.
              </p>
            )}
          </form>
        </div>

      </div>

      <hr className="border-zinc-900 my-10 max-w-7xl mx-auto" />

      {/* Copyright */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-550 gap-4">
        <p>© 2026 Veloce Inc. All rights reserved. Designed for elite e-commerce.</p>
        <div className="flex gap-4">
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
          <span className="hover:underline cursor-pointer">Terms of Service</span>
          <span className="hover:underline cursor-pointer">Sitemap</span>
        </div>
      </div>
    </footer>
  );
}
