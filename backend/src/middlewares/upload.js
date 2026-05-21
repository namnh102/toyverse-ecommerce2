// Thư viện Multer để xử lý việc upload file (ảnh, video) từ form-data (bởi Frontend gửi lên)
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. TẠO THƯ MỤC LƯU TRỮ TRÊN SERVER
// Cấu hình đường dẫn lưu ảnh vào thư mục 'uploads/products' của server
const uploadDir = path.join(__dirname, '../../uploads/products');
// Nếu thư mục này chưa tồn tại trên ổ cứng thì tự động ra lệnh tạo mới
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. CẤU HÌNH NƠI LƯU VÀ TÊN FILE LƯU TRÊN Ổ CỨNG
const storage = multer.diskStorage({
  // Nơi lưu trữ:
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  // Cách đổi tên file khi lưu:
  filename: (req, file, cb) => {
    // Lấy đuôi file gốc (ví dụ: .jpg, .png)
    const ext = path.extname(file.originalname).toLowerCase();
    // Đổi tên thành công thức: [Thời gian hiện tại] - [1 số ngẫu nhiên].[đuôi file]
    // Mục đích: Tránh trường hợp 2 người cùng upload file tên 'anh-san-pham.jpg' bị ghi đè lên nhau, làm hỏng ảnh cũ
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// 3. BỘ LỌC ĐỊNH DẠNG FILE (FILE FILTER) ĐỂ BẢO MẬT
const fileFilter = (req, file, cb) => {
  // Chỉ cho phép các đuôi ảnh này được phép lọt qua
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowed.includes(ext)) {
    cb(null, true); // Đuôi file hợp lệ -> cho phép lưu
  } else {
    cb(new Error('Chỉ cho phép định dạng ảnh (jpg, jpeg, png, webp, gif)'), false); // Từ chối file khác để tránh bị hack upload shell
  }
};

// 4. ĐÓNG GÓI THÀNH MIDDLEWARE UPLOAD HOÀN CHỈNH
const upload = multer({
  storage,
  fileFilter,
  limits: {
    // Giới hạn dung lượng tối đa 1 file là 5MB để chống bị xả rác làm đầy ổ cứng server
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, 
  },
});

module.exports = upload;
