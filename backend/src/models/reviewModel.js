const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product_id:           { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user_id:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:               { type: Number, required: true, min: 1, max: 5 },
  title:                { type: String, default: '' },
  body:                 { type: String, default: '' },
  is_verified_purchase: { type: Boolean, default: false },
  is_approved:          { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

reviewSchema.index({ product_id: 1, user_id: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

Review.getByProduct = async (productId, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    Review.find({ product_id: productId, is_approved: true })
      .populate('user_id', 'full_name avatar')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ product_id: productId, is_approved: true }),
  ]);

  const stats = await Review.aggregate([
    { $match: { product_id: new mongoose.Types.ObjectId(productId), is_approved: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  return {
    reviews: reviews.map(r => ({
      ...r, id: r._id,
      user_name:   r.user_id?.full_name || 'User',
      user_avatar: r.user_id?.avatar    || null,
    })),
    total,
    totalPages: Math.ceil(total / limit),
    avg_rating:   stats[0]?.avg   || 0,
    review_count: stats[0]?.count || 0,
  };
};

// Update product's aggregate rating after a review is saved/deleted
Review.updateProductRating = async (productId) => {
  const Product = require('./productModel');
  const stats = await Review.aggregate([
    { $match: { product_id: new mongoose.Types.ObjectId(productId), is_approved: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  await Product.findByIdAndUpdate(productId, {
    avg_rating:   Math.round((stats[0]?.avg || 0) * 100) / 100,
    review_count: stats[0]?.count || 0,
  });
};

module.exports = Review;
