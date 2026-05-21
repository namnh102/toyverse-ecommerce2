import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import CartDrawer from '../cart/CartDrawer'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'

export default function Layout() {
  const { pathname } = useLocation()
  const { isAuthenticated } = useAuthStore()
  const { fetchCart } = useCartStore()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  // Sync cart when authenticated
  useEffect(() => {
    if (isAuthenticated()) fetchCart()
  }, [isAuthenticated()])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: 'var(--navbar-h)' }}>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
