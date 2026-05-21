import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FiSearch, FiX, FiTrash2, FiEdit2 } from 'react-icons/fi'
import { userService } from '../../services/api'
import { formatDate } from '../../utils/format'
import toast from 'react-hot-toast'
import styles from './AdminPage.module.css'

// Component quản lý người dùng
export default function AdminUsers() {
  // State lưu từ khóa tìm kiếm (tên, email)
  const [search, setSearch] = useState('')
  // State lưu phân trang
  const [page, setPage] = useState(1)
  // Khởi tạo queryClient
  const qc = useQueryClient()

  // Dùng useQuery để gọi API danh sách users (phụ thuộc vào trang hiện tại và từ khóa tìm kiếm)
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => userService.getAll({ page, limit: 20, q: search }).then(r => r.data),
  })

  // Hàm xử lý việc Xóa người dùng
  const handleDelete = async (id, name) => {
    // Hỏi xác nhận trước khi xóa
    if (!window.confirm(`Xóa người dùng "${name}"? Thao tác này không thể hoàn tác.`)) return
    try {
      // Gọi API xóa user
      await userService.delete(id)
      // Báo thành công và gọi lại API danh sách
      toast.success('Đã xóa người dùng')
      qc.invalidateQueries(['admin-users'])
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Xóa thất bại') 
    }
  }

  // Hàm xử lý chuyển đổi phân quyền (Role) giữa 'admin' và 'user'
  const handleToggleRole = async (user) => {
    // Nghịch đảo quyền: Nếu đang là admin thì giáng thành user, và ngược lại
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    try {
      // Gọi API update một field (role) của user
      await userService.update(user.id, { role: newRole })
      // Thông báo và refetch danh sách
      toast.success(`Đã cập nhật vai trò thành ${newRole}`)
      qc.invalidateQueries(['admin-users'])
    } catch { 
      toast.error('Cập nhật thất bại') 
    }
  }

  // Hàm xử lý Kích hoạt/Vô hiệu hóa (Khóa) tài khoản
  const handleToggleActive = async (user) => {
    try {
      // Chuyển is_active sang trạng thái đối nghịch: 1 (hoạt động) -> 0 (vô hiệu)
      await userService.update(user.id, { is_active: user.is_active ? 0 : 1 })
      toast.success(`Đã ${user.is_active ? 'vô hiệu hóa' : 'kích hoạt'} người dùng`)
      qc.invalidateQueries(['admin-users'])
    } catch { 
      toast.error('Cập nhật thất bại') 
    }
  }

  // Render UI trang Users
  return (
    <div className={styles.page}>
      {/* Phần tiêu đề */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Người dùng</h1>
          <p className={styles.pageCount}>{data?.total || 0} tổng số người dùng</p>
        </div>
      </div>
      
      {/* Thanh công cụ Tìm kiếm */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <FiSearch size={16} />
          {/* Gắn state 'search' vào input */}
          <input type="text" placeholder="Tìm kiếm theo tên hoặc email..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} className={styles.searchInput} id="admin-user-search" />
          {/* Nút clear tìm kiếm */}
          {search && <button onClick={() => setSearch('')}><FiX size={14} /></button>}
        </div>
      </div>
      
      {/* Bảng danh sách User */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            {/* Các tiêu đề cột */}
            <tr><th>Người dùng</th><th>Email</th><th>Số điện thoại</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày tham gia</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {/* Hiệu ứng loading skeleton */}
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i}>{[...Array(7)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14, width: '80%' }} /></td>)}</tr>
              ))
            ) : 
            // Lặp qua mảng users
            data?.rows?.map(u => (
              <tr key={u.id}>
                {/* Tên */}
                <td><p className={styles.productName}>{u.full_name}</p></td>
                {/* Email */}
                <td>{u.email}</td>
                {/* Phone */}
                <td>{u.phone || '—'}</td>
                {/* Cột Vai trò (Role) */}
                <td>
                  {/* Nhấn vào badge này để chuyển đổi nhanh quyền Admin/User */}
                  <button
                    className={`${styles.statusBadge} ${u.role === 'admin' ? styles.status_limited : styles.status_normal}`}
                    style={{ border: 'none', cursor: 'pointer' }}
                    onClick={() => handleToggleRole(u)}
                    title="Click to toggle role"
                    id={`toggle-role-${u.id}`}
                  >
                    {u.role}
                  </button>
                </td>
                {/* Cột Trạng thái */}
                <td>
                  {/* Nhấn vào badge để Khóa/Mở khóa User */}
                  <button
                    className={`${styles.statusBadge} ${u.is_active ? styles.status_new : styles.status_sold_out}`}
                    style={{ border: 'none', cursor: 'pointer' }}
                    onClick={() => handleToggleActive(u)}
                    id={`toggle-active-${u.id}`}
                  >
                    {u.is_active ? 'Hoạt động' : 'Vô hiệu hóa'}
                  </button>
                </td>
                {/* Cột Ngày tham gia */}
                <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{formatDate(u.created_at)}</td>
                {/* Cột thao tác Xóa tài khoản */}
                <td>
                  <div className={styles.actions}>
                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(u.id, u.full_name)} title="Delete" id={`delete-user-${u.id}`}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
