const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

cartItemSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

const CartItem = mongoose.model('CartItem', cartItemSchema);

CartItem.getCartByUser = async (userId) => {
  const items = await CartItem.find({ user_id: userId })
    .populate({
      path: 'product_id',
      select: 'name slug price compare_price stock_qty images status is_active',
    })
    .lean();

  let subtotal = 0;
  const formatted = items
    .filter(item => item.product_id && item.product_id.is_active)
    .map(item => {
      const p = item.product_id;
      const primary = (p.images || []).find(i => i.is_primary) || p.images?.[0];
      const lineTotal = p.price * item.quantity;
      subtotal += lineTotal;
      return {
        cart_item_id: item._id,
        product_id: p._id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        compare_price: p.compare_price,
        stock_qty: p.stock_qty,
        status: p.status,
        image: primary?.image_url || null,
        quantity: item.quantity,
      };
    });

  return { items: formatted, subtotal, item_count: formatted.length };
};

module.exports = CartItem;
