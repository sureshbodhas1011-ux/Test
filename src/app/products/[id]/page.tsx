'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { api } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Star, Heart, ShoppingCart, CreditCard, ChevronRight, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';

interface ProductDetail {
  _id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  stock: number;
  specifications: Record<string, string>;
  ratingsAvg: number;
  reviewCount: number;
  bestSeller: boolean;
  featured: boolean;
}

interface ReviewDetail {
  _id: string;
  username: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

export default function ProductDetails() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, wishlist, toggleWishlist } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<ReviewDetail[]>([]);
  const [related, setRelated] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [selectedImage, setSelectedImage] = useState('');
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  // Tab State
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Fetch product detail, reviews, and related items
  useEffect(() => {
    async function loadProductData() {
      if (!id) return;
      setLoading(true);
      try {
        const prod = await api.getProduct(id);
        setProduct(prod);
        setSelectedImage(prod.images[0]);

        // Load reviews
        const revData = await api.getProductReviews(id);
        setReviews(revData || []);

        // Load related items
        const relData = await api.getProducts(`category=${prod.category}&limit=5`);
        if (relData && relData.products) {
          setRelated(relData.products.filter((p: any) => p._id !== id).slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProductData();
    // Reset form states
    setReviewSuccess(false);
    setReviewError('');
    setNewTitle('');
    setNewComment('');
    setNewRating(5);
  }, [id]);

  // Image Zoom Magnifier Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  // Actions
  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      productId: product._id,
      title: product.title,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images[0],
      stock: product.stock
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    handleAddToCart();
    router.push('/cart');
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);

    if (!user) {
      setReviewError('You must be logged in to write a review.');
      return;
    }

    if (!newTitle.trim() || !newComment.trim()) {
      setReviewError('Please fill out all fields.');
      return;
    }

    try {
      const addedReview = await api.createReview({
        productId: id,
        rating: newRating,
        title: newTitle.trim(),
        comment: newComment.trim()
      });

      setReviews([addedReview, ...reviews]);
      setReviewSuccess(true);
      setNewTitle('');
      setNewComment('');
      
      // Update local product rating stats
      if (product) {
        const newCount = product.reviewCount + 1;
        const newAvg = parseFloat(((product.ratingsAvg * product.reviewCount + newRating) / newCount).toFixed(1));
        setProduct({ ...product, reviewCount: newCount, ratingsAvg: newAvg });
      }
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review. You may have already reviewed this product.');
    }
  };

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

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-[#09090b]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500" />
          <h2 className="text-xl font-bold text-white">Product Not Found</h2>
          <button onClick={() => router.push('/products')} className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all cursor-pointer">
            Back to Shop
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const inWishlist = wishlist.includes(product._id);
  const outOfStock = product.stock <= 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b]">
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 text-left">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span className="hover:text-zinc-350 cursor-pointer" onClick={() => router.push('/')}>Home</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="hover:text-zinc-350 cursor-pointer" onClick={() => router.push('/products')}>Shop</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="hover:text-zinc-350 cursor-pointer" onClick={() => router.push(`/products?category=${product.category.toLowerCase()}`)}>{product.category}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-300 truncate max-w-[200px]">{product.title}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-16">
        {/* Upper Segment: Gallery & Purchase Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Gallery - Col Span 6 */}
          <div className="lg:col-span-6 space-y-4 flex flex-col items-center">
            
            {/* Main zoom screen container */}
            <div
              className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-850 cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              
              {/* Floating Magnifier Zoom window */}
              <div
                className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-150"
                style={{
                  ...zoomStyle,
                  backgroundImage: `url(${selectedImage})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '200%' // double magnification size
                }}
              />
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto w-full py-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 border-2 transition-all cursor-pointer ${
                      selectedImage === img ? 'border-violet-500 scale-102' : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <img src={img} alt={`thumbnail-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Details & Options - Col Span 6 */}
          <div className="lg:col-span-6 text-left space-y-6">
            <div className="space-y-3">
              {/* Badges row */}
              <div className="flex gap-2 flex-wrap">
                {product.bestSeller && (
                  <span className="bg-violet-950 border border-violet-800 text-violet-400 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                    Best Seller
                  </span>
                )}
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="bg-amber-950 border border-amber-800 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-md animate-pulse">
                    Only {product.stock} Left in Stock!
                  </span>
                )}
                {outOfStock && (
                  <span className="bg-rose-950 border border-rose-800 text-rose-400 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                    Out of Stock
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug">{product.title}</h1>
              
              {/* Ratings overview */}
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }, (_, idx) => (
                    <Star
                      key={idx}
                      className={`w-4 h-4 ${
                        idx < Math.round(product.ratingsAvg) ? 'fill-amber-400 text-amber-400' : 'text-zinc-750'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-white">{product.ratingsAvg}</span>
                <span className="text-zinc-550 text-xs">({product.reviewCount} user reviews)</span>
              </div>
            </div>

            {/* Pricing details */}
            <div className="p-5 rounded-2xl bg-zinc-950/40 border border-zinc-900 space-y-1">
              <span className="text-xs text-zinc-500">Special Price</span>
              <div className="flex items-baseline gap-3">
                {product.discountPrice ? (
                  <>
                    <span className="text-3xl font-black text-white">₹{product.discountPrice.toLocaleString('en-IN')}</span>
                    <span className="text-sm text-zinc-550 line-through">MRP: ₹{product.price.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-emerald-400 font-bold">
                      SAVE ₹{(product.price - product.discountPrice).toLocaleString('en-IN')}!
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-black text-white">₹{product.price.toLocaleString('en-IN')}</span>
                )}
              </div>
              <p className="text-[10px] text-zinc-500">Inclusive of all local taxes. Free delivery over ₹2000.</p>
            </div>

            {/* Micro specs bullet items */}
            <div className="space-y-1 text-sm text-zinc-400">
              <p>✓ 1 Year Authorized Brand Warranty</p>
              <p>✓ Secured transaction with SSL data channels</p>
              <p>✓ 7 Days return replacement policy</p>
            </div>

            {/* CTAs Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                disabled={outOfStock}
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed font-bold px-6 py-4 rounded-xl transition-all cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5 text-violet-400" /> Add to Cart
              </button>
              
              <button
                disabled={outOfStock}
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-650 hover:from-violet-600 hover:to-indigo-750 text-white disabled:opacity-40 disabled:cursor-not-allowed font-bold px-6 py-4 rounded-xl shadow-lg btn-glow transition-all cursor-pointer"
              >
                <CreditCard className="w-5 h-5" /> Buy Now
              </button>

              <button
                onClick={() => toggleWishlist(product._id, !!user)}
                className="p-4 rounded-xl border border-zinc-850 hover:border-zinc-750 bg-zinc-950/20 text-zinc-450 hover:text-rose-500 transition-colors cursor-pointer"
                title="Add to Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>

          </div>

        </div>

        {/* Lower Segment Tabs (Description, Specs, Reviews) */}
        <div className="space-y-6">
          {/* Tab Selector Buttons */}
          <div className="flex border-b border-zinc-900 gap-6">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'desc' ? 'border-violet-500 text-white' : 'border-transparent text-zinc-450 hover:text-zinc-350'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'specs' ? 'border-violet-500 text-white' : 'border-transparent text-zinc-450 hover:text-zinc-350'
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'reviews' ? 'border-violet-500 text-white' : 'border-transparent text-zinc-450 hover:text-zinc-350'
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="text-left py-2">
            
            {/* Description Tab */}
            {activeTab === 'desc' && (
              <div className="prose prose-invert max-w-none text-zinc-400 text-sm leading-relaxed space-y-4">
                <p>{product.description}</p>
                <p>
                  Built with elite materials and designed to deliver peak reliability. Each item is strictly audited across structural tolerances to guarantee product longevity.
                </p>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specs' && (
              <div className="max-w-xl rounded-2xl overflow-hidden border border-zinc-850 divide-y divide-zinc-850">
                {Object.keys(product.specifications).length > 0 ? (
                  Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-3 p-3 text-sm">
                      <div className="font-bold text-zinc-500 uppercase text-[10px] tracking-wider flex items-center">{key}</div>
                      <div className="col-span-2 text-zinc-300 font-medium">{val}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-zinc-500">No specifications declared for this product.</div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Reviews List Feed - Col Span 7 */}
                <div className="lg:col-span-7 space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((rev) => (
                      <div key={rev._id} className="p-5 rounded-2xl bg-zinc-950/25 border border-zinc-900 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                              {rev.username.charAt(0)}
                            </span>
                            <div>
                              <strong className="text-sm text-white">{rev.username}</strong>
                              <p className="text-[10px] text-zinc-550">{new Date(rev.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          {/* Star count */}
                          <div className="flex text-amber-400">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-800'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-white">{rev.title}</h4>
                          <p className="text-zinc-400 text-xs leading-relaxed">{rev.comment}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 rounded-2xl border border-zinc-900 text-zinc-550 text-sm">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 text-zinc-650" />
                      No reviews posted yet. Be the first to write one!
                    </div>
                  )}
                </div>

                {/* Review Form - Col Span 5 */}
                <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-zinc-850 h-fit space-y-4">
                  <h4 className="font-extrabold text-white text-base">Write a Review</h4>
                  
                  {user ? (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      {/* Rating selection */}
                      <div className="space-y-1.5">
                        <label className="text-xs text-zinc-400 font-semibold block">Star Rating</label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              className="p-1 hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-zinc-800'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Title */}
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-400 font-semibold block">Review Title</label>
                        <input
                          type="text"
                          required
                          placeholder="Summarize your experience..."
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                        />
                      </div>

                      {/* Comment */}
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-400 font-semibold block">Comment</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="What did you like or dislike? Write detail feedback..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="w-full glass-input px-3 py-2 rounded-lg text-xs resize-none"
                        />
                      </div>

                      {reviewError && (
                        <p className="text-xs text-rose-400 font-semibold animate-pulse">{reviewError}</p>
                      )}
                      
                      {reviewSuccess && (
                        <p className="text-xs text-emerald-400 font-semibold">✓ Review submitted successfully!</p>
                      )}

                      <button
                        type="submit"
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg transition-colors cursor-pointer"
                      >
                        Submit Feedback
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-6 text-sm text-zinc-500 space-y-3">
                      <p>You must be signed in to submit a review.</p>
                      <button
                        onClick={() => router.push('/auth/login')}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold px-4 py-2 rounded-lg text-xs"
                      >
                        Sign In Now
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>

        {/* Related Products Carousel/List */}
        {related.length > 0 && (
          <div className="space-y-6 pt-10 border-t border-zinc-900 text-left">
            <h3 className="text-xl font-black text-white">Related Products 💫</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => {
                const isItemWishlist = wishlist.includes(p._id);
                return (
                  <div
                    key={p._id}
                    className="glass-card rounded-2xl border border-zinc-850 hover:border-zinc-750 p-4 transition-all duration-300 group flex flex-col h-full relative"
                  >
                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(p._id, !!user)}
                      className="absolute top-6 right-6 z-10 p-2 rounded-lg bg-zinc-900/85 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${isItemWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
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

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-amber-400 text-xs mb-1.5 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{p.ratingsAvg}</span>
                          <span className="text-zinc-650 font-normal">({p.reviewCount})</span>
                        </div>

                        <h4
                          onClick={() => router.push(`/products/${p._id}`)}
                          className="font-bold text-white text-sm hover:text-violet-400 cursor-pointer line-clamp-1 mb-1"
                        >
                          {p.title}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60">
                        <span className="text-sm font-black text-white">₹{(p.discountPrice || p.price).toLocaleString('en-IN')}</span>
                        <button
                          onClick={() => addToCart({
                            productId: p._id,
                            title: p.title,
                            price: p.price,
                            discountPrice: p.discountPrice,
                            image: p.images[0],
                            stock: p.stock
                          })}
                          className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors cursor-pointer"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
