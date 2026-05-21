// Import các Model liên quan
const Order   = require('../models/orderModel');
const CartItem = require('../models/cartModel');
const Product  = require('../models/productModel');

const SHIPPING_FEE         = 30000; // Phí ship mặc định 30k
const FREE_SHIPPING_THRESHOLD = 500000; // Đơn hàng trên 500k sẽ được freeship

// 1. TẠO ĐƠN HÀNG MỚI (User Checkout)
exports.create = async (req, res, next) => {
  try {
    // 1.1. Lấy thông tin giao hàng người dùng điền vào Form Checkout
    const {
      shipping_full_name, shipping_phone, shipping_address,
      shipping_city, shipping_province, notes, payment_method
    } = req.body;

    // 1.2. Lấy toàn bộ sản phẩm đang có trong Giỏ Hàng của người dùng
    const cart = await CartItem.getCartByUser(req.user.id);
    if (!cart.items.length)
      return res.status(400).json({ success: false, message: 'Giỏ hàng đang trống' });

    // 1.3. Tính toán tổng tiền: Tiền hàng + Phí Ship
    const subtotal    = cart.subtotal;
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total       = subtotal + shippingFee;

    // 1.4. Duyệt qua từng món hàng để kiểm tra Tồn Kho (Stock) và tạo Order Item
    const orderItems = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product_id);
      
      // Nếu sản phẩm không còn đủ số lượng
      if (!product || product.stock_qty < item.quantity)
        return res.status(400).json({ success: false, message: `Sản phẩm "${item.name}" không đủ số lượng tồn kho` });

      // Lưu lại thông tin sản phẩm vào đơn hàng (đề phòng sau này giá sản phẩm đổi, đơn hàng cũ vẫn giữ giá cũ)
      orderItems.push({
        product_id:    item.product_id,
        product_name:  item.name,
        product_image: item.image,
        price:         item.price,
        quantity:      item.quantity,
        subtotal:      item.price * item.quantity,
      });

      // 1.5. Trừ đi số lượng Tồn Kho và Tăng tổng số Lượt Bán (total_sold) cho Sản phẩm
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { stock_qty: -item.quantity, total_sold: item.quantity }
      });
    }

    // 1.6. Tạo object Đơn Hàng mới
    const order = new Order({
      user_id:           req.user.id,
      shipping_full_name, shipping_phone,
      shipping_address, shipping_city,
      shipping_province: shipping_province || '',
      items:             orderItems, // Các món hàng
      subtotal, shipping_fee: shippingFee, total, // Tổng tiền
      payment_method:    payment_method || 'cod', // COD là thanh toán khi nhận hàng
      notes:             notes || '',
    });
    
    // 1.7. Lưu đơn hàng vào DB
    await order.save();

    // 1.8. XÓA SẠCH Giỏ Hàng của user sau khi đặt hàng thành công
    await CartItem.deleteMany({ user_id: req.user.id });

    res.status(201).json({ success: true, order });
  } catch (err) { next(err); }
};

// 2. LẤY DANH SÁCH ĐƠN HÀNG CỦA MỘT USER (Lịch sử mua hàng)
exports.getMyOrders = async (req, res, next) => {
  try {
    const result = await Order.getByUser(req.user.id, req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// 3. LẤY CHI TIẾT ĐƠN HÀNG
exports.getById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    // Phân quyền: Chỉ cho phép Admin HOẶC Chủ nhân của đơn hàng mới được xem chi tiết
    if (req.user.role !== 'admin' && order.user_id.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem đơn hàng này' });

    res.json({ success: true, order: { ...order, id: order._id } });
  } catch (err) { next(err); }
};

// 4. LẤY TẤT CẢ ĐƠN HÀNG CHO ADMIN (Trang Quản lý Đơn hàng)
exports.getAll = async (req, res, next) => {
  try {
    const result = await Order.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// 5. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (Luồng Admin: Đổi từ Đang xử lý -> Đang giao -> Đã giao)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, payment_status } = req.body; // Frontend gửi lên trạng thái mới
    
    const updates = {};
    if (status) updates.status = status; // Trạng thái giao hàng
    if (payment_status) updates.payment_status = payment_status; // Trạng thái thanh toán (chưa thanh toán / đã thanh toán)

    // Tìm đơn theo ID và cập nhật trực tiếp vào Database
    const order = await Order.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    
    // Trả về dữ liệu để Frontend cập nhật bảng Đơn hàng
    res.json({ success: true, order });
  } catch (err) { next(err); }
};
