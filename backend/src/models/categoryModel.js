// Thư viện Mongoose dùng để tương tác với MongoDB
const mongoose = require('mongoose');

// 1. ĐỊNH NGHĨA KHUNG DỮ LIỆU (SCHEMA) CHO DANH MỤC SẢN PHẨM
const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true }, // Tên danh mục (Vd: "Đồ chơi bé trai")
  slug:        { type: String, required: true, unique: true, lowercase: true }, // Đường dẫn chuẩn SEO (Vd: "do-choi-be-trai"), phải là duy nhất
  description: { type: String, default: '' }, // Mô tả danh mục
  image_url:   { type: String, default: null }, // Link ảnh đại diện cho danh mục
  parent_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }, // Dùng để làm danh mục con (Danh mục lồng nhau), nếu null là danh mục cha cao nhất
  sort_order:  { type: Number, default: 0 }, // Số thứ tự để sắp xếp lúc hiển thị lên Web (0 lên trước, 1 ra sau)
  is_active:   { type: Boolean, default: true }, // Bật/Tắt hiển thị danh mục
  meta_title:  { type: String, default: '' }, // Tiêu đề dành riêng cho SEO (Google Search)
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// 2. TẠO INDEX ĐỂ TỐI ƯU TỐC ĐỘ TÌM KIẾM
// Đánh index cho cột 'slug' vì ta rất hay dùng slug để query danh mục thay vì dùng ID
categorySchema.index({ slug: 1 });

const Category = mongoose.model('Category', categorySchema);

// ─── Static helpers ────────────────────────────────────────────────────────────
Category.getAll = async ({ active } = {}) => {
  const query = {};
  if (active === 'true' || active === true) query.is_active = true;

  // Count products per category
  const Product = require('./productModel');
  const categories = await Category.find(query).sort({ sort_order: 1 }).lean();
  const counts = await Product.aggregate([
    { $match: { is_active: true } },
    { $group: { _id: '$category_id', count: { $sum: 1 } } }
  ]);
  const countMap = {};
  counts.forEach(c => { countMap[c._id?.toString()] = c.count; });

  return {
    categories: categories.map(c => ({
      ...c,
      id: c._id,
      product_count: countMap[c._id?.toString()] || 0
    }))
  };
};

Category.findBySlug = (slug) => Category.findOne({ slug }).lean();

module.exports = Category;
