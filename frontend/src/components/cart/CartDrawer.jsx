import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiX, FiShoppingBag, FiTrash2, FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi'
import { useCartStore } from '../../store/cartStore'
import { formatPrice } from '../../utils/format'
import styles from './CartDrawer.module.css'

const SHIPPING_THRESHOLD = 500000

export default function CartDrawer() {
  const { items, subtotal, isOpen, closeCart, updateQuantity, removeItem } = useCartStore()
  const drawerRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeCart() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Trap body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const shippingGap = SHIPPING_THRESHOLD - subtotal
  const progress = Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100)

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
        aria-label="Shopping cart"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <FiShoppingBag size={20} />
            <h2 className={styles.title}>Giỏ hàng của bạn</h2>
            {items.length > 0 && (
              <span className={styles.count}>{items.reduce((s, i) => s + i.quantity, 0)}</span>
            )}
          </div>
          <button className={styles.closeBtn} onClick={closeCart} aria-label="Close cart" id="cart-close">
            <FiX size={20} />
          </button>
        </div>

        {/* Free shipping progress */}
        {subtotal > 0 && (
          <div className={styles.shippingBanner}>
            {shippingGap > 0 ? (
              <p>Mua thêm <strong>{formatPrice(shippingGap)}</strong> để được miễn phí giao hàng! 🚚</p>
            ) : (
              <p>🎉 Bạn được <strong>miễn phí giao hàng!</strong></p>
            )}
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Items */}
        <div className={styles.items}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🎁</div>
              <p className={styles.emptyTitle}>Giỏ hàng của bạn đang trống</p>
              <p className={styles.emptyText}>Khám phá những mẫu mới nhất và bắt đầu sưu tầm!</p>
              <Link to="/shop" className="btn btn-primary" onClick={closeCart}>
                Khám phá Cửa hàng
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product_id} className={styles.item}>
                <div className={styles.itemImage}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <span>🎁</span>
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <Link
                    to={`/products/${item.slug}`}
                    className={styles.itemName}
                    onClick={closeCart}
                  >
                    {item.name}
                  </Link>
                  <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                  <div className={styles.itemControls}>
                    <div className={styles.qty}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <FiMinus size={12} />
                      </button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeItem(item.product_id)}
                      aria-label="Remove item"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className={styles.itemSubtotal}>
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotalRow}>
              <span>Tổng phụ</span>
              <span className={styles.subtotalAmt}>{formatPrice(subtotal)}</span>
            </div>
            <p className={styles.taxNote}>Phí vận chuyển tính khi thanh toán</p>
            <Link
              to="/checkout"
              className={`btn btn-primary btn-full btn-lg ${styles.checkoutBtn}`}
              onClick={closeCart}
              id="cart-checkout"
            >
              Thanh toán <FiArrowRight size={18} />
            </Link>
            <Link to="/cart" className="btn btn-outline btn-full" onClick={closeCart}>
              Xem toàn bộ giỏ hàng
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
