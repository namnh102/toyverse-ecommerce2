-- =============================================
-- ToyVerse E-Commerce Database Schema
-- Version: 1.0.0
-- =============================================

CREATE DATABASE IF NOT EXISTS toyverse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE toyverse;

-- ---------------------------------------------
-- USERS
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar VARCHAR(500),
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB;

-- ---------------------------------------------
-- CATEGORIES
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  image VARCHAR(500),
  parent_id INT UNSIGNED DEFAULT NULL,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_parent (parent_id)
) ENGINE=InnoDB;

-- ---------------------------------------------
-- COLLECTIONS / SERIES
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS collections (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  description TEXT,
  cover_image VARCHAR(500),
  status ENUM('upcoming','active','sold_out','archived') NOT NULL DEFAULT 'active',
  drop_date DATE,
  is_featured TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- ---------------------------------------------
-- PRODUCTS
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(250) NOT NULL,
  slug VARCHAR(270) NOT NULL UNIQUE,
  sku VARCHAR(100),
  description TEXT,
  short_description VARCHAR(500),
  price DECIMAL(12,2) NOT NULL,
  compare_price DECIMAL(12,2) DEFAULT NULL COMMENT 'Original price for sale display',
  stock_qty INT UNSIGNED NOT NULL DEFAULT 0,
  category_id INT UNSIGNED NOT NULL,
  collection_id INT UNSIGNED DEFAULT NULL,
  brand VARCHAR(150),
  material VARCHAR(200),
  dimensions VARCHAR(200) COMMENT 'e.g. 12cm x 8cm x 6cm',
  weight DECIMAL(8,2) COMMENT 'in grams',
  status ENUM('new','hot','limited','sold_out','normal') NOT NULL DEFAULT 'normal',
  is_blind_box TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_featured TINYINT(1) DEFAULT 0,
  is_best_seller TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  total_sold INT UNSIGNED DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_category (category_id),
  INDEX idx_status (status),
  INDEX idx_featured (is_featured),
  INDEX idx_best_seller (is_best_seller),
  INDEX idx_price (price),
  FULLTEXT KEY ft_name_desc (name, description)
) ENGINE=InnoDB;

-- ---------------------------------------------
-- PRODUCT IMAGES
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(250),
  sort_order INT DEFAULT 0,
  is_primary TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id)
) ENGINE=InnoDB;

-- ---------------------------------------------
-- ADDRESSES
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line1 VARCHAR(300) NOT NULL,
  address_line2 VARCHAR(300),
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) NOT NULL DEFAULT 'Vietnam',
  is_default TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- ---------------------------------------------
-- CART ITEMS
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_product (user_id, product_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- ---------------------------------------------
-- ORDERS
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  user_id INT UNSIGNED NOT NULL,
  shipping_address_id INT UNSIGNED,
  -- Snapshot of address at time of order
  shipping_full_name VARCHAR(150),
  shipping_phone VARCHAR(20),
  shipping_address TEXT,
  shipping_city VARCHAR(100),
  shipping_province VARCHAR(100),
  shipping_country VARCHAR(100),
  
  subtotal DECIMAL(12,2) NOT NULL,
  shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(12,2) NOT NULL,
  
  payment_method ENUM('cod','bank_transfer','credit_card','e_wallet') NOT NULL DEFAULT 'cod',
  payment_status ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  
  status ENUM('pending','confirmed','shipping','completed','cancelled') NOT NULL DEFAULT 'pending',
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (shipping_address_id) REFERENCES addresses(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_order_number (order_number),
  INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ---------------------------------------------
-- ORDER ITEMS
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  product_name VARCHAR(250) NOT NULL COMMENT 'Snapshot at purchase',
  product_image VARCHAR(500),
  price DECIMAL(12,2) NOT NULL COMMENT 'Price at purchase',
  quantity INT UNSIGNED NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_order (order_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB;

-- ---------------------------------------------
-- REVIEWS
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(200),
  body TEXT,
  is_verified_purchase TINYINT(1) DEFAULT 0,
  is_approved TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_product (user_id, product_id),
  INDEX idx_product (product_id),
  INDEX idx_rating (rating)
) ENGINE=InnoDB;

-- ---------------------------------------------
-- WISHLISTS
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS wishlists (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_product (user_id, product_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- ---------------------------------------------
-- BANNERS
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS banners (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),
  cta_text VARCHAR(100),
  cta_link VARCHAR(500),
  image_url VARCHAR(500),
  badge_text VARCHAR(100) COMMENT 'e.g. New Drop, Limited Edition',
  badge_color VARCHAR(50) DEFAULT '#F9A8C9',
  position ENUM('hero','secondary','collection','popup') NOT NULL DEFAULT 'hero',
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  start_date DATETIME,
  end_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_position (position),
  INDEX idx_active (is_active)
) ENGINE=InnoDB;
