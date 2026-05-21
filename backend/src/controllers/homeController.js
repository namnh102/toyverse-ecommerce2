const Product    = require('../models/productModel');
const Category   = require('../models/categoryModel');
const Collection = require('../models/collectionModel');
const Banner     = require('../models/bannerModel');

exports.getHomeData = async (req, res, next) => {
  try {
    const [banners, categories, featured, blind_boxes, best_sellers, new_arrivals, collections] = await Promise.all([
      Banner.getActive('hero'),
      Category.getAll({ active: 'true' }).then(r => r.categories.slice(0, 8)),
      Product.getAll({ is_featured: 'true', limit: 8, sort: 'popular' }).then(r => r.rows),
      Product.getAll({ is_blind_box: 'true', limit: 6, sort: 'popular' }).then(r => r.rows),
      Product.getAll({ is_best_seller: 'true', limit: 8, sort: 'popular' }).then(r => r.rows),
      Product.getAll({ sort: 'newest', limit: 8 }).then(r => r.rows),
      Collection.getFeatured(4),
    ]);

    res.json({
      success: true,
      banners,
      categories,
      featured,
      blind_boxes,
      best_sellers,
      new_arrivals,
      collections,
    });
  } catch (err) { next(err); }
};
