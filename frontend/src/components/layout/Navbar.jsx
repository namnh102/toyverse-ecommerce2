import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { 
  FiSearch, FiShoppingBag, FiHeart, FiUser, FiMenu, FiX, FiChevronDown
} from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { label: 'Trang chủ',        to: '/' },
  { label: 'Cửa hàng',        to: '/shop' },
  { label: 'Hàng mới',to: '/shop?status=new' },
  { label: 'Bán chạy',to: '/shop?is_best_seller=true' },
  { label: 'Blind Box',   to: '/shop?is_blind_box=true' },
  { label: 'Bộ sưu tập', to: '/shop?view=collections' },
  { label: 'Giảm giá',        to: '/shop?sale=true' },
]

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const searchRef = useRef(null)

  const { user, isAuthenticated, logout } = useAuthStore()
  const { items, openCart } = useCartStore()
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setSearchOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo} aria-label="ToyVerse Home">
          <span className={styles.logoIcon}>🎁</span>
          <span className={styles.logoText}>
            <span className={styles.logoBrand}>Toy</span>
            <span className={styles.logoAccent}>Verse</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.nav} aria-label="Main navigation">
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive && to !== '/' ? styles.navLinkActive : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Icons */}
        <div className={styles.actions}>
          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className={styles.searchInput}
                id="navbar-search"
              />
              <button type="submit" className={styles.iconBtn} aria-label="Submit search">
                <FiSearch size={18} />
              </button>
              <button type="button" className={styles.iconBtn} onClick={() => setSearchOpen(false)} aria-label="Close search">
                <FiX size={18} />
              </button>
            </form>
          ) : (
            <button id="search-toggle" className={styles.iconBtn} onClick={() => setSearchOpen(true)} aria-label="Search">
              <FiSearch size={20} />
            </button>
          )}

          {/* Wishlist */}
          <Link to="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
            <FiHeart size={20} />
          </Link>

          {/* Account */}
          <div className={styles.accountMenu}>
            <Link
              to={isAuthenticated() ? '/account' : '/auth'}
              className={styles.iconBtn}
              aria-label="Account"
            >
              <FiUser size={20} />
              {user && <span className={styles.userDot} />}
            </Link>
            {isAuthenticated() && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <p className={styles.dropdownName}>{user?.full_name}</p>
                  <p className={styles.dropdownEmail}>{user?.email}</p>
                </div>
                <Link to="/account" className={styles.dropdownItem}>Tài khoản</Link>
                <Link to="/account?tab=orders" className={styles.dropdownItem}>Đơn hàng</Link>
                <Link to="/wishlist" className={styles.dropdownItem}>Yêu thích</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className={styles.dropdownItem}>Quản trị viên</Link>
                )}
                <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.dropdownLogout}`}>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>

          {/* Cart */}
          <button id="cart-toggle" className={styles.cartBtn} onClick={openCart} aria-label="Open cart">
            <FiShoppingBag size={20} />
            {itemCount > 0 && (
              <span className={styles.cartBadge} aria-label={`${itemCount} items in cart`}>
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>

          {/* Mobile Hamburger */}
          <button
            id="mobile-menu-toggle"
            className={`${styles.iconBtn} ${styles.hamburger}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className={styles.mobileNav}>
          <form onSubmit={handleSearch} className={styles.mobileSearch}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm..."
              className={styles.searchInput}
              id="mobile-search"
            />
            <button type="submit" className={styles.iconBtn}><FiSearch size={18} /></button>
          </form>
          {NAV_LINKS.map(({ label, to }) => (
            <Link key={label} to={to} className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>
              {label}
            </Link>
          ))}
          <div className={styles.mobileDivider} />
          {isAuthenticated() ? (
            <>
              <Link to="/account" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Tài khoản</Link>
              <Link to="/account?tab=orders" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Đơn hàng</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Quản trị viên</Link>
              )}
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className={styles.mobileNavLink}>
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/auth" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Đăng nhập / Đăng ký</Link>
          )}
        </div>
      )}
    </header>
  )
}
