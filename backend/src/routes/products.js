// BƯỚC 3: SERVER NHẬN REQUEST TỪ FRONTEND (ROUTING)
// Router điều hướng các API gọi vào đường dẫn /api/products
const router = require('express').Router();
// Import Controller: Nơi chứa logic xử lý thực sự của từng tính năng
const ctrl = require('../controllers/productController');
// Import các Middleware (Người gác cổng): Kiểm tra token và quyền Admin
const { authenticate, requireAdmin } = require('../middlewares/auth');
// Import Middleware upload: Xử lý nhận file (ảnh) từ 'multipart/form-data' do Frontend gửi lên
const upload = require('../middlewares/upload');

// Public route: Ai cũng gọi được (để Frontend hiển thị sản phẩm cho khách)
router.get('/', ctrl.getAll);
router.get('/:idOrSlug', ctrl.getOne);

// Admin route: CÁC LUỒNG THAO TÁC CỦA ADMIN (Tạo, Sửa, Xóa)
// Khi Frontend (AdminProducts.jsx) gọi api.post('/products'), nó sẽ chạy tuần tự qua các chốt chặn này:
// 1. Chốt 'authenticate': Kiểm tra Header Authorization có token hợp lệ không. Nếu có, giải mã ra user ID.
// 2. Chốt 'requireAdmin': Kiểm tra xem user ID vừa giải mã có role là 'admin' không. Nếu không -> chặn lại (báo lỗi 403).
// 3. Chốt 'upload.array(...)': Bắt và lưu tất cả các file được đính kèm dưới tên biến là 'images' vào ổ cứng server.
// 4. Chốt 'ctrl.create': Vượt qua hết, cuối cùng mới gọi Controller để lưu text/link ảnh vào CSDL.
router.post('/', authenticate, requireAdmin, upload.array('images', 10), ctrl.create);

// Tương tự cho Cập nhật và Xóa (Xóa thì không cần middleware upload ảnh)
router.put('/:id', authenticate, requireAdmin, upload.array('images', 10), ctrl.update);
router.delete('/:id', authenticate, requireAdmin, ctrl.delete);

// Reviews nested under products
const reviewCtrl = require('../controllers/reviewController');
router.get('/:product_id/reviews', reviewCtrl.getByProduct);
router.post('/:product_id/reviews', authenticate, reviewCtrl.create);

module.exports = router;
