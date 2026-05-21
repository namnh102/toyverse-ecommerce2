/**
 * ToyVerse — MongoDB Seed Script
 * Vị trí: backend/seed.js
 * Chạy:  npm run seed (từ thư mục backend)
 */
require('dotenv').config();               // .env nằm cùng thư mục backend/
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const path     = require('path');

// ─── Models ──────────────────────────────────────────────────────────────────
const User       = require('./src/models/userModel');
const Category   = require('./src/models/categoryModel');
const Collection = require('./src/models/collectionModel');
const Product    = require('./src/models/productModel');
const Banner     = require('./src/models/bannerModel');
const Review     = require('./src/models/reviewModel');

const run = async () => {
  console.log('🔌 Connecting to MongoDB:', process.env.MONGO_URI);
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // ── Xóa dữ liệu cũ ─────────────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Collection.deleteMany({}),
    Product.deleteMany({}),
    Banner.deleteMany({}),
    Review.deleteMany({}),
  ]);
  console.log('🗑️  Cleared old data');

  // ── USERS ───────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const userHash  = await bcrypt.hash('User@123', 10);

  const [admin, user1, user2] = await User.insertMany([
    { full_name: 'ToyVerse Admin', email: 'admin@toyverse.com', password_hash: adminHash, phone: '0901234567', role: 'admin' },
    { full_name: 'Minh Hoa',       email: 'user@toyverse.com',  password_hash: userHash,  phone: '0912345678', role: 'user'  },
    { full_name: 'Lan Anh',        email: 'lananh@example.com', password_hash: userHash,  phone: '0923456789', role: 'user'  },
  ]);
  console.log('👤 Users created');

  // ── CATEGORIES ──────────────────────────────────────────────────────────────
  const cats = await Category.insertMany([
    { name: 'Blind Box',       slug: 'blind-box',       description: 'Mystery collectible blind boxes!',              sort_order: 1 },
    { name: 'Figures',         slug: 'figures',         description: 'Premium designer figures and statues',          sort_order: 2 },
    { name: 'Plush Toys',      slug: 'plush',           description: 'Soft, cuddly plush collectibles',               sort_order: 3 },
    { name: 'Keychains',       slug: 'keychains',       description: 'Cute & collectible keychains',                  sort_order: 4 },
    { name: 'Art Toys',        slug: 'art-toys',        description: 'Designer art toys from global artists',         sort_order: 5 },
    { name: 'Limited Edition', slug: 'limited-edition', description: 'Exclusive limited drops',                       sort_order: 6 },
    { name: 'New Arrivals',    slug: 'new-arrivals',    description: 'Fresh drops just landed',                       sort_order: 7 },
    { name: 'Accessories',     slug: 'accessories',     description: 'Display stands, cases, and more',              sort_order: 8 },
  ]);
  const [catBlind, catFigure, catPlush, catKeychain, catArtToy, catLimited, , catAcc] = cats;
  console.log('🏷️  Categories created');

  // ── COLLECTIONS ─────────────────────────────────────────────────────────────
  const cols = await Collection.insertMany([
    { name: 'Dreamy Pastel Series', slug: 'dreamy-pastel-series', description: '12 characters to collect.', status: 'active',   drop_date: new Date('2026-03-15'), is_featured: true,  sort_order: 1 },
    { name: 'Galaxy Wanderers',     slug: 'galaxy-wanderers',     description: '8 hidden + 1 secret.',      status: 'active',   drop_date: new Date('2026-02-01'), is_featured: true,  sort_order: 2 },
    { name: 'Forest Friends Vol.2', slug: 'forest-friends-vol2',  description: '10 pieces + 2 secret.',     status: 'active',   drop_date: new Date('2026-01-10'), is_featured: false, sort_order: 3 },
    { name: 'Neon Nights Series',   slug: 'neon-nights',          description: 'Limited 500 sets.',         status: 'active',   drop_date: new Date('2026-04-01'), is_featured: true,  sort_order: 4 },
    { name: 'Sakura Dreams',        slug: 'sakura-dreams',        description: '6 pieces only.',            status: 'sold_out', drop_date: new Date('2025-04-01'), is_featured: false, sort_order: 5 },
    { name: 'Autumn Harvest Drop',  slug: 'autumn-harvest',       description: 'Coming soon.',              status: 'upcoming', drop_date: new Date('2026-09-01'), is_featured: false, sort_order: 6 },
  ]);
  const [colPastel, colGalaxy, colForest, colNeon, colSakura] = cols;
  console.log('📦 Collections created');

  // ── PRODUCTS ────────────────────────────────────────────────────────────────
  const prods = await Product.insertMany([
    {
      name: 'Dreamy Pastel Blind Box Series 1', slug: 'dreamy-pastel-blind-box-s1', sku: 'BP-001',
      description: 'Open the box to discover which adorable Dreamy Pastel character you got! 12 different designs including 1 secret limited edition.',
      short_description: '12 characters to collect · 1 secret edition · 9cm vinyl figure',
      price: 320000, compare_price: 380000, stock_qty: 150,
      category_id: catBlind._id, collection_id: colPastel._id,
      brand: 'ToyVerse Original', material: 'PVC Vinyl', dimensions: '9cm × 6cm × 6cm',
      status: 'hot', is_blind_box: true, is_featured: true, is_best_seller: true,
      total_sold: 482, avg_rating: 4.80, review_count: 124,
      images: [{ image_url: '/uploads/products/dreamy-pastel-box-1.jpg', alt_text: 'Dreamy Pastel Box', is_primary: true, sort_order: 0 }],
    },
    {
      name: 'Galaxy Wanderers Blind Box', slug: 'galaxy-wanderers-blind-box', sku: 'GW-001',
      description: 'Journey through the cosmos with 8 main characters + 1 secret cosmic traveler.',
      short_description: '8 characters + 1 secret · Glow-in-dark details · 10cm figure',
      price: 350000, compare_price: 420000, stock_qty: 89,
      category_id: catBlind._id, collection_id: colGalaxy._id,
      brand: 'ToyVerse Original', material: 'PVC + Phosphor Paint', dimensions: '10cm × 7cm × 7cm',
      status: 'limited', is_blind_box: true, is_featured: true, is_best_seller: true,
      total_sold: 312, avg_rating: 4.92, review_count: 87,
      images: [{ image_url: '/uploads/products/galaxy-box-1.jpg', alt_text: 'Galaxy Wanderers Box', is_primary: true, sort_order: 0 }],
    },
    {
      name: 'Forest Friends Blind Box Vol.2', slug: 'forest-friends-blind-box-v2', sku: 'FF-002',
      description: 'The beloved Forest Friends are back! 10 woodland creatures + 2 secret editions.',
      short_description: '10 characters + 2 secrets · Flocked texture · 8cm figure',
      price: 290000, stock_qty: 203,
      category_id: catBlind._id, collection_id: colForest._id,
      brand: 'ToyVerse Original', material: 'PVC + Flock', dimensions: '8cm × 6cm × 6cm',
      status: 'new', is_blind_box: true, is_featured: true,
      total_sold: 156, avg_rating: 4.70, review_count: 43,
      images: [{ image_url: '/uploads/products/forest-box-1.jpg', alt_text: 'Forest Friends Box', is_primary: true, sort_order: 0 }],
    },
    {
      name: 'Neon Bunny Designer Figure', slug: 'neon-bunny-figure', sku: 'NB-001',
      description: 'Hand-painted Neon Bunny figure with neon-reactive paint. Numbered & signed certificate.',
      short_description: 'Hand-painted · Numbered edition · 18cm',
      price: 890000, stock_qty: 45,
      category_id: catFigure._id, collection_id: colNeon._id,
      brand: 'NeonCraft Studio', material: 'ABS + Hand-painted', dimensions: '18cm × 9cm × 9cm',
      status: 'limited', is_featured: true,
      total_sold: 78, avg_rating: 5.00, review_count: 31,
      images: [{ image_url: '/uploads/products/neon-bunny-1.jpg', alt_text: 'Neon Bunny Figure', is_primary: true, sort_order: 0 }],
    },
    {
      name: 'Cotton Cloud Bear Figure', slug: 'cotton-cloud-bear-figure', sku: 'CC-001',
      description: 'Cotton Cloud Bear sits atop a dreamy cloud base with pastel rainbow detailing.',
      short_description: 'Cloud base · Pastel rainbow · 12cm seated',
      price: 450000, compare_price: 520000, stock_qty: 120,
      category_id: catFigure._id, collection_id: colPastel._id,
      brand: 'ToyVerse Original', material: 'Resin + Acrylic Paint', dimensions: '12cm × 10cm × 8cm',
      status: 'hot', is_featured: true, is_best_seller: true,
      total_sold: 267, avg_rating: 4.85, review_count: 94,
      images: [{ image_url: '/uploads/products/cotton-bear-1.jpg', alt_text: 'Cotton Cloud Bear', is_primary: true, sort_order: 0 }],
    },
    {
      name: 'Boba Bear Plush - Large', slug: 'boba-bear-plush-large', sku: 'PL-001',
      description: 'Super soft minky fabric, PP cotton fill. Includes tiny boba cup accessory. Machine washable.',
      short_description: 'Super soft minky · PP cotton · Boba cup · 30cm',
      price: 380000, compare_price: 450000, stock_qty: 180,
      category_id: catPlush._id, collection_id: colPastel._id,
      brand: 'ToyVerse Original', material: 'Minky + PP Cotton', dimensions: '30cm height',
      status: 'hot', is_featured: true, is_best_seller: true,
      total_sold: 521, avg_rating: 4.90, review_count: 203,
      images: [{ image_url: '/uploads/products/boba-bear-1.jpg', alt_text: 'Boba Bear Plush', is_primary: true, sort_order: 0 }],
    },
    {
      name: 'Sleepy Cloud Plush', slug: 'sleepy-cloud-plush', sku: 'PL-002',
      description: 'Fluffy white cloud plush. Ultra-plush fill makes it incredibly squishy.',
      short_description: 'Ultra-plush · Squishy soft · 25cm',
      price: 280000, stock_qty: 145,
      category_id: catPlush._id,
      brand: 'ToyVerse Original', material: 'Velboa + PP Cotton', dimensions: '25cm × 30cm',
      status: 'normal', total_sold: 134, avg_rating: 4.75, review_count: 56,
      images: [{ image_url: '/uploads/products/sleepy-cloud-1.jpg', alt_text: 'Sleepy Cloud Plush', is_primary: true, sort_order: 0 }],
    },
    {
      name: 'Starry Fox Plush Keychain', slug: 'starry-fox-plush-keychain', sku: 'KP-001',
      description: 'Mini plush keychain with the beloved Starry Fox character.',
      short_description: 'Mini plush keychain · Starry Fox · 12cm',
      price: 120000, compare_price: 150000, stock_qty: 350,
      category_id: catKeychain._id,
      brand: 'ToyVerse Original', material: 'Plush + Metal Clip', dimensions: '12cm',
      status: 'hot', is_best_seller: true,
      total_sold: 645, avg_rating: 4.80, review_count: 178,
      images: [{ image_url: '/uploads/products/starry-fox-kc-1.jpg', alt_text: 'Starry Fox Keychain', is_primary: true, sort_order: 0 }],
    },
    {
      name: 'Melting Bunny Art Toy', slug: 'melting-bunny-art-toy', sku: 'AT-001',
      description: 'Surrealist art toy — bunny in melting form. Artist collab @dripstudio. Hand-finished.',
      short_description: 'Artist collab · Hand-finished · 20cm',
      price: 1200000, stock_qty: 30,
      category_id: catArtToy._id, collection_id: colNeon._id,
      brand: 'Drip Studio x ToyVerse', material: 'Polyresin + Hand-painted', dimensions: '20cm × 12cm × 10cm',
      status: 'limited', is_featured: true,
      total_sold: 45, avg_rating: 5.00, review_count: 19,
      images: [{ image_url: '/uploads/products/melting-bunny-1.jpg', alt_text: 'Melting Bunny Art Toy', is_primary: true, sort_order: 0 }],
    },
    {
      name: 'Pastel Ghost Art Figure', slug: 'pastel-ghost-art-figure', sku: 'AT-002',
      description: 'Friendly ghost with pastel gradient paint job. Gallery-worthy display piece.',
      short_description: 'Gradient pastel · Gallery piece · 16cm',
      price: 780000, compare_price: 900000, stock_qty: 55,
      category_id: catArtToy._id, collection_id: colPastel._id,
      brand: 'ToyVerse Original', material: 'Vinyl + Soft Paint', dimensions: '16cm × 9cm × 9cm',
      status: 'hot', is_featured: true, is_best_seller: true,
      total_sold: 123, avg_rating: 4.88, review_count: 41,
      images: [{ image_url: '/uploads/products/pastel-ghost-1.jpg', alt_text: 'Pastel Ghost Figure', is_primary: true, sort_order: 0 }],
    },
    {
      name: 'Dreamy Pastel Keychain Set', slug: 'dreamy-pastel-keychain-set', sku: 'KC-001',
      description: 'Set of 3 keychains — Candy Bunny, Cloud Cat, Rainbow Puppy. Acrylic + enamel.',
      short_description: 'Set of 3 · Acrylic + enamel',
      price: 180000, compare_price: 220000, stock_qty: 280,
      category_id: catKeychain._id, collection_id: colPastel._id,
      brand: 'ToyVerse Original', material: 'Acrylic + Enamel', dimensions: '6cm each',
      status: 'normal', is_best_seller: true,
      total_sold: 412, avg_rating: 4.70, review_count: 89,
      images: [{ image_url: '/uploads/products/dreamy-kc-set-1.jpg', alt_text: 'Dreamy Keychain Set', is_primary: true, sort_order: 0 }],
    },
    {
      name: 'Sakura Dreams Complete Set', slug: 'sakura-dreams-complete-set', sku: 'LD-001',
      description: 'All 6 Sakura Dreams characters in one exclusive box. Gold accents. Numbered 1-500.',
      short_description: '6-figure set · Gold accents · Numbered 1-500',
      price: 2800000, stock_qty: 12,
      category_id: catLimited._id, collection_id: colSakura._id,
      brand: 'ToyVerse Limited', material: 'PVC + Gold Paint', dimensions: '10cm each × 6 figures',
      status: 'limited', is_featured: true,
      total_sold: 488, avg_rating: 5.00, review_count: 67,
      images: [{ image_url: '/uploads/products/sakura-complete-1.jpg', alt_text: 'Sakura Dreams Set', is_primary: true, sort_order: 0 }],
    },
    {
      name: 'Neon Nights Display Stand', slug: 'neon-nights-display-stand', sku: 'ACC-001',
      description: 'LED-lit acrylic display stand for Neon Nights figures. USB-C powered.',
      short_description: 'LED stand · USB-C · 20cm × 20cm',
      price: 350000, stock_qty: 78,
      category_id: catAcc._id, collection_id: colNeon._id,
      brand: 'ToyVerse Official', material: 'Acrylic + LED', dimensions: '20cm × 20cm × 3cm',
      status: 'new',
      total_sold: 67, avg_rating: 4.65, review_count: 18,
      images: [{ image_url: '/uploads/products/neon-stand-1.jpg', alt_text: 'Neon Stand', is_primary: true, sort_order: 0 }],
    },
  ]);
  console.log('🎁 Products created:', prods.length);

  // ── BANNERS ─────────────────────────────────────────────────────────────────
  await Banner.insertMany([
    { title: 'New Drop Just Landed 🌸', subtitle: 'Dreamy Pastel Series — 12 characters to collect.', cta_text: 'Shop Now',          cta_link: '/shop?collection=dreamy-pastel-series', badge_text: 'New Drop',       badge_color: '#F9A8C9', position: 'hero', sort_order: 1 },
    { title: 'Galaxy Wanderers Is Here', subtitle: '8 hidden characters + 1 secret cosmic traveler.', cta_text: 'Explore',           cta_link: '/shop?collection=galaxy-wanderers',     badge_text: 'Limited Edition', badge_color: '#C9B8FF', position: 'hero', sort_order: 2 },
    { title: 'Blind Box Season 🎲',     subtitle: 'Mystery awaits in every box.',                     cta_text: 'Browse Blind Boxes', cta_link: '/shop?category=blind-box',              badge_text: 'Best Seller',     badge_color: '#A8E6CF', position: 'hero', sort_order: 3 },
  ]);
  console.log('🖼️  Banners created');

  // ── REVIEWS ─────────────────────────────────────────────────────────────────
  await Review.insertMany([
    { product_id: prods[0]._id, user_id: user1._id, rating: 5, title: 'Absolutely adorable!',   body: 'Got the secret edition on my 2nd box! Quality is amazing.', is_verified_purchase: true },
    { product_id: prods[0]._id, user_id: user2._id, rating: 5, title: 'Perfect blind box',      body: 'Love the packaging and figure quality!',                    is_verified_purchase: true },
    { product_id: prods[4]._id, user_id: user1._id, rating: 5, title: 'Best desk buddy ever',   body: 'Cotton Cloud Bear sits perfectly on my shelf!',             is_verified_purchase: true },
    { product_id: prods[5]._id, user_id: user2._id, rating: 5, title: 'Incredibly soft!',       body: 'Softest plush I own. The boba cup is the cutest detail.',   is_verified_purchase: true },
    { product_id: prods[8]._id, user_id: user1._id, rating: 5, title: 'Museum-worthy piece',    body: 'The Melting Bunny is absolutely stunning in person.',        is_verified_purchase: true },
    { product_id: prods[9]._id, user_id: user2._id, rating: 5, title: 'Love it!',               body: 'Pastel Ghost looks amazing on my shelf.',                   is_verified_purchase: true },
  ]);
  console.log('⭐ Reviews created');

  console.log('\n✨ Seed hoàn thành!');
  console.log('─────────────────────────────────────────');
  console.log('  Admin: admin@toyverse.com / Admin@123');
  console.log('  User:  user@toyverse.com  / User@123 ');
  console.log('─────────────────────────────────────────');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => {
  console.error('❌ Seed thất bại:', err.message);
  console.error(err);
  process.exit(1);
});
