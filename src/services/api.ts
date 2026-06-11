const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = { ...getHeaders(), ...options.headers };
  
  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      throw new Error(data.error || `HTTP error! status: ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error(`API Request failed on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  register: (body: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  forgotPassword: (email: string) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  updateProfile: (body: any) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  addAddress: (body: any) => request('/auth/addresses', { method: 'POST', body: JSON.stringify(body) }),
  deleteAddress: (id: string) => request(`/auth/addresses/${id}`, { method: 'DELETE' }),
  toggleWishlist: (productId: string) => request('/auth/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),

  // Products
  getProducts: (params: string) => request(`/products?${params}`),
  getProduct: (id: string) => request(`/products/${id}`),
  getCategories: () => request('/products/categories'),
  createProduct: (body: any) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id: string, body: any) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id: string) => request(`/products/${id}`, { method: 'DELETE' }),
  createCategory: (body: any) => request('/products/categories', { method: 'POST', body: JSON.stringify(body) }),

  // Reviews
  getProductReviews: (productId: string) => request(`/reviews/product/${productId}`),
  createReview: (body: any) => request('/reviews', { method: 'POST', body: JSON.stringify(body) }),

  // Coupons
  validateCoupon: (code: string, cartSubtotal: number) => request('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, cartSubtotal }) }),
  getCoupons: () => request('/coupons'),
  createCoupon: (body: any) => request('/coupons', { method: 'POST', body: JSON.stringify(body) }),

  // Orders
  createOrder: (body: any) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getMyOrders: () => request('/orders/myorders'),
  getOrder: (id: string) => request(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string, message?: string) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, message }) }),
  
  // Admin
  getUsers: () => request('/admin/users'),
  updateUserRole: (userId: string, role: string) => request(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  getSalesAnalytics: () => request('/orders/admin/analytics')
};
