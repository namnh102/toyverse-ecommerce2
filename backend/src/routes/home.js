const router     = require('express').Router();
const Banner     = require('../models/bannerModel');
const Collection = require('../models/collectionModel');
const homeCtrl   = require('../controllers/homeController');

// Full homepage data in one call
router.get('/', homeCtrl.getHomeData);

// Individual endpoints
router.get('/banners', async (req, res, next) => {
  try {
    const banners = await Banner.getActive(req.query.position || 'hero');
    res.json({ success: true, banners });
  } catch (err) { next(err); }
});

router.get('/collections', async (req, res, next) => {
  try {
    const collections = await Collection.getFeatured();
    res.json({ success: true, collections });
  } catch (err) { next(err); }
});

router.get('/collections/all', async (req, res, next) => {
  try {
    const collections = await Collection.getAll();
    res.json({ success: true, collections });
  } catch (err) { next(err); }
});

module.exports = router;
