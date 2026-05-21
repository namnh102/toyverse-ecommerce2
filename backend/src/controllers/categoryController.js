
const Category = require('../models/categoryModel');
const slugify  = require('slugify');

exports.getAll = async (req, res, next) => {
  try {
   
    const result = await Category.getAll({ active: req.query.active });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// 2. LẤY CHI TIẾT 1 DANH MỤC
exports.getOne = async (req, res, next) => {
  try {
    // Tìm danh mục theo Slug (đường dẫn web) HOẶC theo ID
    const cat = await Category.findOne({
      $or: [{ slug: req.params.id }, ...(require('mongoose').Types.ObjectId.isValid(req.params.id) ? [{ _id: req.params.id }] : [])]
    }).lean();
    if (!cat) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    res.json({ success: true, category: { ...cat, id: cat._id } });
  } catch (err) { next(err); }
};

// 3. TẠO DANH MỤC MỚI (Luồng Admin)
exports.create = async (req, res, next) => {
  try {
    // 3.1. Lấy dữ liệu dạng text từ FormData do Frontend gửi lên
    const { name, description, sort_order, is_active, meta_title } = req.body;
    
    // 3.2. Nếu Frontend không truyền slug lên, Backend tự động tạo bằng thư viện slugify
    const slug = req.body.slug || slugify(name, { lower: true, strict: true });
    
    // 3.3. Đóng gói dữ liệu để chuẩn bị lưu
    const cat  = new Category({
      name, slug, description,
      sort_order: Number(sort_order) || 0, // Thứ tự sắp xếp hiển thị
      is_active: is_active !== '0' && is_active !== false, // Ép kiểu về boolean (true/false)
      meta_title,
      // 3.4. Nếu có file đính kèm (middleware upload đã bắt được), lưu đường dẫn ảnh
      image_url: req.file ? `/uploads/categories/${req.file.filename}` : null,
    });
    
    // 3.5. Lưu vào Database và trả dữ liệu về Frontend
    await cat.save();
    res.status(201).json({ success: true, category: { ...cat.toObject(), id: cat._id } });
  } catch (err) { next(err); }
};

// 4. CẬP NHẬT DANH MỤC (Luồng Admin)
exports.update = async (req, res, next) => {
  try {
    // 4.1. Lấy tất cả dữ liệu gửi lên
    const updates = { ...req.body };
    
    // 4.2. Chuẩn hóa lại các kiểu dữ liệu (chuyển string thành number/boolean)
    if (updates.sort_order) updates.sort_order = Number(updates.sort_order);
    if (updates.is_active !== undefined)
      updates.is_active = updates.is_active !== '0' && updates.is_active !== false;
      
    // 4.3. Nếu Admin có upload ảnh MỚI thì cập nhật lại đường dẫn ảnh mới
    if (req.file) updates.image_url = `/uploads/categories/${req.file.filename}`;

    // 4.4. Cập nhật thẳng vào Database
    const cat = await Category.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!cat) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    
    res.json({ success: true, category: { ...cat.toObject(), id: cat._id } });
  } catch (err) { next(err); }
};

// 5. XÓA DANH MỤC (Luồng Admin)
exports.delete = async (req, res, next) => {
  try {
    // Tìm danh mục theo ID và Xóa trực tiếp khỏi DB
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    res.json({ success: true, message: 'Đã xóa danh mục thành công' });
  } catch (err) { next(err); }
};
