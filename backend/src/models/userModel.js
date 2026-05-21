// Thư viện Mongoose để kết nối và tương tác với MongoDB
const mongoose = require('mongoose');
// Thư viện bcryptjs dùng để băm (mã hóa) mật khẩu
const bcrypt = require('bcryptjs');

// 1. ĐỊNH NGHĨA KHUNG DỮ LIỆU (SCHEMA) CHO NGƯỜI DÙNG
// Quy định rõ ràng một User khi lưu vào Database BẮT BUỘC phải có những trường nào
const userSchema = new mongoose.Schema({
  full_name:     { type: String, required: true, trim: true }, // Tên: Bắt buộc, tự động cắt khoảng trắng thừa
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true }, // Email: Bắt buộc, KHÔNG ĐƯỢC TRÙNG (unique), tự chuyển thành chữ thường
  password_hash: { type: String, required: true }, // Mật khẩu (Chỉ lưu chuỗi đã được mã hóa, tuyệt đối không lưu pass thật)
  phone:         { type: String, default: null }, // Số điện thoại (Có thể để trống)
  avatar:        { type: String, default: null }, // Ảnh đại diện (Link ảnh)
  role:          { type: String, enum: ['user', 'admin'], default: 'user' }, // Quyền: Chỉ được phép là 'user' hoặc 'admin', tạo mới mặc định là 'user'
  is_active:     { type: Boolean, default: true }, // Trạng thái: Bị khóa hay đang hoạt động
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }); // Tự động sinh ra thời gian tạo và thời gian cập nhật

// 2. CHẶN RÒ RỈ DỮ LIỆU NHẠY CẢM (BẢO MẬT)
// Hàm này sẽ tự động chạy mỗi khi biến đối tượng User thành JSON để trả về cho Frontend
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id; // Đổi biến _id mặc định của Mongo thành 'id' cho Frontend React dễ gọi
    delete ret._id; // Xóa _id cũ cho đỡ rác
    delete ret.__v; // Xóa số phiên bản của Mongo
    delete ret.password_hash; // QUAN TRỌNG: Xóa sạch mật khẩu khỏi JSON, Frontend sẽ không bao giờ nhìn thấy pass mã hóa
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

// ─── Static methods (tương thích với controllers cũ) ──────────────────────────
User.findByEmail = (email) => User.findOne({ email: email.toLowerCase() }).lean();

User.findById_ = async (id) => {
  const u = await User.findById(id).lean();
  if (!u) return null;
  const { password_hash, __v, _id, ...rest } = u;
  return { ...rest, id: _id };
};

User.create_ = async (data) => {
  const u = new User(data);
  await u.save();
  return u._id.toString();
};

User.update_ = (id, updates) =>
  User.findByIdAndUpdate(id, { $set: updates }, { new: true });

User.getAll = async ({ page = 1, limit = 20, q = '' } = {}) => {
  const skip  = (page - 1) * limit;
  const query = q ? { $or: [{ full_name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] } : {};
  const [rows, total] = await Promise.all([
    User.find(query).select('-password_hash -__v').skip(skip).limit(limit).lean(),
    User.countDocuments(query),
  ]);
  const totalPages = Math.ceil(total / limit);
  return { rows: rows.map(u => ({ ...u, id: u._id })), total, page, totalPages };
};

module.exports = User;
