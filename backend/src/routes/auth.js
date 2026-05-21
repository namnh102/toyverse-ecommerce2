const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.post('/register', [
  body('full_name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
], ctrl.register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], ctrl.login);

router.get('/me', authenticate, ctrl.getMe);
router.put('/me', authenticate, upload.single('avatar'), ctrl.updateMe);
router.put('/me/password', authenticate, ctrl.changePassword);

module.exports = router;
