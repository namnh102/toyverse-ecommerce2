import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '70vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '40px 24px'
    }}>
      <div style={{ fontSize: '6rem', marginBottom: 24 }}>🎁</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 900, marginBottom: 12 }}>
        404 — Lạc Không Gian 🌌
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', maxWidth: 480, lineHeight: 1.7, marginBottom: 32 }}>
        Có vẻ như trang này đã bị ai đó nẫng tay trên mất rồi. Hãy quay lại săn các sản phẩm khác nhé!
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary btn-lg">🏠 Về Trang Chủ</Link>
        <Link to="/shop" className="btn btn-outline btn-lg">🛍️ Khám phá cửa hàng</Link>
      </div>
    </div>
  )
}
