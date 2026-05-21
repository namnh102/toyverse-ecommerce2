-- =============================================
-- ToyVerse Seed Data
-- Run AFTER schema.sql
-- =============================================
USE toyverse;

-- ============ USERS ============
-- Admin password: Admin@123
-- User password: User@123
INSERT INTO users (full_name, email, password_hash, phone, role) VALUES
('ToyVerse Admin', 'admin@toyverse.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHi.', '0901234567', 'admin'),
('Minh Hoa', 'user@toyverse.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC..og/at2.uNoEFYxG.', '0912345678', 'user'),
('Lan Anh', 'lananh@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC..og/at2.uNoEFYxG.', '0923456789', 'user');

-- ============ CATEGORIES ============
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Blind Box', 'blind-box', 'Mystery collectible blind boxes — open to discover!', 1),
('Figures', 'figures', 'Premium designer figures and statues', 2),
('Plush Toys', 'plush', 'Soft, cuddly plush collectibles', 3),
('Keychains', 'keychains', 'Cute & collectible keychains', 4),
('Art Toys', 'art-toys', 'Designer art toys from global artists', 5),
('Limited Edition', 'limited-edition', 'Exclusive limited drops', 6),
('New Arrivals', 'new-arrivals', 'Fresh drops just landed', 7),
('Accessories', 'accessories', 'Display stands, cases, and more', 8);

-- ============ COLLECTIONS ============
INSERT INTO collections (name, slug, description, status, drop_date, is_featured, sort_order) VALUES
('Dreamy Pastel Series', 'dreamy-pastel-series', 'A sweet collection inspired by cotton candy skies and soft hues. 12 characters to collect.', 'active', '2026-03-15', 1, 1),
('Galaxy Wanderers', 'galaxy-wanderers', 'Cosmic explorers from beyond the stars. 8 hidden characters + 1 secret.', 'active', '2026-02-01', 1, 2),
('Forest Friends Vol.2', 'forest-friends-vol2', 'Adorable woodland creatures in their natural habitat. 10 pieces + 2 secret.', 'active', '2026-01-10', 0, 3),
('Neon Nights Series', 'neon-nights', 'Urban glow — vibrant neon-lit characters for night owls. Limited 500 sets.', 'active', '2026-04-01', 1, 4),
('Sakura Dreams', 'sakura-dreams', 'Cherry blossom season exclusive. 6 pieces only.', 'sold_out', '2025-04-01', 0, 5),
('Autumn Harvest Drop', 'autumn-harvest', 'Cozy fall vibes collector set. Coming soon.', 'upcoming', '2026-09-01', 0, 6);

-- ============ PRODUCTS ============
INSERT INTO products (name, slug, sku, description, short_description, price, compare_price, stock_qty, category_id, collection_id, brand, material, dimensions, status, is_blind_box, is_featured, is_best_seller, total_sold, avg_rating, review_count) VALUES

-- Blind Boxes
('Dreamy Pastel Blind Box Series 1', 'dreamy-pastel-blind-box-s1', 'BP-001', 
 'Open the box to discover which adorable Dreamy Pastel character you got! 12 different designs including 1 secret limited edition. Each box contains 1 mystery figure. Perfect for collectors and gifting.', 
 '12 characters to collect · 1 secret edition · 9cm vinyl figure', 
 320000, 380000, 150, 1, 1, 'ToyVerse Original', 'PVC Vinyl', '9 cm × 6 cm × 6 cm', 'hot', 1, 1, 1, 482, 4.80, 124),

('Galaxy Wanderers Blind Box', 'galaxy-wanderers-blind-box', 'GW-001',
 'Journey through the cosmos with the Galaxy Wanderers blind box series. 8 main characters + 1 secret cosmic traveler. Glow-in-the-dark details on select pieces.',
 '8 characters + 1 secret · Glow-in-dark details · 10cm figure',
 350000, 420000, 89, 1, 2, 'ToyVerse Original', 'PVC + Phosphor Paint', '10 cm × 7 cm × 7 cm', 'limited', 1, 1, 1, 312, 4.92, 87),

('Forest Friends Blind Box Vol.2', 'forest-friends-blind-box-v2', 'FF-002',
 'The beloved Forest Friends are back! Vol.2 brings 10 new woodland creatures + 2 secret special editions. Soft matte finish with flocked texture details.',
 '10 characters + 2 secrets · Flocked texture · 8cm figure',
 290000, NULL, 203, 1, 3, 'ToyVerse Original', 'PVC + Flock', '8 cm × 6 cm × 6 cm', 'new', 1, 1, 0, 156, 4.70, 43),

-- Figures
('Neon Bunny Designer Figure', 'neon-bunny-figure', 'NB-001',
 'An iconic designer figure featuring Neon Bunny in her signature glow suit. Hand-painted details with neon-reactive paint. Artist edition — numbered and signed certificate included.',
 'Hand-painted · Numbered edition · Artist certificate · 18cm',
 890000, NULL, 45, 2, 4, 'NeonCraft Studio', 'ABS + Hand-painted Detail', '18 cm × 9 cm × 9 cm', 'limited', 0, 1, 0, 78, 5.00, 31),

('Cotton Cloud Bear Figure', 'cotton-cloud-bear-figure', 'CC-001',
 'The softest vibes in figure form. Cotton Cloud Bear sits atop a dreamy cloud base with pastel rainbow detailing. A perfect desk companion.',
 'Cloud base included · Pastel rainbow detail · 12cm seated',
 450000, 520000, 120, 2, 1, 'ToyVerse Original', 'Resin + Acrylic Paint', '12 cm × 10 cm × 8 cm', 'hot', 0, 1, 1, 267, 4.85, 94),

('Astro Cat Vinyl Figure', 'astro-cat-vinyl-figure', 'AC-001',
 'Astro Cat explores the universe in her bubble helmet and star suit. Bold colors with a matte finish for that premium toy feel. Collectible display piece.',
 'Bubble helmet detail · Bold matte colors · 15cm standing',
 560000, NULL, 67, 2, 2, 'ToyVerse Original', 'Vinyl + Matte Finish', '15 cm × 8 cm × 8 cm', 'new', 0, 0, 0, 89, 4.60, 22),

-- Plush
('Boba Bear Plush - Large', 'boba-bear-plush-large', 'PL-001',
 'The coziest boba-themed bear plush you will ever cuddle! Super soft minky fabric, filled with premium PP cotton. Features a tiny boba cup accessory. Machine washable.',
 'Super soft minky · PP cotton fill · Boba cup accessory · 30cm',
 380000, 450000, 180, 3, 1, 'ToyVerse Original', 'Minky Fabric + PP Cotton',  '30 cm height', 'hot', 0, 1, 1, 521, 4.90, 203),

('Sleepy Cloud Plush', 'sleepy-cloud-plush', 'PL-002',
 'Fluffy white cloud plush with the softest expression. Perfect for gifting or decorating. Ultra-plush fill makes it incredibly squishy.',
 'Ultra-plush fill · Squishy soft · Perfect for gifting · 25cm',
 280000, NULL, 145, 3, NULL, 'ToyVerse Original', 'Velboa + PP Cotton', '25 cm × 30 cm', 'normal', 0, 0, 0, 134, 4.75, 56),

('Starry Fox Plush Keychain', 'starry-fox-plush-keychain', 'KP-001',
 'A mini plush keychain featuring the beloved Starry Fox character. Attach to your bag, keys, or use as a bag charm!',
 'Mini plush keychain · Bag charm · Starry Fox character · 12cm',
 120000, 150000, 350, 4, NULL, 'ToyVerse Original', 'Plush + Metal Clip', '12 cm', 'hot', 0, 0, 1, 645, 4.80, 178),

-- Art Toys
('Melting Bunny Art Toy', 'melting-bunny-art-toy', 'AT-001',
 'A surrealist art toy featuring a bunny in a melting form. Created in collaboration with digital artist @dripstudio. Each piece is unique with slight hand-finishing variations.',
 'Artist collab · Hand-finished · Surrealist design · 20cm',
 1200000, NULL, 30, 5, 4, 'Drip Studio x ToyVerse', 'Polyresin + Hand-painted', '20 cm × 12 cm × 10 cm', 'limited', 0, 1, 0, 45, 5.00, 19),

('Pastel Ghost Art Figure', 'pastel-ghost-art-figure', 'AT-002',
 'Friendly ghost with pastel gradient paint job. A conversation piece for any collector shelf or gallery wall display.',
 'Gradient pastel finish · Gallery display piece · 16cm',
 780000, 900000, 55, 5, 1, 'ToyVerse Original', 'Vinyl + Soft Paint', '16 cm × 9 cm × 9 cm', 'hot', 0, 1, 1, 123, 4.88, 41),

-- Keychains
('Dreamy Pastel Keychain Set', 'dreamy-pastel-keychain-set', 'KC-001',
 'A set of 3 keychains featuring the most popular Dreamy Pastel characters: Candy Bunny, Cloud Cat, and Rainbow Puppy. Acrylic with enamel detail.',
 'Set of 3 keychains · Acrylic + enamel · Mix & match characters',
 180000, 220000, 280, 4, 1, 'ToyVerse Original', 'Acrylic + Enamel', '6 cm each', 'normal', 0, 0, 1, 412, 4.70, 89),

-- Limited Edition
('Sakura Dreams Complete Set', 'sakura-dreams-complete-set', 'LD-001',
 'The complete Sakura Dreams collection — all 6 characters in one exclusive box set. Each figure features cherry blossom themed painting with gold accent details. Numbered 1-500.',
 'Complete 6-figure set · Gold accents · Numbered 1-500 · Exclusive box',
 2800000, NULL, 12, 6, 5, 'ToyVerse Limited', 'PVC + Gold Paint', '10 cm each × 6 figures', 'limited', 0, 1, 0, 488, 5.00, 67),

('Neon Nights Display Stand', 'neon-nights-display-stand', 'ACC-001',
 'Official display stand for the Neon Nights series. LED-lit acrylic platform with USB-C power. Fits all figures in the Neon Nights collection.',
 'LED acrylic stand · USB-C powered · Fits Neon Nights figures',
 350000, NULL, 78, 8, 4, 'ToyVerse Official', 'Acrylic + LED', '20 cm × 20 cm × 3 cm', 'new', 0, 0, 0, 67, 4.65, 18);

-- ============ PRODUCT IMAGES ============
-- Using placeholder paths - in production these would be real uploaded images
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES
(1, '/uploads/products/dreamy-pastel-box-1.jpg', 'Dreamy Pastel Blind Box front', 0, 1),
(1, '/uploads/products/dreamy-pastel-box-2.jpg', 'Dreamy Pastel characters spread', 1, 0),
(1, '/uploads/products/dreamy-pastel-box-3.jpg', 'Dreamy Pastel box packaging', 2, 0),
(2, '/uploads/products/galaxy-box-1.jpg', 'Galaxy Wanderers Blind Box', 0, 1),
(2, '/uploads/products/galaxy-box-2.jpg', 'Galaxy Wanderers characters', 1, 0),
(3, '/uploads/products/forest-box-1.jpg', 'Forest Friends Vol.2 Box', 0, 1),
(4, '/uploads/products/neon-bunny-1.jpg', 'Neon Bunny Figure front', 0, 1),
(4, '/uploads/products/neon-bunny-2.jpg', 'Neon Bunny Figure side', 1, 0),
(5, '/uploads/products/cotton-bear-1.jpg', 'Cotton Cloud Bear Figure', 0, 1),
(5, '/uploads/products/cotton-bear-2.jpg', 'Cotton Cloud Bear close-up', 1, 0),
(6, '/uploads/products/astro-cat-1.jpg', 'Astro Cat Vinyl Figure', 0, 1),
(7, '/uploads/products/boba-bear-1.jpg', 'Boba Bear Plush Large', 0, 1),
(7, '/uploads/products/boba-bear-2.jpg', 'Boba Bear Plush detail', 1, 0),
(8, '/uploads/products/sleepy-cloud-1.jpg', 'Sleepy Cloud Plush', 0, 1),
(9, '/uploads/products/starry-fox-kc-1.jpg', 'Starry Fox Plush Keychain', 0, 1),
(10, '/uploads/products/melting-bunny-1.jpg', 'Melting Bunny Art Toy', 0, 1),
(10, '/uploads/products/melting-bunny-2.jpg', 'Melting Bunny detail view', 1, 0),
(11, '/uploads/products/pastel-ghost-1.jpg', 'Pastel Ghost Art Figure', 0, 1),
(12, '/uploads/products/dreamy-kc-set-1.jpg', 'Dreamy Pastel Keychain Set', 0, 1),
(13, '/uploads/products/sakura-complete-1.jpg', 'Sakura Dreams Complete Set', 0, 1),
(13, '/uploads/products/sakura-complete-2.jpg', 'Sakura Dreams box', 1, 0),
(14, '/uploads/products/neon-stand-1.jpg', 'Neon Nights Display Stand', 0, 1);

-- ============ BANNERS ============
INSERT INTO banners (title, subtitle, cta_text, cta_link, badge_text, badge_color, position, sort_order) VALUES
('New Drop Just Landed 🌸', 'Dreamy Pastel Series — 12 characters to collect. Limited stock.', 'Shop Now', '/shop?collection=dreamy-pastel-series', 'New Drop', '#F9A8C9', 'hero', 1),
('Galaxy Wanderers Is Here', 'Explore the cosmos with 8 hidden characters + 1 secret edition.', 'Explore Collection', '/shop?collection=galaxy-wanderers', 'Limited Edition', '#C9B8FF', 'hero', 2),
('Blind Box Season — Open Your Fate', 'Collect them all. Mystery awaits in every box.', 'Browse Blind Boxes', '/shop?category=blind-box', 'Best Seller', '#A8E6CF', 'hero', 3);

-- ============ REVIEWS ============
INSERT INTO reviews (product_id, user_id, rating, title, body, is_verified_purchase) VALUES
(1, 2, 5, 'Absolutely adorable!', 'Got the secret edition on my second box! The quality is amazing, colors are so vivid. Will definitely collect all 12.', 1),
(1, 3, 5, 'Perfect blind box experience', 'Love the packaging and the figure quality. Already bought 3 boxes trying to complete the set!', 1),
(5, 2, 5, 'Best desk buddy ever', 'Cotton Cloud Bear sits perfectly on my shelf. The pastel colors are exactly as the photos. So worth it!', 1),
(7, 2, 5, 'Incredibly soft!', 'This is without a doubt the softest plush I own. The boba cup accessory is the cutest detail. Got one for my sister too.', 1),
(9, 3, 4, 'Great quality for the price', 'Really solid acrylic keychain, colors are accurate. The metal clip is sturdy. Very happy with this purchase.', 1),
(10, 2, 5, 'Museum-worthy piece', 'The Melting Bunny is absolutely stunning in person. You can see every hand-finished detail. Worth every penny.', 1),
(13, 3, 5, 'Treasure set', 'The Sakura Dreams complete set arrived in perfect condition. The gold accents are beautiful. Numbered 127/500 — truly special.', 1);

-- ============ WISHLISTS ============
INSERT INTO wishlists (user_id, product_id) VALUES
(2, 2),
(2, 4),
(2, 10),
(3, 1),
(3, 13),
(3, 7);

SELECT 'ToyVerse seed data loaded successfully!' AS status;
