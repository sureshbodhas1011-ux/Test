'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

export interface IUserAddress {
  _id?: string;
  id?: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
  addresses: IUserAddress[];
  wishlist: string[];
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserAddresses: (addresses: IUserAddress[]) => void;
  updateUserWishlist: (wishlist: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      
      // Update local storage wishlist
      if (data.user.wishlist) {
        localStorage.setItem('wishlist', JSON.stringify(data.user.wishlist));
      }
    } catch (error) {
      console.error('Failed to load user session:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await api.login({ email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      
      if (data.user.wishlist) {
        localStorage.setItem('wishlist', JSON.stringify(data.user.wishlist));
      }
      
      // Redirect based on role
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const data = await api.register({ email, password, name });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      
      if (data.user.wishlist) {
        localStorage.setItem('wishlist', JSON.stringify(data.user.wishlist));
      }
      
      router.push('/');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/auth/login');
  };

  const updateUserAddresses = (addresses: IUserAddress[]) => {
    if (user) {
      setUser({ ...user, addresses });
    }
  };

  const updateUserWishlist = (wishlist: string[]) => {
    if (user) {
      setUser({ ...user, wishlist });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateUserAddresses,
        updateUserWishlist
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
