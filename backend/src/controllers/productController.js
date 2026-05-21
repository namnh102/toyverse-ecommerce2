const Product = require('../models/productModel');
const slugify = require('slugify');
const path    = require('path');
const fs      = require('fs');

exports.getAll = async (req, res, next) => {
  try {
    const result = await Product.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const result = await Product.getByIdOrSlug(req.params.idOrSlug || req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// BƯỚC 4: XỬ LÝ LOGIC NGHIỆP VỤ TẠI CONTROLLER
exports.create = async (req, res, next) => {
  try {
    // 4.1. Bóc tách dữ liệu dạng Text (req.body) mà Frontend truyền lên qua FormData
    const {
      name, description, short_description, price, compare_price,
      stock_qty, category_id, collection_id, brand, material,
      dimensions, weight, status, is_blind_box, is_featured,
      is_best_seller, sort_order, sku
    } = req.body;

    // 4.2. Tự động khởi tạo Slug (Đường dẫn thân thiện cho SEO). Vd: "Mô Hình A" -> "mo-hinh-a-12345678"
    const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now();

    // 4.3. Bóc tách dữ liệu File Ảnh (req.files) do middleware upload đã đón được và lưu vào ổ cứng
    // Map mảng file đó thành mảng thông tin ảnh để lưu vào Database
    const images = (req.files || []).map((file, i) => ({
      image_url:  `/uploads/products/${file.filename}`, // Đây là đường dẫn trả về cho Frontend hiển thị ảnh
      alt_text:   name,
      sort_order: i, // Thứ tự hiển thị ảnh
      is_primary: i === 0, // Ảnh đầu tiên tải lên mặc định sẽ là ảnh đại diện (primary)
    }));

    // 4.4. Đóng gói tất cả thành một Object (Model) sẵn sàng đẩy vào Cơ Sở Dữ Liệu
    const product = new Product({
      name, slug, sku, description, short_description,
      price: Number(price), // Ép kiểu số
      compare_price: compare_price ? Number(compare_price) : null,
      stock_qty: Number(stock_qty) || 0,
      category_id, collection_id: collection_id || null,
      brand, material, dimensions, weight,
      status: status || 'normal',
      // Vì dữ liệu FormData toàn bộ là dạng chuỗi 'string', ta phải tự convert lại thành boolean cho chuẩn DB
      is_blind_box:   is_blind_box   === 'true' || is_blind_box   === true || is_blind_box   === '1',
      is_featured:    is_featured    === 'true' || is_featured    === true || is_featured    === '1',
      is_best_seller: is_best_seller === 'true' || is_best_seller === true || is_best_seller === '1',
      sort_order: Number(sort_order) || 0,
      images, // Mảng ảnh gắn kèm sản phẩm
    });

    await product.save();
    
    
    res.status(201).json({ success: true, product });
  } catch (err) { 
    next(err); 
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.price) updates.price = Number(updates.price);
    if (updates.compare_price) updates.compare_price = Number(updates.compare_price);
    if (updates.stock_qty !== undefined) updates.stock_qty = Number(updates.stock_qty);
    ['is_blind_box', 'is_featured', 'is_best_seller'].forEach(key => {
      if (updates[key] !== undefined)
        updates[key] = updates[key] === 'true' || updates[key] === true || updates[key] === '1';
    });

    // Add new images if uploaded
    if (req.files?.length > 0) {
      const prod = await Product.findById(id);
      const currentCount = prod.images?.length || 0;
      const newImages = req.files.map((file, i) => ({
        image_url:  `/uploads/products/${file.filename}`,
        alt_text:   updates.name || prod.name,
        sort_order: currentCount + i,
        is_primary: currentCount === 0 && i === 0,
      }));
      updates.$push = { images: { $each: newImages } };
    }

    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
};
