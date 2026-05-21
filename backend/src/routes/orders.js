
const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.post('/', authenticate, ctrl.create);
router.get('/my', authenticate, ctrl.getMyOrders);
router.get('/admin', authenticate, requireAdmin, ctrl.getAll);
router.get('/:id', authenticate, ctrl.getById);
router.put('/:id/status', authenticate, requireAdmin, ctrl.updateStatus);

module.exports = router;
