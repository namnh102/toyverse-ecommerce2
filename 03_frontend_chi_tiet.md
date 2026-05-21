# 📋 BÁO CÁO CHI TIẾT DỰ ÁN TOYVERSE — PHẦN 3: FRONTEND CHI TIẾT

## 1. Cấu hình dự án Frontend

### 1.1. `index.html` — HTML Entry Point
```html
<html lang="vi">
  <head>
    <meta name="description" content="ToyVerse — Collectible Toys..." />
    <meta name="keywords" content="blind box, figure, plush toy..." />
    <meta property="og:title" content="ToyVerse — Collect the Universe" />
    <title>ToyVerse — Collect the Universe</title>
    <!-- Google Fonts: Nunito (body) + Outfit (headings) -->
    <link href="https://fonts.googleapis.com/css2?family=Nunito...&family=Outfit..." />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```
→ SEO meta tags, Open Graph, Google Fonts (Nunito + Outfit), mount point `#root`.

### 1.2. `vite.config.js` — Cấu hình Vite
```javascript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },  // Import shorthand: @/components/...
  },
  server: {
    port: 5173,
    proxy: {
      '/api':     { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
})
```
**Proxy quan trọng:**
- `/api/*` → Chuyển request tới backend `:5000` → Tránh CORS khi dev
- `/uploads/*` → Serve hình ảnh sản phẩm từ backend

---

## 2. Entry Points

### 2.1. `src/main.jsx` (51 dòng) — React Entry

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>      {/* React Query */}
      <BrowserRouter>                                {/* React Router */}
        <App />                                      {/* Root component */}
        <Toaster position="top-right" ... />         {/* Toast notifications */}
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
```

**Provider hierarchy (từ ngoài vào trong):**
1. **React.StrictMode** — Phát hiện side effects trong development
2. **QueryClientProvider** — React Query cho server state (cache 60s, retry 1 lần)
3. **BrowserRouter** — Routing dựa trên URL
4. **Toaster** — Thông báo toast (style custom: Nunito font, border-radius 14px)

### 2.2. `src/App.jsx` (63 dòng) — Router & Routes

**Cấu trúc Route:**
```
/ (Layout)                          ← Public layout (Navbar + Footer + CartDrawer)
├── /                               ← HomePage
├── /shop                           ← ShopPage
├── /products/:idOrSlug             ← ProductDetailPage
├── /cart                           ← CartPage
├── /auth                           ← AuthPage (Login/Register)
├── /wishlist                       ← WishlistPage
│
├── (ProtectedRoute)                ← Yêu cầu đăng nhập
│   ├── /checkout                   ← CheckoutPage
│   ├── /orders/:id                 ← OrderConfirmPage
│   └── /account                    ← AccountPage
│
├── /admin (ProtectedRoute role="admin")  ← Yêu cầu Admin
│   ├── /admin                      ← AdminDashboard
│   ├── /admin/products             ← AdminProducts
│   ├── /admin/orders               ← AdminOrders
│   ├── /admin/users                ← AdminUsers
│   └── /admin/categories           ← AdminCategories
│
└── * (catch-all)                   ← NotFoundPage (404)
```

---

## 3. Service Layer — API Communication

### `src/services/api.js` (78 dòng)

**Axios Instance:**
```javascript
const api = axios.create({
  baseURL: '/api',                              // Proxy qua Vite
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,                               // 15 giây timeout
})
```

**Request Interceptor — Tự động gắn token:**
```javascript
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token    // Lấy token từ Zustand store
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```
→ Mỗi request tự động gắn header `Authorization: Bearer <token>` nếu đã đăng nhập.

**Response Interceptor — Xử lý 401:**
```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth()         // Auto logout khi token hết hạn
    }
    return Promise.reject(error)
  }
)
```

**Service Helpers (typed API calls):**
```javascript
export const productService = {
  getAll:     (params) => api.get('/products', { params }),
  getById:    (idOrSlug) => api.get(`/products/${idOrSlug}`),
  create:     (data) => api.post('/products', data, { headers: multipart }),
  update:     (id, data) => api.put(`/products/${id}`, data, { headers: multipart }),
  delete:     (id) => api.delete(`/products/${id}`),
  getReviews: (productId, params) => api.get(`/products/${productId}/reviews`, { params }),
  addReview:  (productId, data) => api.post(`/products/${productId}/reviews`, data),
}
// Tương tự: categoryService, orderService, userService, homeService, adminService
```

**Kết nối giữa Frontend ↔ Backend:**
```
ProductCard.jsx → useCartStore.addToCart()
                     → api.post('/cart/add')          [services/api.js]
                         → Vite Proxy /api            [vite.config.js]
                             → Express /api/cart/add  [routes/cart.js]
                                 → authenticate       [middlewares/auth.js]
                                     → cartController.addItem  [controllers/cartController.js]
                                         → CartItem.findOneAndUpdate  [models/cartModel.js]
                                             → MongoDB
```

---

## 4. State Management — Zustand Stores

### 4.1. `src/store/authStore.js` (63 dòng)

```javascript
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,           // User object (full_name, email, role...)
      token: null,          // JWT token string
      isLoading: false,     // Loading state

      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),

      login: async (email, password) => {
        set({ isLoading: true })
        const { data } = await api.post('/auth/login', { email, password })
        set({ user: data.user, token: data.token, isLoading: false })
        return { success: true }
      },

      register: async (formData) => { ... },  // Tương tự login
      logout: () => set({ user: null, token: null }),
      refreshUser: async () => { ... },        // Refresh user data từ server

      isAuthenticated: () => !!get().token,
      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'toyverse-auth',      // Key trong localStorage
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
```

**Persist middleware:** Tự động lưu `user` + `token` vào `localStorage` → Giữ đăng nhập khi refresh trang.

### 4.2. `src/store/cartStore.js` (72 dòng)

```javascript
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],            // Mảng cart items
      subtotal: 0,          // Tổng tiền
      isOpen: false,        // Cart drawer đang mở?
      isLoading: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      fetchCart: async () => {
        const { data } = await api.get('/cart')
        set({ items: data.items, subtotal: data.subtotal })
      },

      addToCart: async (productId, quantity = 1) => {
        const { data } = await api.post('/cart/add', { product_id: productId, quantity })
        set({ items: data.items, subtotal: data.subtotal, isOpen: true })
        toast.success('Added to cart! 🛍️')
      },

      updateQuantity: async (productId, quantity) => { ... },
      removeItem: async (productId) => { ... },
      clearCart: () => set({ items: [], subtotal: 0 }),
    }),
    {
      name: 'toyverse-cart',
      partialize: (state) => ({ items: state.items, subtotal: state.subtotal }),
    }
  )
)
```

---

## 5. Utilities

### `src/utils/format.js` (68 dòng)

| Hàm | Chức năng | Ví dụ |
|---|---|---|
| `formatPrice(amount)` | Format VNĐ | `320000` → `"320.000 ₫"` |
| `formatDate(dateStr)` | Format ngày VN | `"2026-04-20"` → `"20/04/2026, 15:30"` |
| `truncate(str, maxLen)` | Cắt chuỗi | `"Hello World"` (5) → `"Hello..."` |
| `getProductImage(product)` | Lấy ảnh chính | Ưu tiên `primary_image` → `images[0]` |
| `getDiscount(price, comparePrice)` | Tính % giảm | `(320000, 380000)` → `16` |
| `ORDER_STATUS_MAP` | Map trạng thái | `{ pending: { label: 'Pending', color: '#FFB347' } }` |
| `PAYMENT_STATUS_MAP` | Map thanh toán | `{ paid: { label: 'Paid', color: '#6BCB8B' } }` |

---

## 6. Components (Chi tiết)

### 6.1. `components/layout/Layout.jsx` (35 dòng)

```jsx
export default function Layout() {
  const { pathname } = useLocation()
  const { isAuthenticated } = useAuthStore()
  const { fetchCart } = useCartStore()

  // Scroll to top khi chuyển trang
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  // Đồng bộ giỏ hàng khi đăng nhập
  useEffect(() => {
    if (isAuthenticated()) fetchCart()
  }, [isAuthenticated()])

  return (
    <div>
      <Navbar />          {/* Thanh điều hướng */}
      <main><Outlet /></main>  {/* Nội dung trang con (react-router) */}
      <Footer />          {/* Chân trang */}
      <CartDrawer />      {/* Drawer giỏ hàng (luôn render, ẩn/hiện) */}
    </div>
  )
}
```

### 6.2. `components/layout/Navbar.jsx` (206 dòng)

**Tính năng:**
- Logo ToyVerse với link về trang chủ
- 7 navigation links: Home, Shop, New Arrivals, Best Sellers, Blind Box, Collections, Sale
- Thanh tìm kiếm toggle (mở/đóng)
- Icon Wishlist (link đến /wishlist)
- Account dropdown menu (profile, orders, admin link, logout)
- Cart button với badge số lượng
- Mobile hamburger menu (responsive)
- Scroll effect: background thay đổi khi scroll xuống

**Kết nối:**
- `useAuthStore` → user info, đăng nhập/xuất
- `useCartStore` → items count, openCart()
- `useNavigate` → điều hướng search

### 6.3. `components/layout/Footer.jsx` (129 dòng)

4 cột: Brand + tagline, Shop links, Help links, About links, Newsletter signup, Trust badges, Social links, Copyright.

### 6.4. `components/common/ProtectedRoute.jsx` (17 dòng)

```jsx
export default function ProtectedRoute({ requiredRole }) {
  const { user, token } = useAuthStore()
  if (!token || !user) return <Navigate to="/auth" replace />     // Chưa đăng nhập → Auth
  if (requiredRole && user.role !== requiredRole) 
    return <Navigate to="/" replace />                             // Sai role → Home
  return <Outlet />                                                 // OK → Render child routes
}
```

### 6.5. `components/product/ProductCard.jsx` (128 dòng)

**Component hiển thị 1 sản phẩm trong grid.**

**Props:** `{ product, layout }` — layout: `'grid'` hoặc `'list'`

**Hiển thị:**
- Ảnh sản phẩm (hoặc placeholder 🎁 nếu không có)
- Status badges: Hot 🔥, New ✨, Limited ⭐, Sold Out
- Blind Box badge (nếu `is_blind_box`)
- Discount badge (VD: -16%)
- Nút Wishlist (toggle yêu thích)
- Quick Add to Cart button (hiện khi hover)
- Sold Out overlay (nếu `stock_qty === 0`)
- Category name, Product name
- Star rating + review count
- Giá bán + giá gốc (gạch ngang)

**Xử lý sự kiện:**
```jsx
handleAddToCart → stopPropagation → useCartStore.addToCart(product.id, 1)
handleWishlist  → stopPropagation → userService.toggleWishlist(product.id)
```

### 6.6. `components/cart/CartDrawer.jsx` (166 dòng)

**Drawer slide-in từ bên phải, hiện khi `isOpen === true`.**

**Tính năng:**
- Backdrop overlay (click để đóng)
- Header: "Your Cart" + item count + close button
- Free shipping progress bar (ngưỡng 500.000đ)
- Danh sách items: ảnh, tên (link), giá, qty controls (+/-), subtotal, xoá
- Empty state: emoji + CTA browse shop
- Footer: subtotal, shipping note, Checkout button, View Full Cart button
- Keyboard: Escape để đóng
- Body scroll lock khi mở

### 6.7. `components/admin/AdminLayout.jsx` (90 dòng)

**Layout riêng cho trang Admin.**

**Cấu trúc:**
- Sidebar (collapsible): Logo, 5 nav items (Dashboard, Products, Orders, Users, Categories), User info, Logout
- Main area: Top bar (title + "View Site" button) + `<Outlet />` cho content

---

## 7. Pages (Chi tiết tất cả trang)

### 7.1. `HomePage.jsx` (379 dòng) — Trang chủ

**Dùng React Query để fetch 6 loại data song song:**
```javascript
const { data: bannersData }     = useQuery(['banners'],           () => homeService.getBanners('hero'))
const { data: categoriesData }  = useQuery(['categories'],        () => categoryService.getAll({ active: true }))
const { data: featuredData }    = useQuery(['products','featured'],() => productService.getAll({ is_featured: true, limit: 8 }))
const { data: bestSellersData } = useQuery(['products','best-sellers'], () => productService.getAll({ is_best_seller: true, limit: 8 }))
const { data: newArrivalsData } = useQuery(['products','new'],    () => productService.getAll({ status: 'new', limit: 8 }))
const { data: collectionsData } = useQuery(['collections','featured'], () => homeService.getCollections())
```

**Các sections (từ trên xuống):**
1. **HeroSection** — Banner chính: title, subtitle, 2 CTA buttons, stats (500+ Products, 30+ Collections, 10K+ Collectors), animated visual cards
2. **CategorySection** — 8 category cards (emoji + tên) → link đến `/shop?category=...`
3. **Featured Drops** — ProductCard grid 8 sản phẩm nổi bật + "View All" link
4. **BlindBoxSection** — Banner giới thiệu Blind Box: features, visual 6 cubes animated
5. **Best Sellers** — ProductCard grid 8 sản phẩm bán chạy
6. **CollectionShowcase** — 3 collection cards lớn (gradient background, orbs)
7. **New Arrivals** — ProductCard grid 8 sản phẩm mới
8. **ReviewsSection** — 4 review cards (hardcoded data)
9. **Newsletter CTA** — Email subscribe form

### 7.2. `ShopPage.jsx` (342 dòng) — Trang cửa hàng

**URL-based filtering:** Tất cả filters được lưu trong URL `searchParams`:
```
/shop?category=figures&status=hot&sort=price_asc&page=2&q=bear
```

**Tính năng:**
- **Breadcrumb**: Home / Shop / Category
- **Search bar** trong toolbar
- **Filter sidebar** (collapsible trên mobile):
  - Category filter (button list)
  - Status filter (All, New, Hot, Limited)
  - Type checkboxes (Blind Box only, Best Sellers)
  - Price range inputs (min — max)
  - Clear all button
- **Sort dropdown**: Newest, Most Popular, Price Low→High, Price High→Low, Top Rated
- **Layout toggle**: Grid / List view
- **Product grid** với ProductCard components
- **Pagination** với Previous/Next + page numbers
- **Loading skeleton** khi đang fetch
- **Empty state** khi không có kết quả

### 7.3. `ProductDetailPage.jsx` (370 dòng) — Chi tiết sản phẩm

**Layout 2 cột:**
- **Gallery (trái):** Ảnh chính lớn + thumbnails (click để đổi ảnh)
- **Info (phải):**
  - Badge row (Blind Box, Hot/New/Limited, "Only X left!")
  - Product name (h1)
  - Star rating + review count
  - Short description
  - Price block (giá bán + giá gốc + % save)
  - Quantity selector (+/-)
  - CTA buttons: Add to Cart, Buy Now, Wishlist heart, Share
  - Trust signals: Free ship over 500K, Secure packaging, 7-day returns
  - Specs table (Brand, Material, Dimensions, Collection, Category, SKU)

**Tabs section:**
- Description — Mô tả chi tiết sản phẩm
- Specs & Info — Bảng thông số
- Reviews — Danh sách đánh giá + aggregate stats

**Related Products:** Grid 4 sản phẩm cùng category

### 7.4. `AuthPage.jsx` (157 dòng) — Đăng nhập / Đăng ký

**Tabs:** Sign In | Create Account

**Login form:** email + password → `authStore.login()` → redirect "/"
**Register form:** full_name + email + password + confirm → `authStore.register()` → redirect "/"

**Validation client-side:**
- Email required + format check
- Password min 6 characters
- Passwords must match (register)

**Sau đăng nhập:** `fetchCart()` đồng bộ giỏ hàng từ server.

**Demo hint:** Hiển thị tài khoản demo `admin@toyverse.com / Admin@123`

### 7.5. `CartPage.jsx` (111 dòng) — Trang giỏ hàng đầy đủ

**Layout 2 cột:**
- **Items list (trái):** Mỗi item: ảnh, tên (link), giá/each, qty controls, subtotal, remove button
- **Order Summary (phải):**
  - Subtotal
  - Shipping (FREE nếu >= 500.000đ, ngược lại 30.000đ)
  - Total
  - "Proceed to Checkout" button
  - "Continue Shopping" button

**Empty state:** Emoji + "Your cart is empty" + Browse Shop button

### 7.6. `CheckoutPage.jsx` (191 dòng) — Thanh toán

**Layout 2 cột:**
- **Form (trái):**
  - Shipping Info: Full Name, Phone, Address, City, Province, Notes
  - Payment Method: 3 radio options (COD 💵, Bank Transfer 🏦, E-Wallet 📱)
- **Order Summary (phải):**
  - Danh sách items (ảnh + qty badge + tên + price + subtotal)
  - Subtotal, Shipping, Total
  - Secure checkout notice 🔒
  - "Place Order" button

**Submit flow:**
```
1. Validate form → hiện errors
2. orderService.create({ ...form, payment_method })
3. clearCart()
4. toast.success('Order placed! 🎉')
5. navigate(`/orders/${order.id}`)  → Trang xác nhận
```

### 7.7. `OrderConfirmPage.jsx` (109 dòng) — Xác nhận đơn hàng

**Hiển thị sau khi đặt hàng thành công:**
- Success header: ✓ icon + "Order Confirmed! 🎉" + order_number + date + status badge
- Items ordered: danh sách items + totals
- Shipping info: tên, địa chỉ, SĐT
- Payment info: phương thức + trạng thái
- Actions: "View All Orders" + "Continue Shopping"

### 7.8. `AccountPage.jsx` (213 dòng) — Trang tài khoản

**Layout sidebar + content:**

**Sidebar:** Avatar + user info + 3 tabs + Admin Panel link (nếu admin) + Sign Out

**3 Tabs:**
1. **Profile** — Form cập nhật Full Name + Phone, email (disabled)
2. **My Orders** — Danh sách đơn hàng: order_number, date, item_count, status badge, total → link chi tiết
3. **Password** — Form đổi mật khẩu: current + new + confirm

### 7.9. `WishlistPage.jsx` (56 dòng) — Danh sách yêu thích

- Fetch wishlist từ `userService.getWishlist()`
- Hiển thị ProductCard grid
- Empty state: "Your wishlist is empty" + Browse Shop

### 7.10. `NotFoundPage.jsx` (24 dòng) — Trang 404

Emoji 🎁 + "404 — Lost in the Toy Universe 🌌" + 2 buttons (Go Home, Browse Shop)

---

## 8. Admin Pages

### 8.1. `AdminDashboard.jsx` (166 dòng)

**4 stat cards:** Total Revenue, Total Orders, Products, Customers
**Recent Orders table:** Order ID, Customer, Amount, Status
**Top Products list:** Image, name, sold count, stock, price
**Revenue Trend chart:** Bar chart 12 tháng (CSS bars, không dùng chart library)

### 8.2. `AdminProducts.jsx` (292 dòng)

**Tính năng:**
- Search bar
- Product table: Product (thumb + name + SKU), Category, Price, Stock (highlight nếu < 10), Status, Sold, Actions (Edit/Delete)
- Pagination
- **ProductFormModal:** Form tạo/sửa sản phẩm với tất cả fields (name, SKU, category, price, compare_price, stock, status, brand, material, dimensions, checkboxes, descriptions, file upload images)

### 8.3. `AdminOrders.jsx` (112 dòng)

- Search by order number / customer name
- Status filter dropdown (All, Pending, Confirmed, Shipping, Completed, Cancelled)
- Orders table: Order#, Customer (name + email), Items, Total, Payment, Date, Status (dropdown để thay đổi)

### 8.4. `AdminUsers.jsx` (120 dòng)

- Search by name / email
- Users table: Name, Email, Phone, Role (click toggle admin/user), Status (click toggle active/disabled), Joined date, Delete button

### 8.5. `AdminCategories.jsx` (160 dòng)

- Categories table: Name + description, Slug, Product count, Status (Active/Inactive), Actions (Edit/Delete)
- **CategoryFormModal:** Form tạo/sửa category (name, slug auto-gen, description, sort_order, active checkbox, image upload)

---

> **Tiếp tục đọc:** [Phần 4 — Luồng Hoạt Động](file:///C:/Users/nam/.gemini/antigravity/brain/a2592d9c-4ea2-4f6b-957f-09dc64f3b7ff/04_luong_hoat_dong.md)
