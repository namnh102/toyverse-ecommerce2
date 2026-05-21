// Import các Model liên quan đến Người dùng
const User     = require('../models/userModel');
const Wishlist  = require('../models/wishlistModel');

// 1. LẤY DANH SÁCH NGƯỜI DÙNG (Luồng Admin: Trang Quản lý User)
exports.getAll = async (req, res, next) => {
  try {
    // Gọi hàm từ model, truyền các tham số lọc/phân trang từ Frontend
    const result = await User.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// 2. CẬP NHẬT THÔNG TIN NGƯỜI DÙNG (Luồng Admin: Đổi Role, Khóa tài khoản)
exports.update = async (req, res, next) => {
  try {
    // 2.1. Lấy dữ liệu cần cập nhật từ req.body (ví dụ: role='admin', is_active=false)
    const { role, is_active, full_name, phone } = req.body;
    
    // 2.2. Chỉ cập nhật những trường được gửi lên
    const updates = {};
    if (role !== undefined)      updates.role      = role;
    if (is_active !== undefined) updates.is_active = Boolean(Number(is_active)); // Ép kiểu về true/false
    if (full_name)               updates.full_name = full_name;
    if (phone !== undefined)     updates.phone     = phone;

    // 2.3. Tìm User theo ID và Update vào Database
    // .select('-password_hash -__v') dùng để bảo mật: KHÔNG trả về mật khẩu mã hóa cho Frontend
    const user = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true })
      .select('-password_hash -__v').lean();
      
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    
    // 2.4. Trả về thông tin User đã update cho bảng của Admin cập nhật state
    res.json({ success: true, user: { ...user, id: user._id } });
  } catch (err) { next(err); }
};

// 3. XÓA NGƯỜI DÙNG (Luồng Admin)
exports.delete = async (req, res, next) => {
  try {
    // 3.1. Ngăn chặn Admin tự xóa chính tài khoản đang đăng nhập của mình
    if (req.params.id === req.user.id)
      return res.status(400).json({ success: false, message: 'Bạn không thể tự xóa chính mình' });
      
    // 3.2. Thực hiện xóa khỏi DB
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    
    res.json({ success: true, message: 'Đã xóa người dùng thành công' });
  } catch (err) { next(err); }
};

// --- CÁC LUỒNG DƯỚI ĐÂY DÀNH CHO USER (Sản phẩm yêu thích) ---

// Lấy danh sách Wishlist của User đang đăng nhập
exports.getWishlist = async (req, res, next) => {
  try {
    const result = await Wishlist.getByUser(req.user.id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// Bật/tắt sản phẩm yêu thích (Nhấn nút trái tim)
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { product_id } = req.body;
    // Kiểm tra xem đã thả tim chưa
    const existing = await Wishlist.findOne({ user_id: req.user.id, product_id });
    
    if (existing) {
      // Đã có rồi -> Xóa đi (Bỏ yêu thích)
      await existing.deleteOne();
      return res.json({ success: true, wishlisted: false, added: false });
    }
    // Chưa có -> Thêm mới vào Wishlist
    await new Wishlist({ user_id: req.user.id, product_id }).save();
    res.json({ success: true, wishlisted: true, added: true });
  } catch (err) { next(err); }
};

// Kiểm tra trạng thái thả tim khi mở chi tiết sản phẩm
exports.checkWishlist = async (req, res, next) => {
  try {
    const item = await Wishlist.findOne({ user_id: req.user.id, product_id: req.params.productId });
    res.json({ success: true, wishlisted: !!item });
  } catch (err) { next(err); }
};
