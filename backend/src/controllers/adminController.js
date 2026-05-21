// Import các Model để thống kê dữ liệu tổng hợp
const Product  = require('../models/productModel');
const Order    = require('../models/orderModel');
const User     = require('../models/userModel');
const Banner   = require('../models/bannerModel');

// 1. API LẤY DỮ LIỆU THỐNG KÊ CHO TRANG DASHBOARD ADMIN
exports.getStats = async (req, res, next) => {
  try {
    // 1.1. Chạy nhiều truy vấn (query) cùng lúc song song (Promise.all) để tối ưu tốc độ phản hồi
    const [total_products, total_orders, total_users, revenueAgg] = await Promise.all([
      Product.countDocuments({ is_active: true }), // Đếm số sản phẩm đang hoạt động
      Order.countDocuments(), // Đếm tổng số đơn hàng
      User.countDocuments({ role: 'user' }), // Đếm số khách hàng (bỏ qua admin)
      
      // 1.2. Aggregate để tính TỔNG DOANH THU: Cộng tất cả trường 'total' của các đơn KHÔNG bị hủy
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } }, // Bỏ qua đơn bị hủy
        { $group: { _id: null, total: { $sum: '$total' } } } // Tính tổng
      ]),
    ]);

    const total_revenue = revenueAgg[0]?.total || 0;

    // 1.3. Lấy danh sách 8 ĐƠN HÀNG GẦN NHẤT
    const recent_orders = await Order.find()
      .populate('user_id', 'full_name') // Join bảng User để lấy Tên khách hàng
      .sort({ created_at: -1 }) // Sắp xếp giảm dần theo thời gian (mới nhất lên đầu)
      .limit(8)
      .lean()
      .then(arr => arr.map(o => ({
        ...o, id: o._id,
        user_name: o.user_id?.full_name || 'Khách vãng lai',
      })));

    // 1.4. Lấy danh sách 6 SẢN PHẨM BÁN CHẠY NHẤT (dựa trên trường total_sold)
    const top_products = await Product.getTopSelling(6);

    // 1.5. Thống kê DOANH THU TỪNG THÁNG (Trong vòng 1 năm qua) để vẽ biểu đồ
    const monthly_revenue = await Order.aggregate([
      // Lọc các đơn không bị hủy và được tạo trong vòng 365 ngày qua
      { $match: { status: { $ne: 'cancelled' }, created_at: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
      // Nhóm dữ liệu theo Tháng (vd: '2024-04') và cộng dồn doanh thu
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$created_at' } },
        revenue: { $sum: '$total' }
      }},
      { $sort: { '_id': 1 } }, // Sắp xếp theo thứ tự tháng tăng dần
      { $project: { month: '$_id', revenue: 1, _id: 0 } } // Đổi tên biến cho dễ đọc ở Frontend
    ]);

    // 1.6. Trả toàn bộ dữ liệu tổng hợp về cho Frontend (AdminDashboard.jsx) vẽ giao diện
    res.json({
      success: true,
      stats: { total_products, total_orders, total_users, total_revenue },
      recent_orders,
      top_products,
      monthly_revenue,
    });
  } catch (err) { next(err); }
};

// 2. API QUẢN LÝ BANNER QUẢNG CÁO
exports.manageBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ sort_order: 1 }).lean();
    res.json({ success: true, banners: banners.map(b => ({ ...b, id: b._id })) });
  } catch (err) { next(err); }
};
