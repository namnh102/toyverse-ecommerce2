import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiCheckCircle, FiPackage, FiArrowRight } from 'react-icons/fi'
import { orderService } from '../services/api'
import { formatPrice, formatDate, ORDER_STATUS_MAP } from '../utils/format'
import styles from './OrderConfirmPage.module.css'

export default function OrderConfirmPage() {
  const { id } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getById(id).then(r => r.data),
  })

  if (isLoading) return (
    <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
      <div className="skeleton" style={{ width: 60, height: 60, borderRadius: '50%', margin: '0 auto 20px' }} />
      <div className="skeleton" style={{ height: 32, width: '40%', margin: '0 auto 12px' }} />
      <div className="skeleton" style={{ height: 16, width: '60%', margin: '0 auto' }} />
    </div>
  )

  if (!data?.order) return (
    <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
      <p>Không tìm thấy đơn hàng.</p>
      <Link to="/account?tab=orders" className="btn btn-primary" style={{ marginTop: 16 }}>Đơn hàng của tôi</Link>
    </div>
  )

  const { order } = data
  const statusInfo = ORDER_STATUS_MAP[order.status] || { label: order.status, color: '#ccc' }

  return (
    <div className={styles.page}>
      <div className={`container ${styles.container}`}>
        {/* Success Header */}
        <div className={styles.header}>
          <div className={styles.successIcon}><FiCheckCircle size={48} /></div>
          <h1 className={styles.title}>Đã xác nhận đơn hàng! 🎉</h1>
          <p className={styles.subtitle}>Cảm ơn bạn đã đặt mua. Chúng tôi sẽ xử lý ngay!</p>
          <div className={styles.orderMeta}>
            <span>Đơn hàng #{order.order_number}</span>
            <span className={styles.dot} />
            <span>{formatDate(order.created_at)}</span>
            <span className={styles.dot} />
            <span style={{ background: statusInfo.color + '22', color: statusInfo.color, padding: '2px 10px', borderRadius: '999px', fontWeight: 600, fontSize: '13px' }}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        <div className={styles.layout}>
          {/* Order Items */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><FiPackage size={18} /> Sản phẩm đã đặt</h2>
            <div className={styles.items}>
              {order.items?.map(item => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemImg}>
                    {item.product_image ? <img src={item.product_image} alt={item.product_name} /> : <span>🎁</span>}
                  </div>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.product_name}</p>
                    <p className={styles.itemQty}>SL: {item.quantity}</p>
                  </div>
                  <span className={styles.itemSubtotal}>{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className={styles.totals}>
              <div className={styles.totalRow}><span>Tổng phụ</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className={styles.totalRow}><span>Vận chuyển</span><span>{order.shipping_fee === 0 ? 'MIỄN PHÍ' : formatPrice(order.shipping_fee)}</span></div>
              <div className={`${styles.totalRow} ${styles.grand}`}><span>Tổng cộng</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>

          {/* Shipping Info */}
          <div>
            <div className={styles.card} style={{ marginBottom: 16 }}>
              <h2 className={styles.cardTitle}>📦 Giao hàng đến</h2>
              <p className={styles.shippingName}>{order.shipping_full_name}</p>
              <p className={styles.shippingAddr}>{order.shipping_address}</p>
              <p className={styles.shippingAddr}>{order.shipping_city}{order.shipping_province ? `, ${order.shipping_province}` : ''}</p>
              <p className={styles.shippingAddr}>{order.shipping_phone}</p>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>💳 Thanh toán</h2>
              <p>{order.payment_method === 'cod' ? '💵 Thanh toán khi nhận hàng' : order.payment_method === 'bank_transfer' ? '🏦 Chuyển khoản ngân hàng' : '📱 Ví điện tử'}</p>
              <p className={styles.paymentStatus} style={{ color: order.payment_status === 'paid' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {order.payment_status === 'paid' ? '✓ Đã thanh toán' : '⏳ Chờ thanh toán'}
              </p>
            </div>

            <div className={styles.actions}>
              <Link to="/account?tab=orders" className="btn btn-primary btn-full" id="view-orders">
                Xem tất cả đơn hàng <FiArrowRight size={16} />
              </Link>
              <Link to="/shop" className="btn btn-outline btn-full" id="continue-shopping">
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
