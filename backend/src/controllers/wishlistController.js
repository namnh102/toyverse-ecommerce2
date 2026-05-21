const { WishlistModel } = require('../models/bannerModel');

exports.getWishlist = async (req, res, next) => {
  try {
    const items = await WishlistModel.getByUser(req.user.id);
    res.json({ success: true, items });
  } catch (err) { next(err); }
};

exports.toggleWishlist = async (req, res, next) => {
  try {
    const { product_id } = req.body;
    const added = await WishlistModel.toggle(req.user.id, parseInt(product_id));
    res.json({ success: true, added, message: added ? 'Added to wishlist' : 'Removed from wishlist' });
  } catch (err) { next(err); }
};
