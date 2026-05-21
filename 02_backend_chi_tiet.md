# 📋 BÁO CÁO CHI TIẾT DỰ ÁN TOYVERSE — PHẦN 2: BACKEND CHI TIẾT

## 1. File `server.js` — Entry Point (Điểm khởi đầu)

**Đường dẫn:** `backend/server.js` (86 dòng)

**Chức năng:** Đây là file chạy đầu tiên khi khởi động server. Nó khởi tạo Express app, cấu hình các middleware, đăng ký routes, và lắng nghe port.

**Giải thích code chi tiết:**

```javascript
require('dotenv').config();     // Đọc biến từ file .env (MONGO_URI, JWT_SECRET, PORT...)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
```
→ Import tất cả dependencies cần thiết.

```javascript
const connectDB = require('./src/config/db');     // Hàm kết nối MongoDB
const errorHandler = require('./src/middlewares/errorHandler');  // Middleware xử lý lỗi

// Import tất cả route modules
const authRoutes     = require('./src/routes/auth');
const productRoutes  = require('./src/routes/products');
// ... (8 route modules)
```
→ Import config, middleware và routes.

```javascript
const app  = express();         // Tạo Express application
const PORT = process.env.PORT || 5000;  // Port từ .env hoặc mặc định 5000

connectDB();  // Kết nối MongoDB ngay khi khởi động
```

**Middleware Chain (thứ tự xử lý):**
1. `helmet()` — Thiết lập HTTP security headers (X-Frame-Options, X-XSS-Protection...)
2. `rateLimit()` — Giới hạn 500 requests / 15 phút per IP trên `/api`
3. `cors()` — Cho phép frontend tại `http://localhost:5173` gọi API
4. `express.json()` — Parse JSON body (limit 10MB)
5. `express.urlencoded()` — Parse form data
6. `morgan('dev')` — Log mỗi request ra console (`GET /api/products 200 15ms`)
7. `express.static('/uploads')` — Serve file tĩnh (hình ảnh sản phẩm)

**Route Registration:**
```javascript
app.use('/api/auth',       authRoutes);      // Đăng ký / đăng nhập
app.use('/api/products',   productRoutes);   // Sản phẩm
app.use('/api/categories', categoryRoutes);  // Danh mục
app.use('/api/cart',       cartRoutes);      // Giỏ hàng
app.use('/api/orders',     orderRoutes);     // Đơn hàng
app.use('/api/users',      userRoutes);      // Users + Wishlist
app.use('/api/admin',      adminRoutes);     // Admin panel
app.use('/api/home',       homeRoutes);      // Trang chủ data
```

**Cuối cùng:**
- Route 404 cho mọi path không khớp
- Error handler middleware (bắt mọi lỗi từ controllers)
- `app.listen(PORT)` — Khởi động server

---

## 2. Config — Kết nối Database

### `src/config/db.js` (21 dòng)

**Chức năng:** Kết nối tới MongoDB sử dụng Mongoose.

```javascript
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,  // Timeout 5s nếu không kết nối được
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);  // Thoát app nếu không kết nối được DB
  }
};
```

**Kết nối:** Sử dụng biến `MONGO_URI` từ `.env`:
- **Local:** `mongodb://localhost:27017/toyverse`
- **Cloud:** `mongodb+srv://username:password@cluster.mongodb.net/toyverse`

---

## 3. Middlewares (Lớp trung gian)

### 3.1. `src/middlewares/auth.js` (49 dòng)

**Chức năng:** 3 middleware xác thực và phân quyền.

#### `authenticate` — Bắt buộc đăng nhập
```javascript
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // Kiểm tra header: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  const token = authHeader.slice(7);  // Lấy token sau "Bearer "
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Giải mã JWT
    req.user = decoded;  // Gắn user info vào req (id, email, role)
    next();              // Cho phép request tiếp tục
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
```
→ Lấy JWT token từ header `Authorization`, giải mã để lấy thông tin user, gắn vào `req.user`.

#### `requireAdmin` — Chỉ cho Admin
```javascript
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};
```
→ Kiểm tra `req.user.role === 'admin'`, chặn nếu không phải admin.

#### `optionalAuth` — Đăng nhập tuỳ chọn
→ Thử decode token nhưng không fail nếu không có token. Dùng cho các route public nhưng muốn biết user nếu có.

---

### 3.2. `src/middlewares/errorHandler.js` (37 dòng)

**Chức năng:** Middleware xử lý lỗi tập trung. Đặt ở cuối middleware chain.

```javascript
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Xử lý từng loại lỗi cụ thể:
  if (err.code === 'LIMIT_FILE_SIZE')     → 400: File quá lớn
  if (err.code === 'ER_DUP_ENTRY')        → 409: Trùng dữ liệu
  if (err.name === 'JsonWebTokenError')    → 401: Token không hợp lệ
  if (err.name === 'TokenExpiredError')    → 401: Token hết hạn

  // Mặc định:
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ success: false, message });
};
```
→ Mọi lỗi từ controllers (throw hoặc next(err)) đều được bắt ở đây.

---

### 3.3. `src/middlewares/upload.js` (41 dòng)

**Chức năng:** Cấu hình Multer để upload hình ảnh sản phẩm.

```javascript
const uploadDir = path.join(__dirname, '../../uploads/products');
// Tự tạo thư mục nếu chưa có
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,  // Lưu vào uploads/products/
  filename: (req, file, cb) => {
    // Tên file: timestamp-random.jpg
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  // Chỉ cho phép file ảnh
};
```

**Cấu hình:**
- Lưu file vào `uploads/products/`
- Đặt tên unique: `1713600000000-123456789.jpg`
- Chỉ chấp nhận: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
- Giới hạn: 5MB/file (từ .env hoặc mặc định)

---

## 4. Models (Lớp dữ liệu — Mongoose Schemas)

### 4.1. `userModel.js` (58 dòng)

**Schema:**
| Field | Type | Mô tả |
|---|---|---|
| `full_name` | String ★ | Họ tên đầy đủ |
| `email` | String ★ Unique | Email (lowercase, unique) |
| `password_hash` | String ★ | Mật khẩu đã hash bằng bcrypt |
| `phone` | String | Số điện thoại |
| `avatar` | String | URL avatar |
| `role` | Enum | `'user'` hoặc `'admin'` |
| `is_active` | Boolean | Trạng thái tài khoản |
| `created_at / updated_at` | Timestamps | Tự động |

**Tính năng đặc biệt:**
- `toJSON` transform: Tự động ẩn `password_hash` khi trả về API → bảo mật
- `findByEmail(email)`: Static method tìm user theo email
- `findById_(id)`: Tìm theo ID, loại bỏ password trước khi trả về
- `getAll({page, limit, q})`: Lấy danh sách users có pagination + search

---

### 4.2. `productModel.js` (205 dòng) — FILE QUAN TRỌNG NHẤT

**Schema chính:**
| Field | Type | Mô tả |
|---|---|---|
| `name` | String ★ | Tên sản phẩm |
| `slug` | String ★ Unique | URL thân thiện (`dreamy-pastel-blind-box-s1`) |
| `sku` | String | Mã sản phẩm |
| `description` | String | Mô tả đầy đủ |
| `short_description` | String | Mô tả ngắn |
| `price` | Number ★ | Giá bán (VNĐ) |
| `compare_price` | Number | Giá gốc (để hiển thị giảm giá) |
| `stock_qty` | Number | Số lượng tồn kho |
| `category_id` | ObjectId → Category | Danh mục |
| `collection_id` | ObjectId → Collection | Bộ sưu tập |
| `brand` | String | Thương hiệu |
| `material` | String | Chất liệu |
| `dimensions` | String | Kích thước |
| `status` | Enum | `new`, `hot`, `limited`, `sold_out`, `normal` |
| `is_blind_box` | Boolean | Là Blind Box? |
| `is_featured` | Boolean | Sản phẩm nổi bật? |
| `is_best_seller` | Boolean | Bán chạy? |
| `total_sold` | Number | Tổng đã bán |
| `avg_rating` | Number | Điểm đánh giá trung bình |
| `review_count` | Number | Số lượng đánh giá |
| `images` | [ImageSchema] | Mảng hình ảnh (embedded sub-document) |

**Embedded Image Schema:**
```javascript
const imageSchema = new mongoose.Schema({
  image_url:  String,    // URL hình ảnh
  alt_text:   String,    // Text thay thế
  sort_order: Number,    // Thứ tự hiển thị
  is_primary: Boolean,   // Ảnh chính?
});
```

**Indexes:** Tạo index cho `slug`, `category_id`, `status`, `is_featured`, `is_best_seller`, `price`, và full-text search trên `name` + `description`.

**Static Methods quan trọng:**

#### `Product.getAll(filters)` — Lấy danh sách có filter
```javascript
Product.getAll = async ({ page, limit, sort, category, status, 
                          collection, is_blind_box, is_featured, 
                          is_best_seller, min_price, max_price, q }) => {
  // 1. Build query object
  const query = { is_active: true };
  if (q) query.$text = { $search: q };        // Full-text search
  if (status) query.status = status;
  if (min_price) query.price.$gte = Number(min_price);
  // ... thêm các filter khác

  // 2. Tìm category/collection theo slug
  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) query.category_id = cat._id;
  }

  // 3. Sort mapping
  const sortMap = {
    newest:     { created_at: -1 },
    popular:    { total_sold: -1 },
    price_asc:  { price: 1 },
    price_desc: { price: -1 },
    rating:     { avg_rating: -1 },
  };

  // 4. Query với pagination
  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category_id', 'name slug')     // JOIN category
      .populate('collection_id', 'name slug')   // JOIN collection
      .sort(sortObj).skip(skip).limit(limit).lean(),
    Product.countDocuments(query),
  ]);

  return { rows, total, page, totalPages };
};
```

#### `Product.getByIdOrSlug(idOrSlug)` — Chi tiết sản phẩm
→ Tìm theo `_id` hoặc `slug`, kèm **related products** (cùng category, tối đa 4 sản phẩm).

#### `Product.getTopSelling(limit)` — Top bán chạy
→ Sort theo `total_sold` giảm dần, dùng cho Admin Dashboard.

---

### 4.3. `categoryModel.js` (45 dòng)

| Field | Type | Mô tả |
|---|---|---|
| `name` | String ★ | Tên danh mục |
| `slug` | String ★ Unique | URL slug |
| `description` | String | Mô tả |
| `image_url` | String | Ảnh đại diện |
| `parent_id` | ObjectId → Category | Danh mục cha (hỗ trợ cây) |
| `sort_order` | Number | Thứ tự sắp xếp |
| `is_active` | Boolean | Đang hoạt động? |

**`Category.getAll()`**: Trả về danh sách categories + đếm số product mỗi category bằng `aggregate`.

---

### 4.4. `collectionModel.js` (44 dòng)

| Field | Type | Mô tả |
|---|---|---|
| `name` | String ★ | Tên bộ sưu tập |
| `slug` | String ★ Unique | URL slug |
| `status` | Enum | `upcoming`, `active`, `sold_out`, `archived` |
| `drop_date` | Date | Ngày phát hành |
| `is_featured` | Boolean | Có nổi bật? |

**`Collection.getFeatured(limit)`**: Lấy collections nổi bật + đếm số product mỗi collection.

---

### 4.5. `orderModel.js` (96 dòng)

**Schema:**
| Field | Type | Mô tả |
|---|---|---|
| `order_number` | String Unique | Mã đơn hàng tự sinh (`TV123456789`) |
| `user_id` | ObjectId → User | Người đặt |
| `shipping_*` | String | Thông tin giao hàng (tên, SĐT, địa chỉ, thành phố) |
| `items` | [OrderItemSchema] | Mảng sản phẩm đặt (embedded) |
| `subtotal` | Number | Tổng tiền hàng |
| `shipping_fee` | Number | Phí ship |
| `total` | Number | Tổng thanh toán |
| `payment_method` | Enum | `cod`, `bank_transfer`, `credit_card`, `e_wallet` |
| `payment_status` | Enum | `pending`, `paid`, `failed`, `refunded` |
| `status` | Enum | `pending`, `confirmed`, `shipping`, `completed`, `cancelled` |

**Pre-save Hook:** Tự sinh `order_number` trước khi lưu:
```javascript
orderSchema.pre('save', async function(next) {
  if (!this.order_number) {
    const ts   = Date.now().toString().slice(-6);
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.order_number = `TV${ts}${rand}`;  // VD: TV123456789
  }
  next();
});
```

---

### 4.6. `cartModel.js` (48 dòng)

| Field | Type | Mô tả |
|---|---|---|
| `user_id` | ObjectId → User ★ | Của user nào |
| `product_id` | ObjectId → Product ★ | Sản phẩm nào |
| `quantity` | Number ★ | Số lượng (min: 1) |

**Unique Index:** `{ user_id, product_id }` → Mỗi user chỉ có 1 item cho mỗi product.

**`CartItem.getCartByUser(userId)`**: Lấy giỏ hàng đầy đủ, populate thông tin product, tính subtotal.

---

### 4.7. `reviewModel.js` (61 dòng)

| Field | Type | Mô tả |
|---|---|---|
| `product_id` | ObjectId → Product ★ | Sản phẩm được review |
| `user_id` | ObjectId → User ★ | Người review |
| `rating` | Number (1-5) ★ | Điểm đánh giá |
| `title` | String | Tiêu đề |
| `body` | String | Nội dung |
| `is_verified_purchase` | Boolean | Đã mua sản phẩm? |

**`Review.updateProductRating(productId)`**: Sau mỗi thao tác review (thêm/xoá), tự động tính lại `avg_rating` và `review_count` trên Product bằng `aggregate`.

---

### 4.8. `wishlistModel.js` (44 dòng)

Đơn giản: `{ user_id, product_id }` + Unique Index.

**`Wishlist.getByUser(userId)`**: Lấy wishlist, populate thông tin product (tên, giá, ảnh, rating).

---

### 4.9. `bannerModel.js` (38 dòng)

| Field | Type | Mô tả |
|---|---|---|
| `title` | String ★ | Tiêu đề banner |
| `subtitle` | String | Phụ đề |
| `cta_text` | String | Nút bấm (VD: "Shop Now") |
| `cta_link` | String | Link nút bấm |
| `badge_text` | String | Badge (VD: "New Drop") |
| `badge_color` | String | Màu badge (hex) |
| `position` | Enum | `hero`, `secondary`, `collection`, `popup` |
| `start_date / end_date` | Date | Thời gian hiển thị |

---

## 5. Controllers (Lớp xử lý nghiệp vụ)

### 5.1. `authController.js` (87 dòng)

#### `register` — Đăng ký
```
1. Validate input (full_name, email, password) → express-validator
2. Kiểm tra email đã tồn tại? → 409 Conflict
3. Hash password bằng bcrypt (10 rounds)
4. Tạo User mới → MongoDB
5. Tạo JWT token (chứa: id, email, role | hết hạn: 7d)
6. Trả về: { token, user }
```

#### `login` — Đăng nhập
```
1. Validate input (email, password)
2. Tìm user theo email → 401 nếu không tìm thấy
3. Kiểm tra is_active → 403 nếu bị disable
4. So sánh password với hash bằng bcrypt → 401 nếu sai
5. Tạo JWT token
6. Trả về: { token, user }
```

#### `getMe` — Lấy profile
→ Dùng `req.user.id` từ JWT, query MongoDB, trả về user (không có password).

#### `updateMe` — Cập nhật profile
→ Cho phép cập nhật `full_name`, `phone`, `avatar` (nếu upload file).

#### `changePassword` — Đổi mật khẩu
→ Verify mật khẩu cũ trước, rồi hash mật khẩu mới và cập nhật.

---

### 5.2. `productController.js` (97 dòng)

#### `getAll` → Gọi `Product.getAll(req.query)`, trả về danh sách + pagination
#### `getOne` → Gọi `Product.getByIdOrSlug()`, trả về product + related
#### `create` (Admin) → Tạo sản phẩm mới:
```
1. Lấy data từ req.body
2. Tạo slug từ name: slugify + timestamp
3. Xử lý images từ req.files (Multer)
4. Tạo Product mới → save
5. Trả về: { product }
```
#### `update` (Admin) → Cập nhật product, thêm ảnh mới nếu có
#### `delete` (Admin) → Xoá product khỏi DB

---

### 5.3. `cartController.js` (67 dòng)

#### `getCart` → Lấy giỏ hàng user bằng `CartItem.getCartByUser(req.user.id)`
#### `addItem` → Thêm vào giỏ:
```
1. Kiểm tra product tồn tại & is_active → 404
2. Kiểm tra stock_qty > 0 → 400
3. Upsert cart item (findOneAndUpdate + $inc) → Nếu đã có thì tăng qty
4. Trả về giỏ hàng mới
```
#### `updateItem` → Cập nhật qty (nếu qty < 1 thì xoá item)
#### `removeItem` → Xoá 1 item khỏi giỏ
#### `clearCart` → Xoá toàn bộ giỏ hàng

---

### 5.4. `orderController.js` (104 dòng)

#### `create` — Đặt hàng (LUỒNG QUAN TRỌNG NHẤT)
```
1. Lấy giỏ hàng user → CartItem.getCartByUser()
2. Kiểm tra giỏ không rỗng → 400
3. Tính phí ship: miễn phí nếu subtotal >= 500.000đ, ngược lại 30.000đ
4. Duyệt qua từng item trong giỏ:
   a. Kiểm tra product tồn tại & đủ stock → 400 nếu không
   b. Tạo orderItem (snapshot tên, giá, ảnh tại thời điểm mua)
   c. Trừ stock_qty & tăng total_sold trên Product
5. Tạo Order mới → save (tự sinh order_number)
6. Xoá toàn bộ giỏ hàng
7. Trả về: { order }
```

#### `getMyOrders` → Đơn hàng của user, pagination, sort mới nhất
#### `getById` → Chi tiết 1 đơn hàng (user chỉ xem được đơn của mình, admin xem tất cả)
#### `getAll` (Admin) → Tất cả đơn hàng, search, filter theo status
#### `updateStatus` (Admin) → Cập nhật status / payment_status

---

### 5.5. `homeController.js` (30 dòng)

#### `getHomeData` — Aggregation trang chủ (1 API call duy nhất)
```javascript
const [banners, categories, featured, blind_boxes, 
       best_sellers, new_arrivals, collections] = await Promise.all([
  Banner.getActive('hero'),                    // Banners hero
  Category.getAll({ active: 'true' }),         // 8 categories
  Product.getAll({ is_featured: 'true', limit: 8 }),   // SP nổi bật
  Product.getAll({ is_blind_box: 'true', limit: 6 }),  // Blind boxes
  Product.getAll({ is_best_seller: 'true', limit: 8 }),// Bán chạy
  Product.getAll({ sort: 'newest', limit: 8 }),        // Mới nhất
  Collection.getFeatured(4),                   // Collections nổi bật
]);
```
→ Dùng `Promise.all` để chạy 7 query song song, tối ưu performance.

---

### 5.6. `adminController.js` (61 dòng)

#### `getStats` — Dashboard thống kê
```
Trả về:
- stats: total_products, total_orders, total_users, total_revenue
- recent_orders: 8 đơn hàng gần nhất
- top_products: 6 SP bán chạy nhất
- monthly_revenue: Doanh thu 12 tháng gần nhất (aggregate)
```

---

### 5.7. `reviewController.js` (60 dòng)

#### `getByProduct` → Reviews theo product, pagination + aggregate stats
#### `create` → Tạo review:
```
1. Kiểm tra đã review chưa → 409
2. Kiểm tra đã mua sản phẩm chưa (verified purchase)
3. Tạo Review → save
4. Cập nhật avg_rating trên Product
```
#### `delete` → Xoá review (chỉ owner hoặc admin), cập nhật lại rating

---

### 5.8. `userController.js` (64 dòng)

- `getAll` (Admin) → Danh sách users, search, pagination
- `update` (Admin) → Cập nhật role, is_active, full_name, phone
- `delete` (Admin) → Xoá user (không cho tự xoá mình)
- `getWishlist` → Wishlist của user
- `toggleWishlist` → Thêm/xoá khỏi wishlist
- `checkWishlist` → Kiểm tra sản phẩm có trong wishlist không

---

## 6. Routes (Định tuyến)

### 6.1. `routes/auth.js` — Xác thực
```
POST /api/auth/register  → [validate body] → authController.register
POST /api/auth/login     → [validate body] → authController.login
GET  /api/auth/me        → [authenticate]  → authController.getMe
PUT  /api/auth/me        → [authenticate, upload.single('avatar')] → authController.updateMe
PUT  /api/auth/me/password → [authenticate] → authController.changePassword
```

### 6.2. `routes/products.js` — Sản phẩm
```
GET    /api/products            → productController.getAll        (Public)
GET    /api/products/:idOrSlug  → productController.getOne        (Public)
POST   /api/products            → [auth, admin, upload] → create  (Admin)
PUT    /api/products/:id        → [auth, admin, upload] → update  (Admin)
DELETE /api/products/:id        → [auth, admin]         → delete  (Admin)

GET    /api/products/:id/reviews  → reviewController.getByProduct  (Public)
POST   /api/products/:id/reviews  → [auth] → reviewController.create (User)
```

### 6.3. `routes/cart.js` — Giỏ hàng
```
router.use(authenticate);          // Tất cả route đều yêu cầu đăng nhập
GET    /api/cart           → getCart
POST   /api/cart/add       → addItem
PUT    /api/cart/update    → updateItem
DELETE /api/cart/empty     → clearCart
DELETE /api/cart/remove    → removeItem
```

### 6.4. `routes/orders.js` — Đơn hàng
```
POST   /api/orders            → [auth]         → create
GET    /api/orders/my         → [auth]         → getMyOrders
GET    /api/orders/admin      → [auth, admin]  → getAll
GET    /api/orders/:id        → [auth]         → getById
PUT    /api/orders/:id/status → [auth, admin]  → updateStatus
```

### 6.5. `routes/admin.js` — Admin Panel
```
router.use(authenticate, requireAdmin);   // Tất cả đều yêu cầu Admin
GET  /api/admin/stats    → adminController.getStats
GET  /api/admin/banners  → adminController.manageBanners
```

### 6.6. `routes/home.js` — Trang chủ
```
GET  /api/home                    → homeController.getHomeData  (aggregation)
GET  /api/home/banners            → Banner.getActive()
GET  /api/home/collections        → Collection.getFeatured()
GET  /api/home/collections/all    → Collection.getAll()
```

---

## 7. File `seed.js` — Dữ liệu mẫu (253 dòng)

**Chức năng:** Tạo dữ liệu mẫu vào MongoDB khi chạy `npm run seed`.

**Quy trình:**
1. Kết nối MongoDB
2. Xoá toàn bộ dữ liệu cũ (6 collections)
3. Tạo 3 Users (1 admin + 2 users) với password hash
4. Tạo 8 Categories (Blind Box, Figures, Plush, Keychains, Art Toys, Limited, New Arrivals, Accessories)
5. Tạo 6 Collections (Dreamy Pastel, Galaxy Wanderers, Forest Friends, Neon Nights, Sakura Dreams, Autumn Harvest)
6. Tạo 13 Products đa dạng (blind box, figures, plush, keychains, art toys, limited edition, accessories)
7. Tạo 3 Banners cho hero section
8. Tạo 6 Reviews mẫu

---

> **Tiếp tục đọc:** [Phần 3 — Frontend Chi Tiết](file:///C:/Users/nam/.gemini/antigravity/brain/a2592d9c-4ea2-4f6b-957f-09dc64f3b7ff/03_frontend_chi_tiet.md)
