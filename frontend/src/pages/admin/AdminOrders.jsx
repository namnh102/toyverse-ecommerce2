import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FiSearch, FiX } from 'react-icons/fi'
import { orderService } from '../../services/api'
import { formatPrice, formatDate, ORDER_STATUS_MAP } from '../../utils/format'
import toast from 'react-hot-toast'
import styles from './AdminPage.module.css'

const STATUS_OPTIONS = ['pending','confirmed','shipping','completed','cancelled']

export default function AdminOrders() {
  // State lưu từ khóa tìm kiếm (theo mã đơn hoặc tên user)
  const [search, setSearch] = useState('')
  // State lưu trang hiện tại
  const [page, setPage] = useState(1)
  // State lưu bộ lọc theo trạng thái đơn hàng (ví dụ: chỉ xem đơn "pending")
  const [statusFilter, setStatusFilter] = useState('')
  // Khởi tạo queryClient
  const qc = useQueryClient()

  // Gọi API lấy danh sách đơn hàng
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, search, statusFilter],
    queryFn: () => orderService.getAll({ page, limit: 20, q: search, status: statusFilter }).then(r => r.data),
  })

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus)
      toast.success('Đã cập nhật trạng thái đơn hàng')
      qc.invalidateQueries(['admin-orders'])
    } catch { 
      toast.error('Cập nhật thất bại') 
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Đơn hàng</h1>
          {/* Tổng số lượng đơn hàng */}
          <p className={styles.pageCount}>{data?.total || 0} tổng số đơn hàng</p>
        </div>
      </div>

      {/* Thanh công cụ (Bộ lọc & Tìm kiếm) */}
      <div className={styles.toolbar}>
        {/* Khung tìm kiếm text */}
        <div className={styles.searchWrap}>
          <FiSearch size={16} />
          {/* Ô nhập từ khóa tìm kiếm */}
          <input type="text" placeholder="Tìm kiếm theo mã đơn hoặc khách hàng..." value={search}
            // Thay đổi state search và đưa về trang 1
            onChange={e => { setSearch(e.target.value); setPage(1); }} className={styles.searchInput} id="admin-order-search" />
          {/* Nút xóa nhanh từ khóa (dấu X) */}
          {search && <button onClick={() => setSearch('')}><FiX size={14} /></button>}
        </div>
        {/* Khung Dropdown lọc theo trạng thái đơn hàng */}
        <select className={styles.statusSelect} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} id="admin-order-status-filter">
          <option value="">Tất cả trạng thái</option>
          {/* Map danh sách trạng thái để hiển thị option */}
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{ORDER_STATUS_MAP[s]?.label || s}</option>)}
        </select>
      </div>

      {/* Bảng danh sách đơn hàng */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            {/* Các tiêu đề cột */}
            <tr>
              <th>Đơn hàng</th>
              <th>Khách hàng</th>
              <th>Số lượng</th>
              <th>Tổng cộng</th>
              <th>Thanh toán</th>
              <th>Ngày</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {/* Nếu đang load thì hiện skeleton */}
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14, width: '80%' }} /></td>)}
                </tr>
              ))
            ) : 
            // Đã load xong thì lặp danh sách
            data?.rows?.map(order => {
              // Lấy config (màu, label tiếng Việt) theo trạng thái của đơn
              const statusInfo = ORDER_STATUS_MAP[order.status] || {}
              return (
                <tr key={order.id}>
                  {/* Mã đơn hàng */}
                  <td><span className={styles.productName}>#{order.order_number}</span></td>
                  {/* Khách hàng (Tên + Email) */}
                  <td>
                    <p className={styles.productName}>{order.user_name}</p>
                    <p className={styles.productSku}>{order.user_email}</p>
                  </td>
                  {/* Số lượng món trong đơn */}
                  <td>{order.item_count || '—'}</td>
                  {/* Tổng tiền */}
                  <td className={styles.priceCell}>{formatPrice(order.total)}</td>
                  {/* Trạng thái thanh toán (đã thanh toán hoặc chưa) */}
                  <td><span className={`${styles.statusBadge} ${order.payment_status === 'paid' ? styles.status_new : styles.status_normal}`}>{order.payment_status}</span></td>
                  {/* Ngày tạo đơn */}
                  <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{formatDate(order.created_at)}</td>
                  {/* Cột Dropdown dùng để cập nhật Trạng thái xử lý (Status) của đơn hàng */}
                  <td>
                    <select
                      className={styles.statusSelect}
                      value={order.status}
                      // Khi admin chọn trạng thái khác thì gọi hàm handleStatusChange để bắn API luôn
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      id={`order-status-${order.id}`}
                      // Thay đổi màu nền/chữ của dropdown dựa theo status hiện tại
                      style={{ background: (statusInfo.color || '#ccc') + '22', color: statusInfo.color || '#666' }}
                    >
                      {/* Liệt kê các trạng thái khả dụng */}
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{ORDER_STATUS_MAP[s]?.label || s}</option>)}
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {/* Phân trang */}
        {data?.totalPages > 1 && (
          <div className={styles.pagination}>
            <button className="btn btn-outline btn-sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Trước</button>
            <span>{page} / {data.totalPages}</span>
            <button className="btn btn-outline btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages}>Sau</button>
          </div>
        )}
      </div>
    </div>
  )
}
