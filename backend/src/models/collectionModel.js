const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  cover_image: { type: String, default: null },
  status:      { type: String, enum: ['upcoming', 'active', 'sold_out', 'archived'], default: 'active' },
  drop_date:   { type: Date, default: null },
  is_featured: { type: Boolean, default: false },
  sort_order:  { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Collection = mongoose.model('Collection', collectionSchema);

Collection.getFeatured = async (limit = 6) => {
  const collections = await Collection.find({ status: { $ne: 'archived' }, is_featured: true })
    .sort({ sort_order: 1 })
    .limit(limit)
    .lean();

  // Count products per collection
  const Product = require('./productModel');
  const ids = collections.map(c => c._id);
  const counts = await Product.aggregate([
    { $match: { collection_id: { $in: ids }, is_active: true } },
    { $group: { _id: '$collection_id', count: { $sum: 1 } } }
  ]);
  const countMap = {};
  counts.forEach(c => { countMap[c._id?.toString()] = c.count; });

  return collections.map(c => ({
    ...c, id: c._id,
    product_count: countMap[c._id?.toString()] || 0
  }));
};

Collection.getAll = async () => {
  const cols = await Collection.find({ status: { $ne: 'archived' } }).sort({ sort_order: 1 }).lean();
  return cols.map(c => ({ ...c, id: c._id }));
};

module.exports = Collection;
