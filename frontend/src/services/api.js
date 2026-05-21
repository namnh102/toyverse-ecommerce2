// BƯỚC 1: CẤU HÌNH GIAO TIẾP FRONTEND - BACKEND
// Import Axios - Thư viện chính để Frontend gửi các request HTTP (GET, POST, PUT, DELETE) lên Server
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// Tạo một "instance" (bản sao) của axios với cấu hình mặc định dùng chung cho mọi request
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`, // Production: dùng VITE_API_URL (URL Render). Dev: fallback về localhost:5000
  headers: { 'Content-Type': 'application/json' }, // Mặc định báo cho Server biết đang gửi dữ liệu dạng JSON
  timeout: 15000, // Timeout: Nếu Server quá tải, không phản hồi sau 15 giây thì tự động hủy request
})

// BƯỚC 1.1: Request Interceptor (Can thiệp vào request TRƯỚC KHI nó được gửi đi)
api.interceptors.request.use((config) => {
  // Lấy token (đại diện cho phiên đăng nhập) từ state management (Zustand)
  const token = useAuthStore.getState().token
  // Nếu có token (User/Admin đã đăng nhập), nhét token này vào Header 'Authorization'
  // Server sẽ đọc Header này để biết "Ai đang gọi API" và "Có quyền (admin) hay không"
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// BƯỚC 1.2: Response Interceptor (Can thiệp vào response TRƯỚC KHI trả về cho Component)
api.interceptors.response.use(
  (response) => response, // Nếu gọi API thành công (Status 200), trả về dữ liệu nguyên vẹn
  (error) => {
    // Nếu Server trả về lỗi 401 (Unauthorized: Không có quyền hoặc Token đã hết hạn)
    if (error.response?.status === 401) {
      // Tự động xóa thông tin đăng nhập (clearAuth), có thể kích hoạt cơ chế đẩy user văng ra màn hình Login
      useAuthStore.getState().clearAuth()
    }
    return Promise.reject(error)
  }
)

export default api

// BƯỚC 2: ĐỊNH NGHĨA CÁC ĐIỂM GỌI API (SERVICES)
// Gói gọn các logic gọi API vào từng object. Khi Admin (React component) cần data, chỉ cần gọi hàm ở đây.

// LUỒNG THAO TÁC SẢN PHẨM CỦA ADMIN:
export const productService = {
  // Admin lấy danh sách SP: Gọi GET /api/products
  getAll:    (params) => api.get('/products', { params }),
  getById:   (idOrSlug) => api.get(`/products/${idOrSlug}`),
  
  // Admin TẠO MỚI SP: Gửi POST /api/products. 
  // Vì có đính kèm file ảnh, phải bắt buộc đổi Content-Type sang 'multipart/form-data'. 
  // Biến 'data' ở đây chính là FormData() mà bên AdminProducts.jsx đã đóng gói.
  create:    (data) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  
  // Admin SỬA SP: Gửi PUT /api/products/:id
  update:    (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  
  // Admin XÓA SP: Gửi DELETE /api/products/:id
  delete:    (id) => api.delete(`/products/${id}`),
  
  getReviews:(productId, params) => api.get(`/products/${productId}/reviews`, { params }),
  addReview: (productId, data) => api.post(`/products/${productId}/reviews`, data),
}

export const categoryService = {
  getAll:  (params) => api.get('/categories', { params }),
  create:  (data) => api.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:  (id, data) => api.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:  (id) => api.delete(`/categories/${id}`),
}

export const orderService = {
  create:    (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my', { params }),
  getById:   (id) => api.get(`/orders/${id}`),
  getAll:    (params) => api.get('/orders/admin', { params }),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
}

export const userService = {
  getAll:  (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update:  (id, data) => api.put(`/users/${id}`, data),
  delete:  (id) => api.delete(`/users/${id}`),
  getWishlist: () => api.get('/users/wishlist'),
  toggleWishlist: (productId) => api.post('/users/wishlist/toggle', { product_id: productId }),
}

export const homeService = {
  getBanners:     (position) => api.get('/home/banners', { params: { position } }),
  getCollections: () => api.get('/home/collections'),
  getAllCollections: () => api.get('/home/collections/all'),
}

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getBanners: () => api.get('/admin/banners'),
  createBanner: (data) => api.post('/admin/banners', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateBanner: (id, data) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),
}
