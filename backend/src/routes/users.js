/**
 * ROUTER NGƯỜI DÙNG & YÊU THÍCH (USER & WISHLIST ROUTES)
 * Chức năng: Điều hướng các API quản lý tài khoản và sản phẩm yêu thích (thả tim).
 * Chú ý: Việc User ấn tim sản phẩm được gộp vào đây thay vì bên Product để dễ dàng
 * truy vấn theo `user_id` của người đang đăng nhập.
 */
const router = require('express').Router();
const userCtrl = require('../controllers/userController');
const wishCtrl = require('../controllers/wishlistController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

// Wishlist (any authenticated user)
router.get('/wishlist', authenticate, userCtrl.getWishlist);
router.post('/wishlist/toggle', authenticate, userCtrl.toggleWishlist);

// Admin user management
router.get('/', authenticate, requireAdmin, userCtrl.getAll);
router.put('/:id', authenticate, requireAdmin, userCtrl.update);
router.delete('/:id', authenticate, requireAdmin, userCtrl.delete);

module.exports = router;
