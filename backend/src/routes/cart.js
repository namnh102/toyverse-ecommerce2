const router = require('express').Router();
const ctrl = require('../controllers/cartController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', ctrl.getCart);
router.post('/add', ctrl.addItem);
router.put('/update', ctrl.updateItem);
router.delete('/empty', ctrl.clearCart); 
router.delete('/remove', ctrl.removeItem);

module.exports = router;
