/**
 * ROUTER DANH MỤC (CATEGORY ROUTES)
 * Chức năng: Điều hướng các API liên quan đến thao tác với Danh mục sản phẩm.
 * - Public Route (Mở): API lấy danh sách danh mục (để hiện trên thanh menu web).
 * - Admin Route (Khóa): API Tạo, Sửa, Xóa yêu cầu quyền Admin. Có gắn thêm middleware 
 *   `upload.single('image')` để hứng file ảnh đính kèm từ Frontend.
 */
const router = require('express').Router();
const catCtrl = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get('/', catCtrl.getAll);
router.post('/', authenticate, requireAdmin, upload.single('image'), catCtrl.create);
router.put('/:id', authenticate, requireAdmin, upload.single('image'), catCtrl.update);
router.delete('/:id', authenticate, requireAdmin, catCtrl.delete);

module.exports = router;
