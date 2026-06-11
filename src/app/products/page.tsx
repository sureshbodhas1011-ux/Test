'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { api } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Search, SlidersHorizontal, Star, Heart, ShoppingCart, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Product {
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
}

function ProductListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { addToCart, wishlist, toggleWishlist } = useCart();

  // Filters State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sync state from query params initially
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await api.getCategories();
        setCategories(cats || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch products when state changes
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchVal) params.set('search', searchVal);
      if (selectedCat && selectedCat !== 'All') params.set('category', selectedCat);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (sortBy) params.set('sortBy', sortBy);
      params.set('page', page.toString());
      params.set('limit', '9'); // 9 items per page

      try {
        const res = await api.getProducts(params.toString());
        setProducts(res.products || []);
        setTotalPages(res.pages || 1);
        setTotalProducts(res.total || 0);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [searchVal, selectedCat, minPrice, maxPrice, sortBy, page]);

  // Sync URL search params
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'All';
    const sort = searchParams.get('sortBy') || 'newest';
    
    setSearchVal(search);
    setSelectedCat(category);
    setSortBy(sort);
    setPage(1); // reset to page 1 on filter changes
  }, [searchParams]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setMobileFiltersOpen(false);
  };

  const handleClearFilters = () => {
    setSearchVal('');
    setSelectedCat('All');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setPage(1);
    router.push('/products');
  };

  const handleCategorySelect = (catName: string) => {
    setSelectedCat(catName);
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (catName === 'All') {
      params.delete('category');
    } else {
      params.set('category', catName.toLowerCase());
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Header Title */}
        <div className="text-left space-y-2 mb-8 border-b border-zinc-900 pb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Catalog Catalogues ⚡</h1>
            <p className="text-zinc-550 text-sm">
              {totalProducts} premium items matching your filters
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center justify-center gap-1.5 px-4 py-2 border border-zinc-800 rounded-xl bg-zinc-900/40 text-sm font-semibold text-zinc-300"
            >
              <SlidersHorizontal className="w-4 h-4 text-violet-400" /> Filters
            </button>

            <button
              onClick={handleClearFilters}
              className="text-xs text-zinc-500 hover:text-zinc-300 font-bold hover:underline cursor-pointer"
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 1. Sidebar Filters - Desktop */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 glass-card p-6 rounded-2xl border border-zinc-850 sticky top-24">
            <form onSubmit={handleApplyFilters} className="space-y-6">
              
              {/* Categories Selector */}
              <div className="text-left space-y-3">
                <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Categories</h4>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleCategorySelect('All')}
                    className={`text-left text-sm py-1.5 px-3 rounded-lg transition-colors font-medium ${
                      selectedCat === 'All'
                        ? 'bg-violet-950/40 border border-violet-850 text-violet-400 font-bold'
                        : 'text-zinc-400 hover:text-zinc-250 border border-transparent'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => {
                    const isSelected = selectedCat.toLowerCase() === c.name.toLowerCase();
                    return (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => handleCategorySelect(c.name)}
                        className={`text-left text-sm py-1.5 px-3 rounded-lg transition-colors font-medium ${
                          isSelected
                            ? 'bg-violet-950/40 border border-violet-850 text-violet-400 font-bold'
                            : 'text-zinc-400 hover:text-zinc-250 border border-transparent'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-zinc-850" />

              {/* Price Filters */}
              <div className="text-left space-y-3">
                <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Price Range (₹)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block mb-1">Min Price</label>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block mb-1">Max Price</label>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Apply Price
                </button>
              </div>

            </form>
          </aside>

          {/* 2. Products Panel */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Top Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 text-left">
              
              {/* Search input inside list */}
              <div className="flex-1 max-w-sm relative">
                <input
                  type="text"
                  placeholder="Filter within list..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full glass-input pl-9 pr-3 py-1.5 rounded-lg text-xs"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              </div>

              {/* Sorting options */}
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-xs flex items-center gap-1"><ArrowUpDown className="w-3.5 h-3.5 text-violet-400" /> Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="glass-input px-3 py-1.5 rounded-lg text-xs bg-zinc-900 border-zinc-800 cursor-pointer text-zinc-300"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Customer Rated</option>
                </select>
              </div>

            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-96 rounded-2xl bg-zinc-900 animate-pulse border border-zinc-850" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => {
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

                      {/* Product Image */}
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

                      {/* Info details */}
                      <div className="text-left flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-amber-400 text-xs mb-1.5 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{p.ratingsAvg}</span>
                            <span className="text-zinc-650 font-normal">({p.reviewCount})</span>
                          </div>

                          <h3
                            onClick={() => router.push(`/products/${p._id}`)}
                            className="font-bold text-white text-sm hover:text-violet-400 cursor-pointer line-clamp-2 mb-1"
                          >
                            {p.title}
                          </h3>
                          
                          <p className="text-zinc-455 text-xs line-clamp-2 leading-relaxed mb-4">
                            {p.description}
                          </p>
                        </div>

                        <div>
                          {/* Price & Add to Cart button */}
                          <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60">
                            <div className="flex flex-col">
                              {p.discountPrice ? (
                                <>
                                  <span className="text-base font-black text-white">₹{p.discountPrice.toLocaleString('en-IN')}</span>
                                  <span className="text-xs text-zinc-650 line-through">₹{p.price.toLocaleString('en-IN')}</span>
                                </>
                              ) : (
                                <span className="text-base font-black text-white">₹{p.price.toLocaleString('en-IN')}</span>
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
                })}
              </div>
            ) : (
              // Empty State
              <div className="text-center py-16 px-6 glass-card rounded-2xl border border-zinc-850 max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">No Products Found</h3>
                <p className="text-zinc-450 text-sm">
                  We couldn't find any items matching your selected criteria. Try adjusting filters or searching other keywords.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6 border-t border-zinc-900">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-900 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-10 h-10 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      pNum === page
                        ? 'bg-violet-600 border-violet-500 text-white shadow-lg'
                        : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    {pNum}
                  </button>
                ))}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-900 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* 3. Mobile Filters Slide-in Modal Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fadeIn">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          
          {/* Panel content */}
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#09090b] border-l border-zinc-850 p-6 flex flex-col shadow-2xl animate-slideLeft overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
              <h3 className="font-extrabold text-white text-base">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyFilters} className="space-y-6 flex-1 text-left">
              {/* Categories Selector */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Categories</h4>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleCategorySelect('All');
                      setMobileFiltersOpen(false);
                    }}
                    className={`text-left text-sm py-1.5 px-3 rounded-lg transition-colors font-medium ${
                      selectedCat === 'All'
                        ? 'bg-violet-950/40 border border-violet-850 text-violet-400 font-bold'
                        : 'text-zinc-400 hover:text-zinc-250 border border-transparent'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => {
                    const isSelected = selectedCat.toLowerCase() === c.name.toLowerCase();
                    return (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => {
                          handleCategorySelect(c.name);
                          setMobileFiltersOpen(false);
                        }}
                        className={`text-left text-sm py-1.5 px-3 rounded-lg transition-colors font-medium ${
                          isSelected
                            ? 'bg-violet-950/40 border border-violet-850 text-violet-400 font-bold'
                            : 'text-zinc-400 hover:text-zinc-250 border border-transparent'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-zinc-850" />

              {/* Price range */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Price (₹)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold py-2.5 rounded-xl text-xs"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg"
                >
                  Apply
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ProductListingPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-[#09090b] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500" />
      </div>
    }>
      <ProductListContent />
    </Suspense>
  );
}
