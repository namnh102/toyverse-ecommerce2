// Import Review Model để thao tác với bảng đánh giá trong Database
const Review = require('../models/reviewModel');
// Import Order Model để kiểm tra xem user đã mua hàng chưa (Verified Purchase)
const Order  = require('../models/orderModel');

// 1. LẤY DANH SÁCH ĐÁNH GIÁ CỦA MỘT SẢN PHẨM (Public - Ai cũng xem được)
exports.getByProduct = async (req, res, next) => {
  try {
    // Gọi hàm từ Review Model, truyền vào ID sản phẩm và các query (ví dụ: page, limit)
    const result = await Review.getByProduct(req.params.productId, req.query);
    // Trả về danh sách đánh giá kèm theo thông tin phân trang
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// 2. TẠO ĐÁNH GIÁ MỚI (Chỉ dành cho User đã đăng nhập)
exports.create = async (req, res, next) => {
  try {
    // 2.1. Lấy dữ liệu đánh giá từ Frontend gửi lên (số sao, tiêu đề, nội dung)
    const { rating, title, body } = req.body;
    const productId = req.params.productId;

    // 2.2. Kiểm tra xem User này đã từng đánh giá sản phẩm này chưa
    // Mỗi user chỉ được đánh giá 1 sản phẩm 1 lần để chống spam
    const existing = await Review.findOne({ product_id: productId, user_id: req.user.id });
    if (existing) return res.status(409).json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi' });

    // 2.3. Kiểm tra xem User đã THỰC SỰ MUA SẢN PHẨM này chưa (Verified Purchase)
    // Tìm kiếm trong bảng Order xem có đơn hàng nào của user này, trạng thái 'completed', và chứa productId này không
    const hasPurchased = await Order.findOne({
      user_id: req.user.id,
      status: 'completed',
      'items.product_id': productId,
    });

    // 2.4. Khởi tạo đối tượng Review mới
    const review = new Review({
      product_id:           productId,
      user_id:              req.user.id, // Lấy từ token đăng nhập
      rating:               Number(rating), // Ép kiểu số cho số sao
      title,
      body,
      is_verified_purchase: !!hasPurchased, // Nếu có đơn hàng -> true (Đã mua hàng)
    });
    
    // 2.5. Lưu đánh giá vào Database
    await review.save();

    // 2.6. Cập nhật lại ĐIỂM ĐÁNH GIÁ TRUNG BÌNH (avg_rating) và SỐ LƯỢNG ĐÁNH GIÁ (review_count) cho Sản phẩm
    await Review.updateProductRating(productId);

    // 2.7. Trả về kết quả thành công cho Frontend
    res.status(201).json({ success: true, review });
  } catch (err) { next(err); }
};

// 3. XÓA ĐÁNH GIÁ (Dành cho chủ sở hữu đánh giá hoặc Admin)
exports.delete = async (req, res, next) => {
  try {
    // 3.1. Tìm đánh giá theo ID
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });

    // 3.2. Phân quyền: Chỉ cho phép người viết đánh giá đó HOẶC Admin mới có quyền xóa
    if (req.user.role !== 'admin' && review.user_id.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa đánh giá này' });

    const productId = review.product_id;
    
    // 3.3. Xóa đánh giá khỏi Database
    await review.deleteOne();
    
    // 3.4. Tính toán lại điểm trung bình của sản phẩm sau khi xóa đánh giá
    await Review.updateProductRating(productId);

    res.json({ success: true, message: 'Đã xóa đánh giá thành công' });
  } catch (err) { next(err); }
};
