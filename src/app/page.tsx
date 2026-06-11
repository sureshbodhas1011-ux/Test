'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { api } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  ShoppingCart,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface ProductData {
  _id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  stock: number;
  ratingsAvg: number;
  reviewCount: number;
  bestSeller: boolean;
  featured: boolean;
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, wishlist, toggleWishlist } = useCart();

  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero carousel slides state
  const [activeSlide, setActiveSlide] = useState(0);
  const heroSlides = [
    {
      title: 'Acoustics Re-engineered',
      subtitle: 'AcoustiMax ANC Series',
      description: 'Experience pure audio fidelity. Hybrid active noise cancellation, custom equalizers, and 40-hour playback.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
      cta: 'Explore Audio',
      link: '/products?category=electronics'
    },
    {
      title: 'Monochromatic Autumn Drop',
      subtitle: 'Minimalist Wardrobe',
      description: 'Clean shapes, organic denim, and handcrafted full-grain leather bags engineered for comfort and elegance.',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80',
      cta: 'Explore Style',
      link: '/products?category=fashion'
    },
    {
      title: 'Breathe Pure Aromatherapy',
      subtitle: 'Aura Bamboo Diffusers',
      description: 'Bring tranquil spa rituals to your home. Hand-blown glass, ultrasonic mist dispensers, and ambient lighting.',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1200&auto=format&fit=crop&q=80',
      cta: 'Explore Living',
      link: '/products?category=home-kitchen'
    }
  ];

  // Review slides
  const reviews = [
    {
      name: 'Ananya Roy',
      role: 'Verified Buyer',
      text: 'The AcoustiMax headphones exceeded every expectation. ANC blocks office chatter instantly. Worth every rupee!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
    },
    {
      name: 'Kabir Mehta',
      role: 'Verified Buyer',
      text: 'Stunning Nomad leather backpack! Tanning is premium and details are solid. Fits my 16" laptop securely.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    },
    {
      name: 'Riya Sen',
      role: 'Verified Buyer',
      text: 'The GlowRx serum clears blemishes in a week. Very lightweight formulation. Shipping was exceptionally quick!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80'
    }
  ];

  const [activeReview, setActiveReview] = useState(0);

  // Flash sale countdown state
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 24, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 14, minutes: 0, seconds: 0 }; // reset
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial catalog
  useEffect(() => {
    async function loadData() {
      try {
        const prodData = await api.getProducts('limit=12');
        setProducts(prodData.products || []);
        
        const catData = await api.getCategories();
        setCategories(catData || []);
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleNextSlide = () => {
    setActiveSlide(prev => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const featuredProducts = products.filter(p => p.featured).slice(0, 4);
  const bestSellers = products.filter(p => p.bestSeller).slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b]">
      <Navbar />

      {/* Hero Carousel Banner Section */}
      <section className="relative w-full h-[500px] sm:h-[600px] overflow-hidden border-b border-zinc-900">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-750 ease-out flex items-center"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(9, 9, 11, 0.9) 30%, rgba(9, 9, 11, 0.4) 60%, rgba(9, 9, 11, 0.1) 100%), url(${heroSlides[activeSlide].image})`
          }}
        >
          {/* Animated Glow overlay */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 blur-[130px] rounded-full" />
          
          <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full relative z-10 grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-8 lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-850 bg-violet-950/30 text-violet-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{heroSlides[activeSlide].subtitle}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                {heroSlides[activeSlide].title}
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-lg leading-relaxed">
                {heroSlides[activeSlide].description}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => router.push(heroSlides[activeSlide].link)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-650 hover:from-violet-600 hover:to-indigo-750 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-violet-500/20 btn-glow transition-all cursor-pointer"
                >
                  {heroSlides[activeSlide].cta} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Sliders Navigation */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel indicators dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                index === activeSlide ? 'bg-violet-500 w-8' : 'bg-zinc-700 hover:bg-zinc-550'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 px-6 bg-zinc-950/70 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-950/40 border border-violet-850 flex items-center justify-center">
              <Truck className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Free Delivery</h4>
              <p className="text-zinc-500 text-xs">For all orders exceeding ₹2000</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-950/40 border border-violet-850 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Secure Payment</h4>
              <p className="text-zinc-500 text-xs">SSL Encrypted UPI, Cards & COD</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-950/40 border border-violet-850 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Easy Returns</h4>
              <p className="text-zinc-500 text-xs">7-day hassle-free refund policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-950/40 border border-violet-850 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Authentic</h4>
              <p className="text-zinc-500 text-xs">Sourced directly from companies</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-white">Curated Collections 🛍️</h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Discover catalog lines featuring premium design details and technical engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <div
                key={cat._id}
                onClick={() => router.push(`/products?category=${cat.name.toLowerCase()}`)}
                className="relative h-64 rounded-2xl overflow-hidden glass-card hover:border-violet-500/50 cursor-pointer group transition-all duration-300"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(9, 9, 11, 0.95) 20%, rgba(9, 9, 11, 0.2) 60%), url(${cat.image})`
                  }}
                />
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-left">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-0.5">{cat.name}</h3>
                    <p className="text-zinc-400 text-xs">Shop catalog</p>
                  </div>
                  <span className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-white group-hover:bg-violet-600 group-hover:border-violet-500 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))
          ) : (
            // Category skeleton loader
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-zinc-900 animate-pulse border border-zinc-850" />
            ))
          )}
        </div>
      </section>

      {/* Flash Sale Banner Section */}
      <section className="px-6 max-w-7xl mx-auto w-full">
        <div className="glass-card rounded-3xl p-8 md:p-12 border border-violet-900/30 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 bg-gradient-to-r from-violet-950/20 via-zinc-950 to-zinc-950 text-left">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 blur-[100px] rounded-full -mr-20 -mt-20" />
          
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-700 bg-violet-950/40 text-violet-400 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Limited Time Offer</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              AcoustiMax Wireless Series <br />
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Save Flat 22% Today!</span>
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Use Coupon Code <strong className="text-violet-400 border-b border-dashed border-violet-500 pb-0.5">MEGA20</strong> at checkout to claim additional discounts + free express shipping.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 shrink-0 w-full lg:w-auto">
            {/* Timer container */}
            <div className="flex gap-3 text-center">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 w-16 sm:w-20">
                <span className="block text-2xl font-black text-white">{timeLeft.hours.toString().padStart(2, '0')}</span>
                <span className="text-[10px] text-zinc-550 uppercase font-bold tracking-wider">Hours</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 w-16 sm:w-20">
                <span className="block text-2xl font-black text-white">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <span className="text-[10px] text-zinc-550 uppercase font-bold tracking-wider">Mins</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 w-16 sm:w-20">
                <span className="block text-2xl font-black text-white">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                <span className="text-[10px] text-zinc-550 uppercase font-bold tracking-wider">Secs</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/products/product_id_mock_1')}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-violet-500/25 btn-glow transition-all w-full cursor-pointer"
            >
              Claim Offer Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="flex items-end justify-between border-b border-zinc-900 pb-5">
          <div className="text-left space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Featured Drops 🔥</h2>
            <p className="text-zinc-500 text-sm">Finest catalog picks curated for you.</p>
          </div>
          <button
            onClick={() => router.push('/products')}
            className="text-violet-400 hover:text-violet-350 text-xs sm:text-sm font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            See All Products <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {!loading ? (
            featuredProducts.map((p) => {
              const inWishlist = wishlist.includes(p._id);
              const finalPrice = p.discountPrice || p.price;
              
              return (
                <div
                  key={p._id}
                  className="glass-card rounded-2xl border border-zinc-850 hover:border-zinc-750 p-4 transition-all duration-300 group flex flex-col h-full relative"
                >
                  {/* Badge */}
                  {p.discountPrice && (
                    <span className="absolute top-6 left-6 z-10 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      SAVE {Math.round(((p.price - p.discountPrice) / p.price) * 100)}%
                    </span>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(p._id, !!user)}
                    className="absolute top-6 right-6 z-10 p-2 rounded-lg bg-zinc-900/85 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>

                  {/* Image Product Container */}
                  <div
                    onClick={() => router.push(`/products/${p._id}`)}
                    className="aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 relative mb-4 cursor-pointer"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Content Product */}
                  <div className="text-left flex-1 flex flex-col justify-between">
                    <div>
                      {/* Rating details */}
                      <div className="flex items-center gap-1 text-amber-400 text-xs mb-1.5 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{p.ratingsAvg}</span>
                        <span className="text-zinc-650 font-normal">({p.reviewCount} reviews)</span>
                      </div>

                      <h3
                        onClick={() => router.push(`/products/${p._id}`)}
                        className="font-bold text-white text-base leading-snug hover:text-violet-400 cursor-pointer line-clamp-1 mb-1"
                      >
                        {p.title}
                      </h3>
                      
                      <p className="text-zinc-450 text-xs line-clamp-2 leading-relaxed mb-4">
                        {p.description}
                      </p>
                    </div>

                    <div>
                      {/* Price & Add to Cart button */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60">
                        <div className="flex flex-col">
                          {p.discountPrice ? (
                            <>
                              <span className="text-lg font-black text-white">₹{p.discountPrice.toLocaleString('en-IN')}</span>
                              <span className="text-xs text-zinc-650 line-through">₹{p.price.toLocaleString('en-IN')}</span>
                            </>
                          ) : (
                            <span className="text-lg font-black text-white">₹{p.price.toLocaleString('en-IN')}</span>
                          )}
                        </div>

                        <button
                          onClick={() => addToCart({
                            productId: p._id,
                            title: p.title,
                            price: p.price,
                            discountPrice: p.discountPrice,
                            image: p.images[0],
                            stock: p.stock
                          })}
                          className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-lg hover:shadow-violet-500/10 transition-all cursor-pointer"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Skeleton cards
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-96 rounded-2xl bg-zinc-900 animate-pulse border border-zinc-850" />
            ))
          )}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-10 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="flex items-end justify-between border-b border-zinc-900 pb-5">
          <div className="text-left space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Best Sellers 🌟</h2>
            <p className="text-zinc-550 text-sm">Loved and highly rated by customers worldwide.</p>
          </div>
          <button
            onClick={() => router.push('/products?sortBy=rating')}
            className="text-violet-400 hover:text-violet-350 text-xs sm:text-sm font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            See Top Rated <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {!loading ? (
            bestSellers.map((p) => {
              const inWishlist = wishlist.includes(p._id);
              return (
                <div
                  key={p._id}
                  className="glass-card rounded-2xl border border-zinc-850 hover:border-zinc-750 p-4 transition-all duration-300 group flex flex-col h-full relative"
                >
                  {/* Badge */}
                  <span className="absolute top-6 left-6 z-10 bg-violet-650 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    BEST SELLER
                  </span>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(p._id, !!user)}
                    className="absolute top-6 right-6 z-10 p-2 rounded-lg bg-zinc-900/85 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>

                  <div
                    onClick={() => router.push(`/products/${p._id}`)}
                    className="aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 relative mb-4 cursor-pointer"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="text-left flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-amber-400 text-xs mb-1.5 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{p.ratingsAvg}</span>
                        <span className="text-zinc-650 font-normal">({p.reviewCount} reviews)</span>
                      </div>

                      <h3
                        onClick={() => router.push(`/products/${p._id}`)}
                        className="font-bold text-white text-base leading-snug hover:text-violet-400 cursor-pointer line-clamp-1 mb-1"
                      >
                        {p.title}
                      </h3>
                      
                      <p className="text-zinc-450 text-xs line-clamp-2 leading-relaxed mb-4">
                        {p.description}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60">
                        <div className="flex flex-col">
                          {p.discountPrice ? (
                            <>
                              <span className="text-lg font-black text-white">₹{p.discountPrice.toLocaleString('en-IN')}</span>
                              <span className="text-xs text-zinc-650 line-through">₹{p.price.toLocaleString('en-IN')}</span>
                            </>
                          ) : (
                            <span className="text-lg font-black text-white">₹{p.price.toLocaleString('en-IN')}</span>
                          )}
                        </div>

                        <button
                          onClick={() => addToCart({
                            productId: p._id,
                            title: p.title,
                            price: p.price,
                            discountPrice: p.discountPrice,
                            image: p.images[0],
                            stock: p.stock
                          })}
                          className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-lg hover:shadow-violet-500/10 transition-all cursor-pointer"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-96 rounded-2xl bg-zinc-900 animate-pulse border border-zinc-850" />
            ))
          )}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-20 bg-zinc-950/40 border-t border-b border-zinc-900 w-full px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8 relative">
          <h2 className="text-3xl font-black text-white">What Our Customers Say 💬</h2>
          
          <div className="min-h-[160px] flex flex-col justify-center items-center">
            <div className="flex justify-center text-amber-400 gap-1 mb-4">
              {Array(reviews[activeReview].rating).fill(0).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            
            <p className="text-zinc-300 text-base md:text-lg italic leading-relaxed max-w-2xl">
              "{reviews[activeReview].text}"
            </p>
            
            <div className="flex items-center gap-3 mt-6">
              <img
                src={reviews[activeReview].avatar}
                alt={reviews[activeReview].name}
                className="w-10 h-10 rounded-full object-cover border border-violet-850"
              />
              <div className="text-left">
                <h4 className="font-bold text-white text-sm">{reviews[activeReview].name}</h4>
                <p className="text-zinc-550 text-xs">{reviews[activeReview].role}</p>
              </div>
            </div>
          </div>

          {/* Navigation Reviews */}
          <div className="flex justify-center gap-3 pt-4">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveReview(index)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${
                  index === activeReview ? 'bg-violet-500' : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
