import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiLock, FiCheck } from 'react-icons/fi'
import { orderService } from '../services/api'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { formatPrice } from '../utils/format'
import toast from 'react-hot-toast'
import styles from './CheckoutPage.module.css'

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Thanh toán khi nhận hàng', icon: '💵', desc: 'Thanh toán bằng tiền mặt khi nhận hàng' },
  { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng', icon: '🏦', desc: 'Chuyển khoản vào tài khoản của chúng tôi' },
  { value: 'e_wallet', label: 'Ví điện tử (MoMo, ZaloPay)', icon: '📱', desc: 'Thanh toán nhanh chóng, an toàn' },
]

const SHIPPING_FEE = 30000
const FREE_SHIP_THRESHOLD = 500000

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { items, subtotal, clearCart } = useCartStore()
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [form, setForm] = useState({
    shipping_full_name: user?.full_name || '',
    shipping_phone: user?.phone || '',
    shipping_address: '',
    shipping_city: '',
    shipping_province: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})

  const shippingFee = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE
  const total = subtotal + shippingFee

  const validate = () => {
    const errs = {}
    if (!form.shipping_full_name.trim()) errs.shipping_full_name = 'Vui lòng nhập họ tên'
    if (!form.shipping_phone.trim()) errs.shipping_phone = 'Vui lòng nhập số điện thoại'
    if (!form.shipping_address.trim()) errs.shipping_address = 'Vui lòng nhập địa chỉ'
    if (!form.shipping_city.trim()) errs.shipping_city = 'Vui lòng nhập tỉnh/thành phố'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    if (items.length === 0) { toast.error('Giỏ hàng của bạn đang trống'); return }

    setSubmitting(true)
    try {
      const { data } = await orderService.create({ ...form, payment_method: paymentMethod })
      clearCart()
      toast.success('Đặt hàng thành công! 🎉')
      navigate(`/orders/${data.order.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt hàng thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Thanh toán</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.layout}>
            {/* Left: Form */}
            <div className={styles.formSection}>
              {/* Shipping Info */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>📦 Thông tin giao hàng</h2>
                <div className={styles.formGrid}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="shipping_full_name">Họ và tên *</label>
                    <input id="shipping_full_name" name="shipping_full_name" type="text" className={`form-input ${errors.shipping_full_name ? styles.inputError : ''}`} value={form.shipping_full_name} onChange={handleChange} placeholder="Nguyen Van A" />
                    {errors.shipping_full_name && <span className="form-error">{errors.shipping_full_name}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="shipping_phone">Số điện thoại *</label>
                    <input id="shipping_phone" name="shipping_phone" type="tel" className={`form-input ${errors.shipping_phone ? styles.inputError : ''}`} value={form.shipping_phone} onChange={handleChange} placeholder="0901234567" />
                    {errors.shipping_phone && <span className="form-error">{errors.shipping_phone}</span>}
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label" htmlFor="shipping_address">Địa chỉ đường *</label>
                    <input id="shipping_address" name="shipping_address" type="text" className={`form-input ${errors.shipping_address ? styles.inputError : ''}`} value={form.shipping_address} onChange={handleChange} placeholder="123 Nguyễn Trãi, Phường 1" />
                    {errors.shipping_address && <span className="form-error">{errors.shipping_address}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="shipping_city">Tỉnh / Thành phố *</label>
                    <input id="shipping_city" name="shipping_city" type="text" className={`form-input ${errors.shipping_city ? styles.inputError : ''}`} value={form.shipping_city} onChange={handleChange} placeholder="TP Hồ Chí Minh" />
                    {errors.shipping_city && <span className="form-error">{errors.shipping_city}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="shipping_province">Quận / Huyện</label>
                    <input id="shipping_province" name="shipping_province" type="text" className="form-input" value={form.shipping_province} onChange={handleChange} placeholder="Tùy chọn" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label" htmlFor="order_notes">Ghi chú đơn hàng (Tùy chọn)</label>
                    <textarea id="order_notes" name="notes" className="form-input" value={form.notes} onChange={handleChange} rows={3} placeholder="Hướng dẫn giao hàng, thời gian nhận hàng..." style={{ resize: 'vertical', minHeight: 80 }} />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>💳 Phương thức thanh toán</h2>
                <div className={styles.paymentOptions}>
                  {PAYMENT_METHODS.map(pm => (
                    <label
                      key={pm.value}
                      className={`${styles.paymentOption} ${paymentMethod === pm.value ? styles.paymentOptionActive : ''}`}
                      htmlFor={`payment-${pm.value}`}
                    >
                      <input
                        id={`payment-${pm.value}`}
                        type="radio"
                        name="payment_method"
                        value={pm.value}
                        checked={paymentMethod === pm.value}
                        onChange={() => setPaymentMethod(pm.value)}
                        className={styles.paymentRadio}
                      />
                      <span className={styles.paymentIcon}>{pm.icon}</span>
                      <div>
                        <p className={styles.paymentLabel}>{pm.label}</p>
                        <p className={styles.paymentDesc}>{pm.desc}</p>
                      </div>
                      {paymentMethod === pm.value && (
                        <span className={styles.paymentCheck}><FiCheck size={14} /></span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className={styles.summarySection}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>🛍️ Tóm tắt đơn hàng</h2>
                <div className={styles.orderItems}>
                  {items.map(item => (
                    <div key={item.product_id} className={styles.orderItem}>
                      <div className={styles.orderItemImg}>
                        {item.image ? <img src={item.image} alt={item.name} /> : <span>🎁</span>}
                        <span className={styles.orderItemQtyBadge}>{item.quantity}</span>
                      </div>
                      <div className={styles.orderItemInfo}>
                        <p className={styles.orderItemName}>{item.name}</p>
                        <p className={styles.orderItemPrice}>{formatPrice(item.price)}</p>
                      </div>
                      <span className={styles.orderItemSubtotal}>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.summaryRows}>
                  <div className={styles.summaryRow}><span>Tổng phụ</span><span>{formatPrice(subtotal)}</span></div>
                  <div className={styles.summaryRow}><span>Vận chuyển</span><span className={shippingFee === 0 ? styles.free : ''}>{shippingFee === 0 ? 'MIỄN PHÍ 🎉' : formatPrice(shippingFee)}</span></div>
                </div>
                <div className={styles.totalRow}><span>Tổng cộng</span><span className={styles.totalAmt}>{formatPrice(total)}</span></div>
                <div className={styles.secureNotice}><FiLock size={14} /> Thanh toán an toàn — Dữ liệu của bạn được bảo vệ</div>
                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-xl"
                  disabled={submitting}
                  id="place-order"
                >
                  {submitting ? 'Đang đặt hàng...' : `Đặt hàng ngay — ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
