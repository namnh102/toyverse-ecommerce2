const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  subtitle:    { type: String, default: '' },
  cta_text:    { type: String, default: 'Shop Now' },
  cta_link:    { type: String, default: '/shop' },
  image_url:   { type: String, default: null },
  badge_text:  { type: String, default: null },
  badge_color: { type: String, default: '#F9A8C9' },
  position:    { type: String, enum: ['hero', 'secondary', 'collection', 'popup'], default: 'hero' },
  is_active:   { type: Boolean, default: true },
  sort_order:  { type: Number, default: 0 },
  start_date:  { type: Date, default: null },
  end_date:    { type: Date, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Banner = mongoose.model('Banner', bannerSchema);

Banner.getActive = async (position = 'hero') => {
  const now = new Date();
  const banners = await Banner.find({
    is_active: true,
    position,
    $or: [
      { start_date: null },
      { start_date: { $lte: now } }
    ],
    $or: [
      { end_date: null },
      { end_date: { $gte: now } }
    ]
  }).sort({ sort_order: 1 }).lean();
  return banners.map(b => ({ ...b, id: b._id }));
};

module.exports = Banner;
