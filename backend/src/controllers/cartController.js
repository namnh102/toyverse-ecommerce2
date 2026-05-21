const CartItem = require('../models/cartModel');
const Product  = require('../models/productModel');

exports.getCart = async (req, res, next) => {
  try {
    const cart = await CartItem.getCartByUser(req.user.id);
    res.json({ success: true, ...cart });
  } catch (err) { next(err); }
};

exports.addItem = async (req, res, next) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    const product = await Product.findById(product_id);
    if (!product || !product.is_active)
      return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock_qty < 1)
      return res.status(400).json({ success: false, message: 'Product is out of stock' });

    // Upsert cart item
    await CartItem.findOneAndUpdate(
      { user_id: req.user.id, product_id },
      { $inc: { quantity: Number(quantity) } },
      { upsert: true, new: true }
    );

    const cart = await CartItem.getCartByUser(req.user.id);
    res.json({ success: true, message: 'Added to cart', ...cart });
  } catch (err) { next(err); }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { product_id, quantity } = req.body;
    const qty = Number(quantity);

    if (qty < 1) {
      await CartItem.findOneAndDelete({ user_id: req.user.id, product_id });
    } else {
      await CartItem.findOneAndUpdate(
        { user_id: req.user.id, product_id },
        { $set: { quantity: qty } }
      );
    }

    const cart = await CartItem.getCartByUser(req.user.id);
    res.json({ success: true, ...cart });
  } catch (err) { next(err); }
};

exports.removeItem = async (req, res, next) => {
  try {
    const productId = req.body.product_id || req.params.productId;
    await CartItem.findOneAndDelete({ user_id: req.user.id, product_id: productId });
    const cart = await CartItem.getCartByUser(req.user.id);
    res.json({ success: true, ...cart });
  } catch (err) { next(err); }
};

exports.clearCart = async (req, res, next) => {
  try {
    await CartItem.deleteMany({ user_id: req.user.id });
    res.json({ success: true, message: 'Cart cleared', items: [], subtotal: 0, item_count: 0 });
  } catch (err) { next(err); }
};
