import { Outlet, NavLink, Link } from 'react-router-dom'
import { 
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiTag,
  FiLogOut, FiMenu, FiX
} from 'react-icons/fi'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import styles from './AdminLayout.module.css'

const NAV = [
  { to: '/admin',             label: 'Bảng điều khiển',  icon: <FiGrid />,        end: true },
  { to: '/admin/products',    label: 'Sản phẩm',   icon: <FiPackage /> },
  { to: '/admin/orders',      label: 'Đơn hàng',     icon: <FiShoppingBag /> },
  { to: '/admin/users',       label: 'Người dùng',      icon: <FiUsers /> },
  { to: '/admin/categories',  label: 'Danh mục', icon: <FiTag /> },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          {!collapsed && (
            <Link to="/" className={styles.logo}>
              <span>🎁</span>
              <span className={styles.logoText}>ToyVerse <span className={styles.adminBadge}>Admin</span></span>
            </Link>
          )}
          <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
            {collapsed ? <FiMenu size={18} /> : <FiX size={18} />}
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              title={collapsed ? label : ''}
              id={`admin-nav-${label.toLowerCase()}`}
            >
              <span className={styles.navIcon}>{icon}</span>
              {!collapsed && <span className={styles.navLabel}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          {!collapsed && (
            <div className={styles.adminUser}>
              <div className={styles.adminAvatar}>{user?.full_name?.[0]}</div>
              <div>
                <p className={styles.adminName}>{user?.full_name}</p>
                <p className={styles.adminRole}>Quản trị viên</p>
              </div>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={() => { logout(); window.location.href = '/' }} aria-label="Logout" id="admin-logout">
            <FiLogOut size={18} />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h1 className={styles.topbarTitle}>Trang quản trị</h1>
          </div>
          <div className={styles.topbarRight}>
            <Link to="/" className="btn btn-outline btn-sm" id="admin-view-site">
              Xem trang web
            </Link>
          </div>
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
