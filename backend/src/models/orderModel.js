// Thư viện Mongoose dùng để tương tác với MongoDB
const mongoose = require('mongoose');

// 1. ĐỊNH NGHĨA KHUNG DỮ LIỆU CHO "TỪNG MÓN HÀNG" BÊN TRONG ĐƠN HÀNG (Sub-schema)
const orderItemSchema = new mongoose.Schema({
  product_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Mã sản phẩm thật trong DB
  product_name:  { type: String, required: true }, // Tên lúc mua (Lưu cứng lại đề phòng sau này đổi tên SP gốc thì tên trong đơn cũ không bị đổi)
  product_image: { type: String, default: null }, // Ảnh sản phẩm lúc mua
  price:         { type: Number, required: true }, // Giá lúc mua (Quan trọng: Đóng băng giá, sau này SP tăng giá thì hóa đơn cũ vẫn đúng)
  quantity:      { type: Number, required: true, min: 1 }, // Số lượng mua
  subtotal:      { type: Number, required: true }, // Thành tiền của món này (giá x số lượng)
}, { _id: true });

// 2. ĐỊNH NGHĨA KHUNG DỮ LIỆU CHO "TOÀN BỘ ĐƠN HÀNG" (Main Schema)
const orderSchema = new mongoose.Schema({
  order_number:      { type: String, unique: true }, // Mã hóa đơn đẹp cho khách dễ nhìn (VD: TV123456)
  user_id:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ID của khách đặt hàng
  
  // Thông tin giao hàng (Lưu cứng vào lúc đặt, đề phòng khách đổi địa chỉ trong profile thì đơn hàng cũ vẫn giao đúng chỗ)
  shipping_full_name:{ type: String, required: true },
  shipping_phone:    { type: String, required: true },
  shipping_address:  { type: String, required: true },
  shipping_city:     { type: String, required: true },
  shipping_province: { type: String, default: '' },
  shipping_country:  { type: String, default: 'Vietnam' },

  items:         { type: [orderItemSchema], default: [] }, // Danh sách các món hàng (Nhúng sub-schema ở trên vào đây)
  
  subtotal:      { type: Number, required: true }, // Tổng tiền hàng
  shipping_fee:  { type: Number, default: 0 }, // Phí giao hàng
  discount_amount:{ type: Number, default: 0 }, // Tiền giảm giá
  total:         { type: Number, required: true }, // TỔNG TIỀN CUỐI CÙNG KHÁCH PHẢI TRẢ

  // Các trạng thái
  payment_method:{ type: String, enum: ['cod', 'bank_transfer', 'credit_card', 'e_wallet'], default: 'cod' }, // Phương thức thanh toán (COD, chuyển khoản...)
  payment_status:{ type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' }, // Tình trạng thanh toán (Chưa trả, Đã trả)
  status:        { type: String, enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'], default: 'pending' }, // Trạng thái giao hàng
  notes:         { type: String, default: '' }, // Ghi chú của khách
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// 3. MIDDLEWARE TỰ ĐỘNG TẠO MÃ ĐƠN HÀNG TRƯỚC KHI LƯU (PRE-SAVE)
// Tránh việc đưa thẳng ObjectId loằng ngoằng cho khách hàng
orderSchema.pre('save', async function(next) {
  if (!this.order_number) {
    const ts   = Date.now().toString().slice(-6); // Cắt 6 số cuối của timestamp
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // Random 3 số
    this.order_number = `TV${ts}${rand}`; // Ghép lại thành mã kiểu "TV123456789"
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

// ─── Static helpers ────────────────────────────────────────────────────────────

Order.getByUser = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    Order.find({ user_id: userId })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments({ user_id: userId }),
  ]);
  return {
    rows: rows.map(o => ({ ...o, id: o._id, item_count: o.items?.length || 0 })),
    total,
    totalPages: Math.ceil(total / limit),
  };
};

Order.getAll = async ({ page = 1, limit = 20, q = '', status = '' } = {}) => {
  const skip  = (page - 1) * limit;
  const query = {};
  if (status) query.status = status;
  if (q) query.$or = [
    { order_number: new RegExp(q, 'i') },
    { shipping_full_name: new RegExp(q, 'i') },
  ];

  const [rows, total] = await Promise.all([
    Order.find(query)
      .populate('user_id', 'full_name email')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(query),
  ]);

  return {
    rows: rows.map(o => ({
      ...o, id: o._id,
      user_name:  o.user_id?.full_name || '',
      user_email: o.user_id?.email || '',
      item_count: o.items?.length || 0,
    })),
    total, totalPages: Math.ceil(total / limit),
  };
};

module.exports = Order;
