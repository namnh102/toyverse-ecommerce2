// Thư viện Mongoose dùng để tương tác với MongoDB
const mongoose = require('mongoose');

// 1. ĐỊNH NGHĨA KHUNG DỮ LIỆU CHO ẢNH (Sub-schema)
// Sản phẩm có thể có nhiều ảnh, nên ta tách riêng cấu trúc ảnh ra cho gọn
const imageSchema = new mongoose.Schema({
  image_url:  { type: String, required: true }, // Đường dẫn file ảnh
  alt_text:   { type: String, default: '' }, // Text thay thế cho SEO
  sort_order: { type: Number, default: 0 }, // Thứ tự ảnh (0, 1, 2...)
  is_primary: { type: Boolean, default: false }, // Có phải ảnh đại diện không?
}, { _id: true });

// 2. ĐỊNH NGHĨA KHUNG DỮ LIỆU SẢN PHẨM CHÍNH
const productSchema = new mongoose.Schema({
  name:              { type: String, required: true, trim: true },
  slug:              { type: String, required: true, unique: true, lowercase: true }, // Đường dẫn SEO thân thiện
  sku:               { type: String, default: null }, // Mã vạch/Mã nội bộ kho
  description:       { type: String, default: '' }, // Bài viết mô tả chi tiết
  short_description: { type: String, default: '' }, // Đoạn tóm tắt ngắn
  price:             { type: Number, required: true, min: 0 }, // Giá bán hiện tại
  compare_price:     { type: Number, default: null }, // Giá gốc (Dùng để hiển thị gạch ngang báo Sale)
  stock_qty:         { type: Number, default: 0, min: 0 }, // Số lượng tồn kho (min: 0 để chặn bán âm kho)
  category_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // Liên kết khóa ngoại với bảng Danh Mục
  collection_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', default: null },
  brand:             { type: String, default: null },
  material:          { type: String, default: null },
  dimensions:        { type: String, default: null },
  weight:            { type: Number, default: null },
  status:            { type: String, enum: ['new', 'hot', 'limited', 'sold_out', 'normal'], default: 'normal' }, // Nhãn dán nổi bật
  is_blind_box:      { type: Boolean, default: false },
  is_active:         { type: Boolean, default: true }, // Bật/Tắt hiển thị (Admin ẩn đi)
  is_featured:       { type: Boolean, default: false }, // Sản phẩm nổi bật (Hiện lên trang chủ)
  is_best_seller:    { type: Boolean, default: false }, // Sản phẩm bán chạy (Hiện lên trang chủ)
  sort_order:        { type: Number, default: 0 },
  total_sold:        { type: Number, default: 0 }, // Tự động tăng khi có người mua thành công
  avg_rating:        { type: Number, default: 0 }, // Điểm sao trung bình (1-5) tính từ bảng Review
  review_count:      { type: Number, default: 0 }, // Tổng số người đã đánh giá
  images:            [imageSchema], // Nhúng mảng hình ảnh phụ ở trên vào đây
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// 3. TẠO INDEX ĐỂ TĂNG TỐC ĐỘ TRUY VẤN
// Database giống như cuốn từ điển, nếu không có Index (Mục lục) thì tìm kiếm sẽ rất chậm
productSchema.index({ slug: 1 });
productSchema.index({ category_id: 1 });
productSchema.index({ status: 1 });
productSchema.index({ is_featured: 1 });
productSchema.index({ is_best_seller: 1 });
productSchema.index({ price: 1 });
// Đánh Index đặc biệt dạng 'text' cho Tên và Mô tả để hỗ trợ thanh công cụ Tìm kiếm Full-text search
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

// ─── Helper: format product for API response ───────────────────────────────────
const formatProduct = (p, category = null, collection = null) => {
  const obj   = p.toObject ? p.toObject() : { ...p };
  const primary = (obj.images || []).find(i => i.is_primary) || (obj.images || [])[0];
  return {
    ...obj,
    id:               obj._id,
    category_name:    category?.name || obj.category_name || '',
    category_slug:    category?.slug || obj.category_slug || '',
    collection_name:  collection?.name || obj.collection_name || null,
    primary_image:    primary?.image_url || null,
  };
};

// ─── CÁC HÀM XỬ LÝ (STATIC METHODS) DÀNH CHO CONTROLLER ──────────────────────────

/**
 * 1. HÀM LẤY DANH SÁCH SẢN PHẨM (Có phân trang, bộ lọc và tìm kiếm)
 * Chức năng: Quét Database để lấy sản phẩm dựa trên các điều kiện Frontend gửi lên.
 */
Product.getAll = async ({
  page = 1, limit = 16, // Mặc định lấy trang 1, mỗi trang 16 sản phẩm
  sort = 'newest', // Mặc định sắp xếp mới nhất
  category, status, collection,
  is_blind_box, is_featured, is_best_seller,
  min_price, max_price, q, // q là chuỗi tìm kiếm (query)
} = {}) => {
  // Require ở đây để tránh lỗi vòng lặp phụ thuộc (Circular Dependency)
  const Category   = require('./categoryModel');
  const Collection = require('./collectionModel');

  // Khởi tạo điều kiện tìm kiếm mặc định: Chỉ lấy các sản phẩm đang được bật (is_active)
  const query = { is_active: true };

  // --- ÁP DỤNG CÁC BỘ LỌC (FILTERS) ---
  // Tìm kiếm theo tên hoặc mô tả bằng Full-text Search
  if (q) query.$text = { $search: q };
  
  if (status) query.status = status;
  if (is_blind_box === 'true') query.is_blind_box = true;
  if (is_featured === 'true') query.is_featured = true;
  if (is_best_seller === 'true') query.is_best_seller = true;
  
  // Lọc theo khoảng giá (Lớn hơn hoặc bằng min, nhỏ hơn hoặc bằng max)
  if (min_price || max_price) {
    query.price = {};
    if (min_price) query.price.$gte = Number(min_price);
    if (max_price) query.price.$lte = Number(max_price);
  }

  // --- LỌC THEO DANH MỤC (CATEGORY) ---
  if (category) {
    // Tìm ID của Danh mục dựa vào slug gửi lên
    const cat = await Category.findOne({ slug: category }).lean();
    if (cat) query.category_id = cat._id;
  }

  if (collection) {
    const col = await Collection.findOne({ slug: collection }).lean();
    if (col) query.collection_id = col._id;
  }

  // --- CẤU HÌNH SẮP XẾP (SORTING) ---
  const sortMap = {
    newest:     { created_at: -1 }, // Mới nhất (-1 là giảm dần)
    popular:    { total_sold: -1 }, // Bán chạy nhất
    price_asc:  { price: 1 },       // Giá tăng dần (1)
    price_desc: { price: -1 },      // Giá giảm dần (-1)
    rating:     { avg_rating: -1 }, // Đánh giá cao nhất
  };
  const sortObj = sortMap[sort] || { created_at: -1 };

  const skip = (page - 1) * limit;
  
  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category_id', 'name slug') 
      .populate('collection_id', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .lean(), 
    Product.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / Number(limit));
  
  const rows = products.map(p => {
    const primary = (p.images || []).find(i => i.is_primary) || p.images?.[0];
    return {
      ...p,
      id:             p._id,
      category_name:  p.category_id?.name || '',
      category_slug:  p.category_id?.slug || '',
      collection_name:p.collection_id?.name || null,
      primary_image:  primary?.image_url || null, // Chỉ trả về 1 cái ảnh bìa cho nhẹ
    };
  });

  return { rows, total, page: Number(page), totalPages };
};

Product.getByIdOrSlug = async (idOrSlug) => {
  let product;
  const mongoose = require('mongoose');

  // Kiểm tra xem dữ liệu truyền vào là ID (kí tự hex) hay là Slug (VD: do-choi)
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    product = await Product.findById(idOrSlug)
      .populate('category_id', 'name slug')
      .populate('collection_id', 'name slug')
      .lean();
  } else {
    product = await Product.findOne({ slug: idOrSlug })
      .populate('category_id', 'name slug')
      .populate('collection_id', 'name slug')
      .lean();
  }

  if (!product) return null;

  // Tìm ảnh bìa
  const primary = (product.images || []).find(i => i.is_primary) || product.images?.[0];
  const formatted = {
    ...product,
    id:             product._id,
    category_name:  product.category_id?.name || '',
    category_slug:  product.category_id?.slug || '',
    collection_name:product.collection_id?.name || null,
    primary_image:  primary?.image_url || null,
  };

  // Tìm 4 sản phẩm liên quan (Cùng danh mục, không chứa sản phẩm hiện tại)
  const related = await Product.find({
    category_id: product.category_id?._id || product.category_id,
    _id: { $ne: product._id }, // $ne: Not Equal (Lọc bỏ sản phẩm đang xem)
    is_active: true,
  })
    .limit(4) // Chỉ lấy 4 cái
    .populate('category_id', 'name slug')
    .lean()
    .then(arr => arr.map(p => {
      const pri = (p.images || []).find(i => i.is_primary) || p.images?.[0];
      return { ...p, id: p._id, category_name: p.category_id?.name || '', primary_image: pri?.image_url || null };
    }));

  return { product: formatted, related };
};

/**
 * 3. HÀM LẤY SẢN PHẨM BÁN CHẠY NHẤT (Dùng cho Biểu đồ thống kê Admin Dashboard)
 */
Product.getTopSelling = async (limit = 5) => {
  const products = await Product.find({ is_active: true })
    .sort({ total_sold: -1 }) // Sắp xếp theo tổng số lượng đã bán (Giảm dần)
    .limit(limit)
    .lean();
    
  return products.map(p => {
    const pri = (p.images || []).find(i => i.is_primary) || p.images?.[0];
    return { ...p, id: p._id, image: pri?.image_url || null };
  });
};

module.exports = Product;
