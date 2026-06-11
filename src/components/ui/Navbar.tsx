'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { ShoppingCart, Heart, Sun, Moon, User, Search, LogOut, Menu, X, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart, wishlist } = useCart();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-navbar shadow-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
                V
              </span>
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent group-hover:text-violet-400 transition-colors">
                VELOCE
              </span>
            </Link>
          </div>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg relative">
            <input
              type="text"
              placeholder="Search premium gadgets, fashion..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs bg-violet-600 hover:bg-violet-500 text-white font-semibold px-2.5 py-1 rounded-lg transition-colors">
              Search
            </button>
          </form>

          {/* Action Icons - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 transition-all cursor-pointer"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-400" />}
            </button>

            {/* Wishlist Link */}
            <Link
              href="/dashboard"
              className="p-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 text-zinc-400 hover:text-rose-400 hover:bg-zinc-900/80 transition-all relative cursor-pointer"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              href="/cart"
              className="p-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 text-zinc-400 hover:text-violet-400 hover:bg-zinc-900/80 transition-all relative cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-violet-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/50">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Dropdown trigger */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 text-zinc-300 hover:text-white transition-all cursor-pointer"
                >
                  <User className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-semibold max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-violet-500/10 hover:shadow-violet-500/20"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}

              {/* User Dropdown Menu */}
              {userDropdownOpen && user && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-card border border-zinc-800 shadow-2xl py-2 z-50 text-left">
                  <div className="px-4 py-2.5 border-b border-zinc-850">
                    <p className="text-xs text-zinc-500">Signed in as</p>
                    <p className="text-sm font-bold text-white truncate">{user.email}</p>
                    {user.role === 'ADMIN' && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-violet-950/60 border border-violet-800 text-[10px] font-semibold text-violet-400">
                        <ShieldAlert className="w-3 h-3" /> Admin Account
                      </span>
                    )}
                  </div>
                  
                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-900/50 transition-colors"
                  >
                    <User className="w-4 h-4 text-violet-400" /> Profile Dashboard
                  </Link>

                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-900/50 transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4 text-violet-400" /> Admin Console
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-zinc-900/50 transition-colors border-t border-zinc-850"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {/* Search Toggle Icon */}
            <Link
              href="/products"
              className="p-2 text-zinc-400 hover:text-zinc-200"
            >
              <Search className="w-5 h-5" />
            </Link>
            
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="p-2 text-zinc-400 hover:text-zinc-200 relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-violet-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-t border-zinc-850 py-4 px-6 space-y-4 animate-fadeIn">
          {/* Mobile search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search gadgets, style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          </form>

          {/* Links list */}
          <div className="flex flex-col gap-3 font-semibold">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-white py-1">Home</Link>
            <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-white py-1">All Products</Link>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-white py-1 flex justify-between">
              <span>My Wishlist</span>
              {wishlistCount > 0 && <span className="bg-rose-500/20 text-rose-400 text-xs px-2.5 py-0.5 rounded-full">{wishlistCount} items</span>}
            </Link>
            {user && user.role === 'ADMIN' && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="text-violet-400 hover:text-violet-350 py-1">Admin Console</Link>
            )}
          </div>

          <hr className="border-zinc-850" />

          {/* Theme & Profile controls */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Appearance</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 border border-zinc-800 rounded-lg bg-zinc-900/40 text-sm"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" /> <span className="text-zinc-300">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-violet-400" /> <span className="text-zinc-700">Dark Mode</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2">
            {user ? (
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-zinc-500">Logged in as</span> <strong className="text-zinc-200">{user.name}</strong>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex-1 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-900/50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white text-sm font-bold py-3 rounded-xl transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
