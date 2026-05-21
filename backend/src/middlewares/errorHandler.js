/**
 * MIDDLEWARE XỬ LÝ LỖI TẬP TRUNG TÀN CỤC (GLOBAL ERROR HANDLER)
 * Chức năng: Đứng ở cuối cùng của hệ thống ống nước Backend. 
 * Bất kỳ hàm Controller nào dùng `catch(err) { next(err) }` thì lỗi sẽ rớt thẳng xuống cái phễu này.
 * Giải quyết vấn đề: Giúp code gọn gàng, không phải viết lại code trả về mã báo lỗi ở mọi ngóc ngách của project.
 */
const errorHandler = (err, req, res, next) => {
  // In ra màn hình Terminal (console log) để Dev dễ debug (nhìn phát biết ngay lỗi ở API nào)
  console.error(`[LỖI] ${req.method} ${req.path}:`, err.message);

  // 1. Phân loại và tự động xử lý các lỗi thường gặp:

  // Lỗi do upload file ảnh vượt quá 5MB (Bắt từ multer)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'Dung lượng file quá lớn. Tối đa 5MB được phép.' });
  }

  // Lỗi của Database: Trùng lặp dữ liệu (Ví dụ: Email đã được đăng ký, Tên Danh mục/Slug bị trùng)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Dữ liệu này đã tồn tại trong hệ thống (Trùng lặp).' });
  }

  // Lỗi của Database: Khóa ngoại không hợp lệ (Ví dụ: Thêm sản phẩm vào 1 danh mục mang ID không tồn tại)
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ success: false, message: 'Dữ liệu tham chiếu không tồn tại (ID bị sai).' });
  }

  // Lỗi bảo mật: Token (chìa khóa) bị chỉnh sửa, làm giả, không hợp lệ
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Token bảo mật không hợp lệ.' });
  }

  // Lỗi bảo mật: Token (chìa khóa) đã hết thời gian hiệu lực (hết hạn đăng nhập)
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' });
  }

  // 2. Xử lý Mặc định cho các lỗi còn lại chưa bắt được:
  // Nếu lỗi có tự ném ra mã statusCode (VD: 404 Not Found, 403 Forbidden) thì dùng nó, nếu không có mặc định gán là 500 (Lỗi hệ thống máy chủ)
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi hệ thống nội bộ máy chủ';
  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
