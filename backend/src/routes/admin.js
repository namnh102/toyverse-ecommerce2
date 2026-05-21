/**
 * ROUTER QUẢN TRỊ VIÊN (ADMIN ROUTES)
 * Chức năng: Điều hướng các API dành riêng cho Dashboard và cấu hình chung của hệ thống.
 * Bảo mật: Dùng `router.use` để áp dụng bắt buộc 2 rào chắn `authenticate` (đã đăng nhập) 
 * và `requireAdmin` (phải là admin) cho TẤT CẢ các đường dẫn bên dưới.
 */
const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(authenticate, requireAdmin);

router.get('/stats', ctrl.getStats);
router.get('/banners', ctrl.manageBanners);

module.exports = router;
