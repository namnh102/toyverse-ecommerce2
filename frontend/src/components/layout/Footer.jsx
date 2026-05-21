import { Link } from 'react-router-dom'
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiMail } from 'react-icons/fi'
import styles from './Footer.module.css'

const LINKS = {
  shop: [
    { label: 'Blind Box', to: '/shop?is_blind_box=true' },
    { label: 'Mô hình Figure', to: '/shop?category=figures' },
    { label: 'Gấu bông', to: '/shop?category=plush' },
    { label: 'Đồ chơi nghệ thuật', to: '/shop?category=art-toys' },
    { label: 'Phiên bản giới hạn', to: '/shop?category=limited-edition' },
    { label: 'Hàng mới', to: '/shop?status=new' },
  ],
  help: [
    { label: 'Theo dõi đơn hàng', to: '/account?tab=orders' },
    { label: 'Thông tin giao hàng', to: '/shipping' },
    { label: 'Đổi trả & Hoàn tiền', to: '/returns' },
    { label: 'Câu hỏi thường gặp', to: '/faq' },
    { label: 'Liên hệ', to: '/contact' },
  ],
  about: [
    { label: 'Giới thiệu ToyVerse', to: '/about' },
    { label: 'Câu chuyện', to: '/story' },
    { label: 'Hợp tác', to: '/collabs' },
    { label: 'Tuyển dụng', to: '/careers' },
    { label: 'Báo chí', to: '/press' },
  ],
}

const SOCIALS = [
  { icon: <FiInstagram />, href: '#', label: 'Instagram' },
  { icon: <FiTwitter />,   href: '#', label: 'Twitter' },
  { icon: <FiFacebook />,  href: '#', label: 'Facebook' },
  { icon: <FiYoutube />,   href: '#', label: 'YouTube' },
]

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        {/* Brand */}
        <div className={styles.brandCol}>
          <Link to="/" className={styles.logo}>
            <span>🎁</span>
            <span className={styles.logoText}>
              <span className={styles.logoBrand}>Toy</span>
              <span className={styles.logoAccent}>Verse</span>
            </span>
          </Link>
          <p className={styles.tagline}>
            Sưu tầm thế giới mô hình. Blind box, figure, và đồ chơi nghệ thuật 
            cao cấp dành cho người chơi hệ sưu tầm.
          </p>
          <div className={styles.socials}>
            {SOCIALS.map(({ icon, href, label }) => (
              <a key={label} href={href} className={styles.socialBtn} aria-label={label} target="_blank" rel="noopener">
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Cửa hàng</h4>
          {LINKS.shop.map(({ label, to }) => (
            <Link key={label} to={to} className={styles.link}>{label}</Link>
          ))}
        </div>

        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Hỗ trợ</h4>
          {LINKS.help.map(({ label, to }) => (
            <Link key={label} to={to} className={styles.link}>{label}</Link>
          ))}
        </div>

        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Về chúng tôi</h4>
          {LINKS.about.map(({ label, to }) => (
            <Link key={label} to={to} className={styles.link}>{label}</Link>
          ))}
        </div>

        {/* Newsletter */}
        <div className={styles.newsletterCol}>
          <h4 className={styles.colTitle}>Cập nhật thông tin ✨</h4>
          <p className={styles.newsletterText}>
            Nhận thông báo sớm nhất về sản phẩm mới, phiên bản giới hạn và các tips sưu tầm.
          </p>
          <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.newsletterInput}>
              <FiMail size={16} className={styles.newsletterIcon} />
              <input
                type="email"
                placeholder="your@email.com"
                className={styles.emailInput}
                id="newsletter-email"
                aria-label="Newsletter email"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Đăng ký</button>
          </form>
          <div className={styles.footerBadges}>
            <span className={styles.trustBadge}>🔒 Thanh toán an toàn</span>
            <span className={styles.trustBadge}>📦 Giao hàng nhanh chóng</span>
            <span className={styles.trustBadge}>✨ Chính hãng 100%</span>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <div className={styles.bottomInner}>
            <p className={styles.copyright}>
              © {new Date().getFullYear()} ToyVerse. Đã đăng ký bản quyền.
            </p>
            <div className={styles.bottomLinks}>
              <Link to="/privacy" className={styles.bottomLink}>Chính sách bảo mật</Link>
              <Link to="/terms" className={styles.bottomLink}>Điều khoản dịch vụ</Link>
              <Link to="/cookies" className={styles.bottomLink}>Chính sách Cookie</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
