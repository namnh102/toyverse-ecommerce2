const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: { createdAt: 'created_at' } });

wishlistSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

Wishlist.getByUser = async (userId) => {
  const items = await Wishlist.find({ user_id: userId })
    .populate({
      path: 'product_id',
      select: 'name slug price compare_price images avg_rating review_count status is_active',
    })
    .lean();

  return {
    items: items
      .filter(i => i.product_id?.is_active)
      .map(i => {
        const p = i.product_id;
        const pri = (p.images || []).find(img => img.is_primary) || p.images?.[0];
        return {
          id:           i._id,
          product_id:   p._id,
          name:         p.name,
          slug:         p.slug,
          price:        p.price,
          compare_price:p.compare_price,
          image:        pri?.image_url || null,
          avg_rating:   p.avg_rating,
          review_count: p.review_count,
          status:       p.status,
          added_at:     i.created_at,
        };
      }),
  };
};

module.exports = Wishlist;
