// Thư viện jsonwebtoken để mã hóa và giải mã Token
const jwt = require('jsonwebtoken');

/**
 * 1. MIDDLEWARE XÁC THỰC (AUTHENTICATE)
 * Chức năng: Kiểm tra xem người dùng đã đăng nhập chưa bằng cách đọc Token.
 * Cách hoạt động: Đứng chặn trước các API cần bảo mật (ví dụ: Tạo đơn hàng, Đổi mật khẩu).
 */
const authenticate = (req, res, next) => {
  // Lấy chuỗi token từ Header của request do Frontend gửi lên
  const authHeader = req.headers.authorization;
  
  // Nếu không có token hoặc định dạng không đúng chuẩn 'Bearer <token>' -> Báo lỗi 401
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập' });
  }

  // Cắt bỏ chữ 'Bearer ' để lấy đúng chuỗi token
  const token = authHeader.slice(7);
  try {
    // Dùng khóa bí mật (JWT_SECRET) để giải mã token. Nếu token giả mạo hoặc hết hạn sẽ văng lỗi xuống catch
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Lưu thông tin user vừa giải mã được (ví dụ: id, role) vào biến req.user để các hàm phía sau dùng
    req.user = decoded;
    next(); // Cho phép đi tiếp vào Controller
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

/**
 * 2. MIDDLEWARE PHÂN QUYỀN ADMIN (REQUIRE ADMIN)
 * Chức năng: Đảm bảo chỉ có Admin mới được phép gọi API này.
 * Cách hoạt động: Phải đặt SAU hàm `authenticate` ở trên.
 */
const requireAdmin = (req, res, next) => {
  // Đọc req.user (do hàm authenticate truyền xuống). Nếu role không phải admin -> Báo lỗi 403 (Cấm)
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Yêu cầu quyền Quản trị viên' });
  }
  next(); // Là admin thì cho đi tiếp
};

/**
 * 3. MIDDLEWARE XÁC THỰC TÙY CHỌN (OPTIONAL AUTH)
 * Chức năng: Có token thì giải mã lấy thông tin user, không có token cũng KHÔNG báo lỗi, vẫn cho đi tiếp (với vai trò khách).
 * Ứng dụng: Dành cho trang xem sản phẩm. Nếu là user đã đăng nhập thì hiện tim (wishlist), nếu là khách thì không hiện.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_) {
      req.user = null; // Token lỗi hoặc hết hạn thì cứ coi như khách
    }
  }
  next(); // Luôn luôn cho đi tiếp
};

module.exports = { authenticate, requireAdmin, optionalAuth };
