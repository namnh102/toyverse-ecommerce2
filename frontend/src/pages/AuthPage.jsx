import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'
import styles from './AuthPage.module.css'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})

  const { login, register, isAuthenticated } = useAuthStore()
  const { fetchCart } = useCartStore()
  const navigate = useNavigate()

  if (isAuthenticated()) return <Navigate to="/account" replace />

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
  }

  const validateLogin = () => {
    const errs = {}
    if (!form.email) errs.email = 'Vui lòng nhập Email'
    if (!form.password) errs.password = 'Vui lòng nhập Mật khẩu'
    return errs
  }

  const validateRegister = () => {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Vui lòng nhập Họ tên'
    if (!form.email) errs.email = 'Vui lòng nhập Email'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email không hợp lệ'
    if (!form.password || form.password.length < 6) errs.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Mật khẩu không khớp'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = mode === 'login' ? validateLogin() : validateRegister()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    const result = mode === 'login'
      ? await login(form.email, form.password)
      : await register({ full_name: form.full_name, email: form.email, password: form.password })

    setLoading(false)
    if (result.success) {
      await fetchCart()
      toast.success(mode === 'login' ? 'Chào mừng trở lại! 🎁' : 'Tạo tài khoản thành công! Chào mừng đến ToyVerse! ✨')
      navigate('/')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <span className={styles.logoEmoji}>🎁</span>
          <div>
            <div className={styles.logoText}><span>Toy</span><span className={styles.logoAccent}>Verse</span></div>
            <p className={styles.logoTagline}>Bảo thỏa đam mê</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
            onClick={() => { setMode('login'); setErrors({}) }}
            id="tab-login"
          >
            Đăng nhập
          </button>
          <button
            className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
            onClick={() => { setMode('register'); setErrors({}) }}
            id="tab-register"
          >
            Đăng ký
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="full_name">Họ và tên</label>
              <input id="full_name" name="full_name" type="text" className={`form-input ${errors.full_name ? styles.inputError : ''}`} value={form.full_name} onChange={handleChange} placeholder="Họ và tên của bạn" autoComplete="name" />
              {errors.full_name && <span className="form-error">{errors.full_name}</span>}
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="auth_email">Email</label>
            <input id="auth_email" name="email" type="email" className={`form-input ${errors.email ? styles.inputError : ''}`} value={form.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="auth_password">Mật khẩu</label>
            <input id="auth_password" name="password" type="password" className={`form-input ${errors.password ? styles.inputError : ''}`} value={form.password} onChange={handleChange} placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="confirm_password">Xác nhận mật khẩu</label>
              <input id="confirm_password" name="confirmPassword" type="password" className={`form-input ${errors.confirmPassword ? styles.inputError : ''}`} value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>
          )}
          <button type="submit" className={`btn btn-primary btn-full btn-lg ${styles.submitBtn}`} disabled={loading} id="auth-submit">
            {loading ? 'Vui lòng đợi...' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>

        <div className={styles.divider}><span>HOẶC</span></div>

        {mode === 'login' ? (
          <p className={styles.switchText}>
            Chưa có tài khoản?{' '}
            <button className={styles.switchLink} onClick={() => { setMode('register'); setErrors({}) }}>
              Đăng ký ngay ✨
            </button>
          </p>
        ) : (
          <p className={styles.switchText}>
            Đã có tài khoản?{' '}
            <button className={styles.switchLink} onClick={() => { setMode('login'); setErrors({}) }}>
              Đăng nhập
            </button>
          </p>
        )}

        <p className={styles.demoHint}>
          <strong>Demo:</strong> admin@toyverse.com / Admin@123
        </p>
      </div>

      <div className={styles.decoration}>
        {['🎁', '🐰', '✨', '🌸', '🎨', '⭐'].map((e, i) => (
          <div key={i} className={styles.floatEmoji} style={{ '--delay': `${i * 0.5}s`, '--pos': `${i * 16}%` }}>
            {e}
          </div>
        ))}
      </div>
    </div>
  )
}
