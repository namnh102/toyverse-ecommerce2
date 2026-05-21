import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiUser, FiShoppingBag, FiLock, FiLogOut, FiEdit2, FiChevronRight } from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'
import { orderService } from '../services/api'
import api from '../services/api'
import { formatPrice, formatDate, ORDER_STATUS_MAP } from '../utils/format'
import toast from 'react-hot-toast'
import styles from './AccountPage.module.css'

const TABS = [
  { key: 'profile', label: 'Hồ sơ', icon: <FiUser size={16} /> },
  { key: 'orders',  label: 'Đơn hàng của tôi', icon: <FiShoppingBag size={16} /> },
  { key: 'password',label: 'Mật khẩu', icon: <FiLock size={16} /> },
]

export default function AccountPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'profile'
  const setTab = (t) => setSearchParams({ tab: t })

  const { user, logout, refreshUser } = useAuthStore()

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>{user?.full_name?.[0]?.toUpperCase()}</div>
              <div>
                <p className={styles.userName}>{user?.full_name}</p>
                <p className={styles.userEmail}>{user?.email}</p>
              </div>
            </div>
            <nav className={styles.nav}>
              {TABS.map(t => (
                <button
                  key={t.key}
                  className={`${styles.navItem} ${activeTab === t.key ? styles.navItemActive : ''}`}
                  onClick={() => setTab(t.key)}
                  id={`account-tab-${t.key}`}
                >
                  {t.icon} {t.label}
                  <FiChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                </button>
              ))}
              <hr className={styles.navDivider} />
              {user?.role === 'admin' && (
                <Link to="/admin" className={styles.navItem} id="account-admin">
                  🔧 Quản trị hệ thống <FiChevronRight size={14} style={{ marginLeft: 'auto' }} />
                </Link>
              )}
              <button className={`${styles.navItem} ${styles.logoutBtn}`} onClick={logout} id="account-logout">
                <FiLogOut size={16} /> Đăng xuất
              </button>
            </nav>
          </aside>

          {/* Content */}
          <main className={styles.main}>
            {activeTab === 'profile' && <ProfileTab user={user} refreshUser={refreshUser} />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'password' && <PasswordTab />}
          </main>
        </div>
      </div>
    </div>
  )
}

function ProfileTab({ user, refreshUser }) {
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/auth/me', form)
      await refreshUser()
      toast.success('Hồ sơ đã được cập nhật!')
    } catch {
      toast.error('Cập nhật thất bại')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.tabContent}>
      <h2 className={styles.tabTitle}>Thông tin hồ sơ</h2>
      <form onSubmit={handleSave} className={styles.profileForm}>
        <div className={styles.formRow}>
          <div className="form-group">
            <label className="form-label" htmlFor="profile_name">Họ và tên</label>
            <input id="profile_name" className="form-input" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="profile_phone">Số điện thoại</label>
            <input id="profile_phone" className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0901234567" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Không thể thay đổi email</span>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving} id="profile-save">
          <FiEdit2 size={14} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  )
}

function OrdersTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderService.getMyOrders().then(r => r.data),
  })

  if (isLoading) return (
    <div className={styles.tabContent}>
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-xl)', marginBottom: 12 }} />)}
    </div>
  )

  return (
    <div className={styles.tabContent}>
      <h2 className={styles.tabTitle}>Đơn hàng của tôi</h2>
      {!data?.rows?.length ? (
        <div className={styles.emptyOrders}>
          <span style={{ fontSize: '3rem' }}>📦</span>
          <p>Chưa có đơn hàng nào. Hãy bắt đầu mua sắm!</p>
          <Link to="/shop" className="btn btn-primary">Khám phá Cửa hàng</Link>
        </div>
      ) : (
        <div className={styles.orderList}>
          {data.rows.map(order => {
            const statusInfo = ORDER_STATUS_MAP[order.status] || { label: order.status, color: '#ccc' }
            return (
              <Link key={order.id} to={`/orders/${order.id}`} className={styles.orderCard} id={`order-${order.id}`}>
                <div className={styles.orderLeft}>
                  <p className={styles.orderNumber}>#{order.order_number}</p>
                  <p className={styles.orderDate}>{formatDate(order.created_at)}</p>
                  <p className={styles.orderItems}>{order.item_count} sản phẩm</p>
                </div>
                <div className={styles.orderRight}>
                  <span className={styles.orderStatusBadge} style={{ background: statusInfo.color + '22', color: statusInfo.color }}>
                    {statusInfo.label}
                  </span>
                  <p className={styles.orderTotal}>{formatPrice(order.total)}</p>
                  <FiChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PasswordTab() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.new_password !== form.confirm) { setError('Mật khẩu mới không khớp'); return }
    if (form.new_password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return }
    setSaving(true)
    try {
      await api.put('/auth/me/password', { current_password: form.current_password, new_password: form.new_password })
      toast.success('Đã cập nhật mật khẩu!')
      setForm({ current_password: '', new_password: '', confirm: '' })
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật mật khẩu thất bại')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.tabContent}>
      <h2 className={styles.tabTitle}>Đổi mật khẩu</h2>
      <form onSubmit={handleSubmit} className={styles.pwForm}>
        <div className="form-group">
          <label className="form-label" htmlFor="current_pw">Mật khẩu hiện tại</label>
          <input id="current_pw" type="password" className="form-input" value={form.current_password} onChange={e => setForm(f => ({ ...f, current_password: e.target.value }))} placeholder="••••••••" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="new_pw">Mật khẩu mới</label>
          <input id="new_pw" type="password" className="form-input" value={form.new_password} onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))} placeholder="Ít nhất 6 ký tự" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="confirm_pw">Xác nhận mật khẩu mới</label>
          <input id="confirm_pw" type="password" className="form-input" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} placeholder="••••••••" />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={saving} id="change-password-save">
          <FiLock size={14} /> {saving ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
        </button>
      </form>
    </div>
  )
}
