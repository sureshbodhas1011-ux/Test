'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { Mail, Lock, User, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, user } = useAuth();
  
  const redirectPath = searchParams.get('redirect') || '/';

  // Mode Toggler
  const [mode, setMode] = useState<AuthMode>('login');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Feedback states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user) {
      router.push(redirectPath);
    }
  }, [user]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    // Form inputs validation
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (mode !== 'forgot' && (!password || password.length < 6)) {
      setErrorMsg('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Invalid email or password.');
        }
      } else if (mode === 'register') {
        if (!name.trim()) {
          setErrorMsg('Please enter your full name.');
          setLoading(false);
          return;
        }
        const res = await register(email, password, name.trim());
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to register account.');
        }
      } else {
        // forgot password
        const res = await api.forgotPassword(email);
        setSuccessMsg(res.message || 'Verification link sent to your email.');
        setEmail('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center py-12 px-6 relative overflow-hidden">
      {/* Decorative backdrop blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 blur-[130px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-650/10 blur-[130px] rounded-full" />

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        {/* Brand Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-violet-500/20">
              V
            </span>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              VELOCE
            </span>
          </Link>
        </div>

        {/* Auth form card */}
        <div className="glass-card py-8 px-6 sm:px-10 rounded-3xl border border-zinc-850 shadow-2xl space-y-6">
          
          {/* Form Header */}
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Create Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h2>
            <p className="text-xs text-zinc-500">
              {mode === 'login' && 'Log in to manage order tracking and billing.'}
              {mode === 'register' && 'Sign up to unlock cart codes and order histories.'}
              {mode === 'forgot' && 'Enter your email to request recovery dispatch.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Full Name (Register Mode only) */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full glass-input pl-10 pr-3 py-2.5 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input pl-10 pr-3 py-2.5 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Password (Login/Register Modes only) */}
            {mode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => toggleMode('forgot')}
                      className="text-[10px] text-violet-400 hover:text-violet-350 font-bold hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input pl-10 pr-3 py-2.5 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            {/* Response Alerts */}
            {errorMsg && (
              <p className="text-xs text-rose-400 font-semibold text-center animate-pulse">{errorMsg}</p>
            )}
            {successMsg && (
              <div className="p-3 border border-emerald-900 bg-emerald-950/20 rounded-xl text-xs text-emerald-400 text-center">
                {successMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-650 hover:from-violet-600 hover:to-indigo-750 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-violet-500/25 btn-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Processing...' : (
                <>
                  {mode === 'login' && 'Log In'}
                  {mode === 'register' && 'Sign Up'}
                  {mode === 'forgot' && 'Send Reset Link'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <hr className="border-zinc-850" />

          {/* Toggle Panel Mode Links */}
          <div className="text-center text-xs text-zinc-550">
            {mode === 'login' && (
              <p>
                Don't have an account?{' '}
                <button onClick={() => toggleMode('register')} className="text-violet-400 hover:text-violet-350 font-bold hover:underline cursor-pointer">
                  Sign up free
                </button>
              </p>
            )}
            {mode === 'register' && (
              <p>
                Already have an account?{' '}
                <button onClick={() => toggleMode('login')} className="text-violet-400 hover:text-violet-350 font-bold hover:underline cursor-pointer">
                  Log in here
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <button onClick={() => toggleMode('login')} className="text-violet-400 hover:text-violet-350 font-bold hover:underline cursor-pointer">
                Back to log in
              </button>
            )}
          </div>

        </div>

        {/* Demo login helpers */}
        <div className="mt-6 p-4 border border-zinc-900 bg-zinc-950/40 rounded-2xl text-[10px] text-zinc-550 leading-relaxed text-left space-y-1.5">
          <p className="font-bold text-zinc-400 flex items-center gap-1">💡 Demo Quick Logins (Pre-seeded):</p>
          <p>• <strong className="text-zinc-400">Customer account</strong>: customer@ecommerce.com / Password123</p>
          <p>• <strong className="text-zinc-400">Administrator account</strong>: admin@ecommerce.com / Password123</p>
        </div>

      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-[#09090b] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
