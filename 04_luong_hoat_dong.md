# 📋 BÁO CÁO CHI TIẾT DỰ ÁN TOYVERSE — PHẦN 4: LUỒNG HOẠT ĐỘNG & DATABASE

## 1. Luồng Đăng Ký & Đăng Nhập (Authentication Flow)

### 1.1. Đăng ký (Register)

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant F as AuthPage.jsx
    participant S as authStore.js
    participant A as api.js
    participant B as authController.js
    participant D as MongoDB

    U->>F: Nhập full_name, email, password
    F->>F: Validate client-side (email format, password >= 6 chars)
    F->>S: register({ full_name, email, password })
    S->>A: POST /api/auth/register
    A->>A: Interceptor: Gắn header (chưa có token)
    A->>B: Request đến Express server
    B->>B: express-validator: Validate input
    B->>D: User.findByEmail(email)
    D-->>B: null (email chưa tồn tại)
    B->>B: bcrypt.hash(password, 10) → hash
    B->>D: new User({ full_name, email, password_hash }).save()
    D-->>B: User document
    B->>B: jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' })
    B-->>A: 201 { success: true, token, user }
    A-->>S: Response
    S->>S: set({ user, token }) → persist to localStorage
    S-->>F: { success: true }
    F->>F: fetchCart() đồng bộ giỏ hàng
    F->>F: toast.success('Account created! ✨')
    F->>F: navigate('/') → Chuyển về trang chủ
```

### 1.2. Đăng nhập (Login)

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant F as AuthPage.jsx
    participant S as authStore.js
    participant A as api.js
    participant B as authController.js
    participant D as MongoDB

    U->>F: Nhập email, password
    F->>S: login(email, password)
    S->>A: POST /api/auth/login
    A->>B: Request
    B->>D: User.findByEmail(email)
    D-->>B: User document (có password_hash)
    B->>B: Kiểm tra user.is_active === true
    B->>B: bcrypt.compare(password, user.password_hash)
    B->>B: jwt.sign({ id, email, role })
    B-->>A: 200 { token, user }
    A-->>S: Response
    S->>S: set({ user, token }) → localStorage
    S-->>F: { success: true }
    F->>F: fetchCart() + toast + navigate('/')
```

### 1.3. Luồng Token qua các request sau:

```
Mỗi request tiếp theo:
1. Zustand store → lấy token từ state (đã persist)
2. Axios interceptor → gắn header: Authorization: Bearer <token>
3. Express middleware authenticate:
   a. Parse header → lấy token
   b. jwt.verify(token, JWT_SECRET) → decoded = { id, email, role }
   c. req.user = decoded → Gắn user info vào request
   d. next() → Cho controller xử lý
```

---

## 2. Luồng Duyệt Sản Phẩm (Product Browsing)

### 2.1. Trang chủ (HomePage)

```mermaid
sequenceDiagram
    participant HP as HomePage.jsx
    participant RQ as React Query
    participant API as api.js
    participant SV as Express Server
    participant DB as MongoDB

    HP->>RQ: useQuery(['banners'])
    HP->>RQ: useQuery(['categories'])
    HP->>RQ: useQuery(['products', 'featured'])
    HP->>RQ: useQuery(['products', 'best-sellers'])
    HP->>RQ: useQuery(['products', 'new'])
    HP->>RQ: useQuery(['collections', 'featured'])

    Note over RQ: 6 queries chạy SONG SONG

    RQ->>API: GET /api/home/banners
    RQ->>API: GET /api/categories?active=true
    RQ->>API: GET /api/products?is_featured=true&limit=8
    RQ->>API: GET /api/products?is_best_seller=true&limit=8
    RQ->>API: GET /api/products?status=new&limit=8
    RQ->>API: GET /api/home/collections

    API->>SV: 6 HTTP requests (qua Vite proxy)
    SV->>DB: 6 MongoDB queries
    DB-->>SV: Data
    SV-->>API: JSON responses
    API-->>RQ: Cached responses

    RQ-->>HP: Render: Hero, Categories, Featured, BestSellers, NewArrivals, Collections
```

### 2.2. Trang Shop (Filter + Search + Pagination)

```
URL: /shop?category=figures&status=hot&sort=price_asc&min_price=100000&page=2&q=bear

ShopPage.jsx
    │
    ├── useSearchParams() ← Đọc filters từ URL
    │
    ├── useQuery(['products', filters])
    │       → GET /api/products?category=figures&status=hot&sort=price_asc&min_price=100000&page=2&q=bear&limit=16
    │       → productController.getAll(req.query)
    │       → Product.getAll(filters):
    │           1. Build MongoDB query:
    │              { is_active: true, status: 'hot', price: { $gte: 100000 } }
    │              + Find category by slug 'figures' → get ObjectId
    │              + $text search: 'bear'
    │           2. Sort: { price: 1 } (price_asc)
    │           3. Skip: (2-1) * 16 = 16
    │           4. Limit: 16
    │           5. Populate: category_id → { name, slug }
    │           6. Return: { rows, total, page, totalPages }
    │
    ├── Render ProductCard grid/list
    │
    └── setFilter(key, value) → setSearchParams(newURL)
            → URL thay đổi → React Query re-fetch
```

---

## 3. Luồng Giỏ Hàng (Cart Flow)

### 3.1. Thêm vào giỏ

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant PC as ProductCard.jsx
    participant CS as cartStore.js
    participant API as api.js
    participant CC as cartController.js
    participant CI as CartItem Model
    participant DB as MongoDB

    U->>PC: Click "Add to Cart"
    PC->>PC: e.preventDefault() + e.stopPropagation()
    PC->>CS: addToCart(product.id, 1)
    CS->>CS: set({ isLoading: true })
    CS->>API: POST /api/cart/add { product_id, quantity: 1 }
    API->>CC: authenticate → req.user.id
    CC->>DB: Product.findById(product_id)
    DB-->>CC: product (kiểm tra exists, is_active, stock_qty > 0)
    CC->>CI: CartItem.findOneAndUpdate(
    Note right of CI: { user_id, product_id },<br/>{ $inc: { quantity: 1 } },<br/>{ upsert: true }
    CI->>DB: Upsert cart item
    DB-->>CI: Updated/Created
    CC->>CI: CartItem.getCartByUser(userId)
    CI->>DB: Find all items → populate product info
    DB-->>CI: Cart items with product data
    CI-->>CC: { items, subtotal }
    CC-->>API: 200 { items, subtotal }
    API-->>CS: Response
    CS->>CS: set({ items, subtotal, isOpen: true })
    CS-->>PC: Done
    PC->>PC: toast.success('Added to cart! 🛍️')
    Note over CS: CartDrawer tự động mở (isOpen: true)
```

### 3.2. Cập nhật số lượng

```
CartDrawer / CartPage  →  updateQuantity(product_id, newQty)
    → PUT /api/cart/update { product_id, quantity: newQty }
    → cartController.updateItem:
        Nếu qty < 1 → Xoá item
        Nếu qty >= 1 → Update quantity
    → Trả về giỏ hàng mới
    → set({ items, subtotal })
```

---

## 4. Luồng Đặt Hàng (Order Flow) — LUỒNG QUAN TRỌNG NHẤT

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant CP as CheckoutPage.jsx
    participant API as api.js
    participant OC as orderController.js
    participant CI as CartItem Model
    participant P as Product Model
    participant O as Order Model
    participant DB as MongoDB

    U->>CP: Nhập shipping info + chọn payment method
    U->>CP: Click "Place Order"
    CP->>CP: Validate form (name, phone, address, city)
    CP->>API: POST /api/orders { shipping_*, payment_method }
    API->>OC: authenticate → req.user.id

    Note over OC: Bước 1: Lấy giỏ hàng
    OC->>CI: CartItem.getCartByUser(userId)
    CI->>DB: Query cart + populate products
    DB-->>CI: cartItems[{product, quantity}]
    CI-->>OC: cartItems

    Note over OC: Bước 2: Kiểm tra & tính toán
    OC->>OC: Kiểm tra giỏ không rỗng
    OC->>OC: Tính subtotal = Σ(price × quantity)
    OC->>OC: Tính shipping_fee = subtotal >= 500K ? 0 : 30K
    OC->>OC: total = subtotal + shipping_fee

    Note over OC: Bước 3: Xử lý từng item
    loop Mỗi item trong giỏ
        OC->>P: Kiểm tra product exists & stock_qty >= quantity
        P-->>OC: OK hoặc Error
        OC->>OC: Tạo orderItem (snapshot: name, price, image)
        OC->>P: product.stock_qty -= quantity
        OC->>P: product.total_sold += quantity
        P->>DB: Save product
    end

    Note over OC: Bước 4: Tạo Order
    OC->>O: new Order({ user_id, shipping_*, items, subtotal, shipping_fee, total, payment_method })
    O->>O: Pre-save hook: Sinh order_number = 'TV' + timestamp + random
    O->>DB: Save order
    DB-->>O: Order document

    Note over OC: Bước 5: Dọn dẹp
    OC->>CI: CartItem.deleteMany({ user_id })
    CI->>DB: Xoá toàn bộ giỏ hàng

    OC-->>API: 201 { success: true, order }
    API-->>CP: Response
    CP->>CP: cartStore.clearCart()
    CP->>CP: toast.success('Order placed! 🎉')
    CP->>CP: navigate(`/orders/${order.id}`)
```

**Các bước bảo vệ:**
1. ✅ Kiểm tra user đã đăng nhập (authenticate middleware)
2. ✅ Kiểm tra giỏ hàng không rỗng
3. ✅ Kiểm tra sản phẩm tồn tại & đang active
4. ✅ Kiểm tra đủ tồn kho (stock_qty >= quantity)
5. ✅ Snapshot thông tin sản phẩm tại thời điểm mua (tên, giá, ảnh)
6. ✅ Trừ tồn kho ngay sau khi tạo order

---

## 5. Luồng Quản Lý Admin

### 5.1. Dashboard Stats

```
AdminDashboard.jsx
    → useQuery(['admin-stats']) → GET /api/admin/stats
    → adminController.getStats():
        → Promise.all([
            Product.countDocuments(),            // total_products
            Order.countDocuments(),              // total_orders
            User.countDocuments({ role: 'user' }), // total_users
            Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } },
                             { $group: { _id: null, total: { $sum: '$total' } } }]),  // total_revenue
            Order.find().sort(-created_at).limit(8).populate('user_id'),  // recent_orders
            Product.getTopSelling(6),            // top_products
            Order.aggregate([
              { $match: { created_at >= 12 months ago } },
              { $group: { _id: yearMonth, revenue: $sum: '$total' } }
            ]),  // monthly_revenue
          ])
```

### 5.2. CRUD Sản phẩm

```
Tạo sản phẩm:
AdminProducts → Click "Add Product" → Modal mở
    → Nhập form: name, category, price, stock, status, images...
    → Submit → FormData (multipart/form-data)
        → POST /api/products
            → authenticate + requireAdmin
            → upload.array('images', max 10)     → Multer lưu ảnh
            → productController.create
                → Tạo slug từ name
                → Xử lý images array
                → new Product({...}).save()
    → onSuccess → invalidateQueries(['admin-products']) → re-fetch list

Sửa sản phẩm:
AdminProducts → Click Edit icon → Modal mở (pre-filled)
    → Sửa form → Submit → PUT /api/products/:id → update
    → Có thể upload thêm ảnh mới

Xoá sản phẩm:
AdminProducts → Click Delete icon → window.confirm()
    → DELETE /api/products/:id → xoá khỏi MongoDB
```

---

## 6. Luồng Wishlist

```
ProductCard / ProductDetailPage
    │
    ├── Click ❤️ Wishlist button
    │       → userService.toggleWishlist(product_id)
    │       → POST /api/users/wishlist/toggle { product_id }
    │       → authenticate middleware
    │       → userController.toggleWishlist:
    │           Kiểm tra đã có trong wishlist?
    │           ├── Có → Xoá khỏi wishlist → { added: false }
    │           └── Chưa → Thêm vào wishlist → { added: true }
    │       → toast: "❤️ Added!" hoặc "💔 Removed!"
    │
    └── WishlistPage
            → useQuery(['wishlist']) → GET /api/users/wishlist
            → Wishlist.getByUser(userId) → populate product info
            → Hiển thị ProductCard grid
```

---

## 7. Luồng Review Sản phẩm

```
ProductDetailPage → Tab "Reviews"
    │
    ├── Xem reviews:
    │       → useQuery(['reviews', productId])
    │       → GET /api/products/:id/reviews
    │       → reviewController.getByProduct
    │       → Review.find({ product_id }) + aggregate stats (avg, count)
    │
    └── Viết review (link tới form, nếu authenticated):
            → POST /api/products/:id/reviews { rating, title, body }
            → authenticate middleware
            → reviewController.create:
                1. Kiểm tra đã review chưa → 409 Conflict
                2. Kiểm tra verified purchase:
                   → Order.findOne({ user_id, 'items.product_id': productId, status: 'completed' })
                   → is_verified_purchase = !!order
                3. Tạo Review → save
                4. Cập nhật Product: avg_rating, review_count
                   → Review.aggregate([ { $match }, { $group: { avg, count } } ])
                   → Product.findByIdAndUpdate(productId, { avg_rating, review_count })
```

---

## 8. Database Schema (MongoDB)

Mặc dù dự án dùng MongoDB, file `database/schema.sql` chứa thiết kế ban đầu (MySQL) dùng làm tham chiếu. Mongoose Models đã chuyển đổi sang NoSQL.

### 8.1. Entity-Relationship Diagram

```mermaid
erDiagram
    USERS {
        ObjectId _id PK
        string full_name
        string email UK
        string password_hash
        string phone
        string role
        boolean is_active
    }

    CATEGORIES {
        ObjectId _id PK
        string name
        string slug UK
        string description
        string image_url
        ObjectId parent_id FK
        number sort_order
        boolean is_active
    }

    COLLECTIONS {
        ObjectId _id PK
        string name
        string slug UK
        string description
        string status
        date drop_date
        boolean is_featured
    }

    PRODUCTS {
        ObjectId _id PK
        string name
        string slug UK
        string sku
        number price
        number compare_price
        number stock_qty
        ObjectId category_id FK
        ObjectId collection_id FK
        string status
        boolean is_blind_box
        boolean is_featured
        boolean is_best_seller
        number total_sold
        number avg_rating
        number review_count
        array images
    }

    CART_ITEMS {
        ObjectId _id PK
        ObjectId user_id FK
        ObjectId product_id FK
        number quantity
    }

    ORDERS {
        ObjectId _id PK
        string order_number UK
        ObjectId user_id FK
        string shipping_full_name
        string shipping_phone
        string shipping_address
        number subtotal
        number shipping_fee
        number total
        string payment_method
        string payment_status
        string status
        array items
    }

    REVIEWS {
        ObjectId _id PK
        ObjectId product_id FK
        ObjectId user_id FK
        number rating
        string title
        string body
        boolean is_verified_purchase
    }

    WISHLISTS {
        ObjectId _id PK
        ObjectId user_id FK
        ObjectId product_id FK
    }

    BANNERS {
        ObjectId _id PK
        string title
        string subtitle
        string cta_text
        string cta_link
        string position
        boolean is_active
    }

    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ CART_ITEMS : "has"
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ WISHLISTS : "saves"
    CATEGORIES ||--o{ PRODUCTS : "contains"
    COLLECTIONS ||--o{ PRODUCTS : "groups"
    PRODUCTS ||--o{ CART_ITEMS : "added to"
    PRODUCTS ||--o{ REVIEWS : "receives"
    PRODUCTS ||--o{ WISHLISTS : "saved in"
    ORDERS ||--|{ ORDER_ITEMS : "contains"
```

### 8.2. Bảng tổng hợp Database

| Collection | Mô tả | Các field quan trọng | Quan hệ |
|---|---|---|---|
| **users** | Người dùng | email (unique), password_hash, role | → orders, cart_items, reviews, wishlists |
| **categories** | Danh mục | slug (unique), parent_id | → products |
| **collections** | Bộ sưu tập | slug, status, drop_date | → products |
| **products** | Sản phẩm | slug, price, stock_qty, category_id, images[] | → cart_items, order_items, reviews |
| **cart_items** | Giỏ hàng | user_id + product_id (unique) | ← users, ← products |
| **orders** | Đơn hàng | order_number, user_id, items[], status | ← users |
| **reviews** | Đánh giá | user_id + product_id (unique), rating 1-5 | ← users, ← products |
| **wishlists** | Yêu thích | user_id + product_id (unique) | ← users, ← products |
| **banners** | Banner quảng cáo | position, is_active, start/end_date | (standalone) |

---

## 9. Design System (CSS Global)

File `src/index.css` (700+ dòng) định nghĩa toàn bộ design system:

### Color Palette
```css
--color-primary:       #F9A8C9   /* Pink pastel */
--color-primary-dark:  #E78BA9   /* Pink đậm */
--color-accent:        #C9B8FF   /* Lavender */
--color-success:       #6BCB8B   /* Green */
--color-warning:       #FFB347   /* Orange */
--color-danger:        #FF6B6B   /* Red */
--color-bg:            #FFFAF7   /* Cream warm */
--color-bg-white:      #FFFFFF
--color-bg-soft:       #FFF5F0   /* Light peach */
--color-text:          #2D2A32   /* Near black */
--color-text-muted:    #8B8494   /* Gray */
```

### Typography
```css
--font-body:    'Nunito', sans-serif     /* Body text */
--font-display: 'Outfit', sans-serif     /* Headings */
--text-xs: 0.75rem      /* 12px */
--text-sm: 0.875rem     /* 14px */
--text-base: 1rem       /* 16px */
--text-lg: 1.125rem     /* 18px */
--text-xl: 1.25rem      /* 20px */
--text-2xl: 1.5rem      /* 24px */
--text-3xl: 2rem        /* 32px */
--text-4xl: 2.5rem      /* 40px */
```

### Components có sẵn
- `.btn` — Buttons: primary, outline, ghost, dark, icon (+ sizes sm, lg, xl)
- `.badge` — Badges: pink, lavender, green, yellow, peach, dark, blue
- `.form-group / .form-input` — Form elements
- `.container` — Responsive container (1200px max)
- `.product-grid` — CSS Grid auto-fill 4 columns
- `.skeleton` — Loading skeleton animation
- `.section` — Section với padding vertical
- `.fade-in-up` — CSS animation hiệu ứng xuất hiện

---

## 10. Tổng kết kỹ thuật

| Khía cạnh | Chi tiết |
|---|---|
| **Kiến trúc** | SPA (React) + RESTful API (Express) + MongoDB |
| **Xác thực** | JWT token (7 ngày), bcrypt hash, role-based access |
| **State** | Zustand (persist) cho auth & cart, React Query cho server data |
| **Routing** | React Router v6 (nested routes, protected routes) |
| **Styling** | CSS Modules + Global CSS variables (design system) |
| **Upload** | Multer (disk storage) + static file serving |
| **Search** | MongoDB Full-Text Search ($text) |
| **Pagination** | Cursor-based (skip/limit) |
| **Validation** | express-validator (server) + client-side validation |
| **Error handling** | Centralized error handler middleware |
| **Security** | Helmet, Rate Limiting, CORS, JWT verification |
| **Caching** | React Query (60s stale time) |
