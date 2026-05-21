import { useQuery } from '@tanstack/react-query'
import { adminService } from '../../services/api'
import { formatPrice, formatDate, ORDER_STATUS_MAP } from '../../utils/format'
import {
  FiShoppingBag, FiPackage, FiUsers, FiDollarSign,
  FiTrendingUp, FiArrowUp
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import styles from './AdminDashboard.module.css'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'], 
    queryFn: () => adminService.getStats().then(r => r.data), 
    refetchInterval: 60_000, 
  })

 
  const STAT_CARDS = [
    {
      label: 'Tổng doanh thu', 
      value: formatPrice(data?.stats?.total_revenue || 0), 
      icon: <FiDollarSign size={24} />, 
      color: '#A8E6CF', bg: '#D4F5E7', 
      desc: 'Toàn thời gian' 
    },
    {
      label: 'Tổng đơn hàng',
      value: data?.stats?.total_orders?.toLocaleString() || '0',
      icon: <FiShoppingBag size={24} />,
      color: '#F9A8C9', bg: '#FDD5E7',
      desc: 'Tất cả đơn hàng'
    },
    {
      label: 'Sản phẩm',
      value: data?.stats?.total_products?.toLocaleString() || '0', 
      icon: <FiPackage size={24} />,
      color: '#C9B8FF', bg: '#E4DBFF',
      desc: 'Sản phẩm đang bán'
    },
    {
      label: 'Khách hàng',
      value: data?.stats?.total_users?.toLocaleString() || '0', 
      icon: <FiUsers size={24} />,
      color: '#B8D4FF', bg: '#DCE9FF',
      desc: 'Người dùng đã đăng ký'
    },
  ]


  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Bảng điều khiển</h1>
        <p className={styles.pageSubtitle}>Chào mừng trở lại! Dưới đây là những gì đang diễn ra với ToyVerse.</p>
      </div>

      <div className={styles.statsGrid}>
        {STAT_CARDS.map((stat, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>{stat.label}</p>
              <p className={styles.statValue}>
                {isLoading ? <span className="skeleton" style={{ display: 'inline-block', width: 80, height: 24 }} /> : stat.value}
              </p>
              <p className={styles.statDesc}>{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lưới chứa 2 cột bên dưới (Đơn hàng gần đây & Sản phẩm bán chạy) */}
      <div className={styles.bottomGrid}>
        {/* Khối Đơn hàng gần đây */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Đơn hàng gần đây</h2>
            {/* Nút Xem tất cả dẫn qua trang danh sách đơn hàng */}
            <Link to="/admin/orders" className="btn btn-outline btn-sm">Xem tất cả</Link>
          </div>
          <div className={styles.table}>
            {/* Tiêu đề cột */}
            <div className={styles.tableHeader}>
              <span>Mã đơn</span>
              <span>Khách hàng</span>
              <span>Số tiền</span>
              <span>Trạng thái</span>
            </div>
            {/* Hiển thị list đơn hàng (hoặc skeleton nếu đang load) */}
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className={styles.tableRow}>
                  {[...Array(4)].map((_, j) => <div key={j} className="skeleton" style={{ height: 14, width: '80%' }} />)}
                </div>
              ))
            ) : 
            // Map mảng đơn hàng gần đây
            data?.recent_orders?.map(order => {
              // Lấy thông tin màu sắc/label tùy theo status của đơn hàng
              const statusInfo = ORDER_STATUS_MAP[order.status] || {}
              return (
                // Link bấm vào dòng sẽ sang trang đơn hàng
                <Link to={`/admin/orders`} key={order.id} className={styles.tableRow}>
                  <span className={styles.orderId}>#{order.order_number}</span>
                  <span className={styles.orderUser}>{order.user_name}</span>
                  <span className={styles.orderAmt}>{formatPrice(order.total)}</span>
                  {/* Cột trạng thái */}
                  <span className={styles.orderStatus} style={{ background: (statusInfo.color || '#ccc') + '22', color: statusInfo.color || '#666' }}>
                    {statusInfo.label || order.status}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Khối Sản phẩm bán chạy */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Sản phẩm bán chạy</h2>
            <Link to="/admin/products" className="btn btn-outline btn-sm">Quản lý</Link>
          </div>
          <div className={styles.topProductList}>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className={styles.topProduct}>
                  <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)' }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 12, width: '70%', marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 10, width: '40%' }} />
                  </div>
                </div>
              ))
            ) : 
            // Lấy ra 6 sản phẩm bán chạy nhất
            data?.top_products?.slice(0, 6).map(p => (
              <div key={p.id} className={styles.topProduct}>
                <div className={styles.topProductImg}>
                  {p.image ? <img src={p.image} alt={p.name} /> : <span>🎁</span>}
                </div>
                <div className={styles.topProductInfo}>
                  <p className={styles.topProductName}>{p.name}</p>
                  <p className={styles.topProductMeta}>Đã bán {p.total_sold} · Còn lại {p.stock_qty}</p>
                </div>
                <span className={styles.topProductPrice}>{formatPrice(p.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Biểu đồ Xu hướng doanh thu theo tháng (Hiển thị nếu có data) */}
      {data?.monthly_revenue?.length > 0 && (
        <div className={styles.card} style={{ marginTop: 24 }}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}><FiTrendingUp size={18} /> Xu hướng doanh thu (12 tháng)</h2>
          </div>
          <div className={styles.revenueChart}>
            {/* Lặp qua mảng doanh thu từng tháng để vẽ cột */}
            {data.monthly_revenue.map((month, i) => {
              // Tìm doanh thu cao nhất để chia tỷ lệ % chiều cao cột
              const max = Math.max(...data.monthly_revenue.map(m => m.revenue))
              // Tính % chiều cao so với tháng cao nhất
              const pct = max > 0 ? (month.revenue / max) * 100 : 0
              return (
                <div key={i} className={styles.revenueBar}>
                  {/* Cột thể hiện doanh thu, có tooltip (title) khi hover chuột vào */}
                  <div className={styles.revenueBarFill} style={{ height: `${Math.max(pct, 4)}%` }} title={`${month.month}: ${formatPrice(month.revenue)}`} />
                  {/* Chữ hiển thị nhãn Tháng/Năm */}
                  <span className={styles.revenueBarLabel}>{month.month?.slice(-2)}/{month.month?.slice(2, 4)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

