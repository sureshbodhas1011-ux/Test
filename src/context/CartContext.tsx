'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/services/api';

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  image: string;
  stock: number;
}

export interface CouponInfo {
  code: string;
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
}

interface CartContextType {
  cart: CartItem[];
  saveForLater: CartItem[];
  wishlist: string[]; // Product IDs
  coupon: CouponInfo | null;
  couponError: string | null;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  moveToSaveForLater: (productId: string) => void;
  moveToCart: (productId: string) => void;
  toggleWishlist: (productId: string, isLoggedIn?: boolean) => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  clearCart: () => void;
  cartSubtotal: number;
  discountAmount: number;
  shippingCharge: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saveForLater, setSaveForLater] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [coupon, setCoupon] = useState<CouponInfo | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Load cart states from localStorage on startup
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedSaveForLater = localStorage.getItem('saveForLater');
    const savedWishlist = localStorage.getItem('wishlist');
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedSaveForLater) setSaveForLater(JSON.parse(savedSaveForLater));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  // Save changes to localStorage
  const saveCartToStorage = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const saveLaterToStorage = (updatedLater: CartItem[]) => {
    setSaveForLater(updatedLater);
    localStorage.setItem('saveForLater', JSON.stringify(updatedLater));
  };

  const saveWishlistToStorage = (updatedWishlist: string[]) => {
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  // 1. Add item to cart
  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    const existingIndex = cart.findIndex((i) => i.productId === item.productId);
    let newCart = [...cart];

    if (existingIndex > -1) {
      const newQty = newCart[existingIndex].quantity + quantity;
      newCart[existingIndex].quantity = Math.min(newQty, item.stock);
    } else {
      newCart.push({ ...item, quantity: Math.min(quantity, item.stock) });
    }

    saveCartToStorage(newCart);
  };

  // 2. Remove item from cart
  const removeFromCart = (productId: string) => {
    const newCart = cart.filter((item) => item.productId !== productId);
    saveCartToStorage(newCart);
  };

  // 3. Update quantity in cart
  const updateQuantity = (productId: string, quantity: number) => {
    const updated = cart.map((item) => {
      if (item.productId === productId) {
        return { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) };
      }
      return item;
    });
    saveCartToStorage(updated);
  };

  // 4. Save item for later
  const moveToSaveForLater = (productId: string) => {
    const itemToMove = cart.find((item) => item.productId === productId);
    if (!itemToMove) return;

    // Remove from cart
    const newCart = cart.filter((item) => item.productId !== productId);
    saveCartToStorage(newCart);

    // Add to save for later
    const exists = saveForLater.some((i) => i.productId === productId);
    if (!exists) {
      const newLater = [...saveForLater, itemToMove];
      saveLaterToStorage(newLater);
    }
  };

  // 5. Move from save for later to cart
  const moveToCart = (productId: string) => {
    const itemToMove = saveForLater.find((item) => item.productId === productId);
    if (!itemToMove) return;

    // Remove from save for later
    const newLater = saveForLater.filter((item) => item.productId !== productId);
    saveLaterToStorage(newLater);

    // Add to cart
    addToCart(itemToMove, itemToMove.quantity);
  };

  // 6. Toggle wishlist item
  const toggleWishlist = async (productId: string, isLoggedIn = false) => {
    let updatedWishlist = [...wishlist];
    const index = updatedWishlist.indexOf(productId);

    if (index > -1) {
      updatedWishlist.splice(index, 1);
    } else {
      updatedWishlist.push(productId);
    }
    
    saveWishlistToStorage(updatedWishlist);

    // If logged in, sync with backend database
    if (isLoggedIn) {
      try {
        await api.toggleWishlist(productId);
      } catch (err) {
        console.error('Failed to sync wishlist with backend:', err);
      }
    }
  };

  // 7. Apply coupon code
  const applyCoupon = async (code: string): Promise<boolean> => {
    setCouponError(null);
    try {
      const subtotal = cart.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0);
      const res = await api.validateCoupon(code, subtotal);
      setCoupon({
        code: res.code,
        discountType: res.discountType,
        discountValue: res.discountValue
      });
      return true;
    } catch (err: any) {
      setCouponError(err.message || 'Failed to apply coupon');
      setCoupon(null);
      return false;
    }
  };

  // 8. Remove coupon
  const removeCoupon = () => {
    setCoupon(null);
    setCouponError(null);
  };

  // 9. Clear cart
  const clearCart = () => {
    saveCartToStorage([]);
    setCoupon(null);
  };

  // Calculated Pricing Metrics
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0);
  
  let discountAmount = 0;
  if (coupon) {
    if (coupon.discountType === 'PERCENT') {
      discountAmount = Math.round((cartSubtotal * coupon.discountValue) / 100);
    } else {
      discountAmount = coupon.discountValue;
    }
  }

  const shippingCharge = cartSubtotal > 2000 || cartSubtotal === 0 ? 0 : 150; // free shipping over ₹2000
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingCharge);

  return (
    <CartContext.Provider
      value={{
        cart,
        saveForLater,
        wishlist,
        coupon,
        couponError,
        addToCart,
        removeFromCart,
        updateQuantity,
        moveToSaveForLater,
        moveToCart,
        toggleWishlist,
        applyCoupon,
        removeCoupon,
        clearCart,
        cartSubtotal,
        discountAmount,
        shippingCharge,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
