import { Link } from 'react-router-dom'
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag } from 'react-icons/fi'
import { useCartStore } from '../store/cartStore'
import { formatPrice } from '../utils/format'
import styles from './CartPage.module.css'

const SHIPPING_THRESHOLD = 500000
const SHIPPING_FEE = 30000

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCartStore()
  const shippingFee = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total = subtotal + shippingFee

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🛍️</div>
        <h2 className={styles.emptyTitle}>Giỏ hàng của bạn đang trống</h2>
        <p className={styles.emptyText}>Khám phá các sản phẩm tuyệt vời và bắt đầu bộ sưu tập ngay!</p>
        <Link to="/shop" className="btn btn-primary btn-lg" id="empty-cart-shop">
          <FiShoppingBag size={18} /> Khám phá Cửa hàng
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Giỏ hàng</h1>

        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.items}>
            {items.map(item => (
              <div key={item.product_id} className={styles.item}>
                <div className={styles.itemImage}>
                  {item.image ? <img src={item.image} alt={item.name} /> : <span>🎁</span>}
                </div>
                <div className={styles.itemInfo}>
                  <Link to={`/products/${item.slug}`} className={styles.itemName}>{item.name}</Link>
                  <p className={styles.itemPrice}>{formatPrice(item.price)} mỗi cái</p>
                </div>
                <div className={styles.itemQty}>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className={styles.qtyBtn}
                    aria-label="Decrease"
                  >
                    <FiMinus size={12} />
                  </button>
                  <span className={styles.qtyVal}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className={styles.qtyBtn}
                    aria-label="Increase"
                  >
                    <FiPlus size={12} />
                  </button>
                </div>
                <span className={styles.itemSubtotal}>{formatPrice(item.price * item.quantity)}</span>
                <button
                  onClick={() => removeItem(item.product_id)}
                  className={styles.removeBtn}
                  aria-label="Remove"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Tóm tắt đơn hàng</h2>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Tổng phụ</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Vận chuyển</span>
                <span className={shippingFee === 0 ? styles.freeShip : ''}>
                  {shippingFee === 0 ? '🎉 MIỄN PHÍ' : formatPrice(shippingFee)}
                </span>
              </div>
              {shippingFee > 0 && (
                <p className={styles.shippingNote}>
                  Mua thêm {formatPrice(SHIPPING_THRESHOLD - subtotal)} để được miễn phí giao hàng!
                </p>
              )}
            </div>
            <div className={styles.total}>
              <span>Tổng cộng</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-full btn-lg" id="cart-proceed-checkout">
              Tiến hành thanh toán <FiArrowRight size={18} />
            </Link>
            <Link to="/shop" className="btn btn-outline btn-full" id="cart-continue-shopping">
              Tiếp tục mua hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
