import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiChevronRight } from 'react-icons/fi'
import { homeService, productService } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import styles from './HomePage.module.css'
import { formatDate } from '../utils/format'

// ─── Section components ───────────────────────────────────────────────────────

function HeroSection({ banners }) {
  const banner = banners?.[0]
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        {banner?.badge_text && (
          <div className={styles.heroBadgeWrap}>
            <span className={styles.heroBadgeDot} />
            <span className={styles.heroBadge}>{banner.badge_text}</span>
          </div>
        )}
        <h1 className={styles.heroTitle}>
          {banner?.title || (
            <>Sưu tầm <span className={styles.heroHighlight}>Mô hình</span>,<br />Đam mê không giới hạn</>
          )}
        </h1>
        <p className={styles.heroSubtitle}>
          {banner?.subtitle || 'Blind box hiện đại, figure & đồ chơi nghệ thuật cao cấp. Hàng mới về mỗi tuần — hãy là người sở hữu đầu tiên.'}
        </p>
        <div className={styles.heroCtas}>
          <Link to={banner?.cta_link || '/shop'} className="btn btn-primary btn-xl" id="hero-shop-now">
            {banner?.cta_text || 'Mua sắm ngay'} <FiArrowRight size={20} />
          </Link>
          <Link to="/shop?view=collections" className="btn btn-ghost btn-xl" id="hero-collections">
            Khám phá trọn bộ
          </Link>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}><strong>500+</strong><span>Sản phẩm</span></div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}><strong>30+</strong><span>Bộ sưu tập</span></div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}><strong>10K+</strong><span>Khách hàng</span></div>
        </div>
      </div>
      <div className={styles.heroVisual}>
        <div className={styles.heroOrb1} />
        <div className={styles.heroOrb2} />
        <div className={styles.heroOrb3} />
        <div className={styles.heroDisplay}>
          <div className={styles.heroCard1}>
            <span className={styles.heroCardEmoji}>🎁</span>
            <span className={styles.heroCardLabel}>Blind Box</span>
          </div>
          <div className={styles.heroCard2}>
            <span className={styles.heroCardEmoji}>✨</span>
            <span className={styles.heroCardLabel}>Bản giới hạn</span>
          </div>
          <div className={styles.heroCard3}>
            <span className={styles.heroCardEmoji}>🌸</span>
            <span className={styles.heroCardLabel}>Dòng mới</span>
          </div>
          <div className={styles.heroMainCard}>
            <div className={styles.heroMainEmoji}>🐰</div>
            <div className={styles.heroMainInfo}>
              <p className={styles.heroMainName}>Dreamy Pastel Series</p>
              <p className={styles.heroMainSub}>12 mô hình để sưu tập</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CategorySection({ categories }) {
  const categoryEmojis = {
    'blind-box':       '🎁',
    'figures':         '🗿',
    'plush':           '🧸',
    'keychains':       '🔑',
    'art-toys':        '🎨',
    'limited-edition': '⭐',
    'new-arrivals':    '✨',
    'accessories':     '📦',
  }
  return (
    <section className={styles.categorySection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className="section-eyebrow">Phân loại</span>
          <h2 className="section-title">Bạn đang tìm kiếm gì?</h2>
        </div>
        <div className={styles.categoryGrid}>
          {(categories || []).map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className={styles.catCard}
              id={`category-${cat.slug}`}
            >
              <div className={styles.catEmoji}>{categoryEmojis[cat.slug] || '🎀'}</div>
              <span className={styles.catName}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function BlindBoxSection() {
  return (
    <section className={styles.blindBoxSection}>
      <div className="container">
        <div className={styles.blindBoxInner}>
          <div className={styles.blindBoxText}>
            <span className="section-eyebrow">Sự hồi hộp của điều bí ẩn</span>
            <h2 className={styles.blindBoxTitle}>Blind Box Drop 🎁</h2>
            <p className={styles.blindBoxDesc}>
              Mở một hộp, khám phá một nhân vật. Bạn sẽ nhận được bản thường, bản hiếm hay phiên bản secret được săn đón? Đó chính là sự kỳ diệu của việc sưu tập blind box.
            </p>
            <ul className={styles.blindBoxFeatures}>
              <li>✨ 12 nhân vật độc đáo rải rác mỗi dòng</li>
              <li>🌟 Tỉ lệ 1/144 ra bản secret</li>
              <li>📦 Đóng hộp cao cấp cực đẹp</li>
              <li>🔄 Trao đổi với các nhà sưu tầm khác</li>
            </ul>
            <Link to="/shop?is_blind_box=true" className="btn btn-dark btn-lg" id="blindbox-shop">
              Mua Blind Box <FiArrowRight size={18} />
            </Link>
          </div>
          <div className={styles.blindBoxVisual}>
            {['#F9A8C9', '#A8E6CF', '#C9B8FF', '#B8D4FF', '#FFE4A0', '#FFD4B8'].map((color, i) => (
              <div
                key={i}
                className={styles.blindBoxCube}
                style={{ '--cube-color': color, '--delay': `${i * 0.15}s` }}
              >
                <span>?</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CollectionShowcase({ collections }) {
  return (
    <section className={styles.collectionsSection}>
      <div className="container">
        <div className={styles.sectionHeaderRow}>
          <div>
            <span className="section-eyebrow">Bộ sưu tập & Series</span>
            <h2 className="section-title">Bộ sưu tập nổi bật</h2>
          </div>
          <Link to="/shop?view=collections" className="btn btn-outline" id="collections-view-all">
            Xem tất cả <FiChevronRight size={16} />
          </Link>
        </div>
        <div className={styles.collectionsGrid}>
          {(collections || []).slice(0, 3).map((col, idx) => (
            <Link
              key={col.id}
              to={`/shop?collection=${col.slug}`}
              className={`${styles.colCard} ${idx === 0 ? styles.colCardFeatured : ''}`}
              id={`collection-${col.slug}`}
            >
              <div className={styles.colCardBg}>
                <div className={styles.colCardOrb} />
              </div>
              <div className={styles.colCardContent}>
                <span className={`badge ${idx === 0 ? 'badge-pink' : idx === 1 ? 'badge-lavender' : 'badge-green'}`}>
                  {col.status === 'sold_out' ? 'Hết hàng' : col.status === 'upcoming' ? 'Sắp ra mắt' : 'Đang mở bán'}
                </span>
                <h3 className={styles.colCardName}>{col.name}</h3>
                <p className={styles.colCardDesc}>{col.description?.slice(0, 80)}...</p>
                <div className={styles.colCardMeta}>
                  <span>{col.product_count} sản phẩm</span>
                  <span className={styles.colCardArrow}><FiArrowRight /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function ReviewsSection() {
  const REVIEWS = [
    { name: 'Minh Hoa', rating: 5, text: 'Mở ngay bản secret từ hộp đầu tiên! Chất lượng tuyệt vời — hơn cả mong đợi. Chắc chắn sẽ sưu tầm thêm.', product: 'Dreamy Pastel Series', avatar: '🐱' },
    { name: 'Lan Anh', rating: 5, text: 'Gấu bông cực kỳ mềm mại. Chi tiết rất tuyệt, hộp giao đến tay vẫn hoàn hảo. 10/10!', product: 'Boba Bear Plush', avatar: '🌸' },
    { name: 'Thanh Long', rating: 5, text: 'Art Toy như một tác phẩm nghệ thuật. Các chi tiết hoàn thiện tay hoàn hảo. Rất đáng đồng tiền.', product: 'Melting Bunny Art Toy', avatar: '🐰' },
    { name: 'Thu Ha', rating: 5, text: 'Bộ set hoàn chỉnh, giao hàng tuyệt vời. Rất đẹp và tinh tế.', product: 'Sakura Dreams Set', avatar: '🌺' },
  ]
  return (
    <section className={styles.reviewsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className="section-eyebrow">Câu chuyện khách hàng</span>
          <h2 className="section-title">Đánh giá từ người sưu tầm</h2>
          <p className="section-subtitle">Tham gia cùng hàng ngàn khách hàng hài lòng rải rác trên toàn quốc</p>
        </div>
        <div className={styles.reviewsGrid}>
          {REVIEWS.map((r, i) => (
            <div key={i} className={styles.reviewCard}>
              <div className={styles.reviewStars}>
                {'⭐'.repeat(r.rating)}
              </div>
              <p className={styles.reviewText}>"{r.text}"</p>
              <div className={styles.reviewMeta}>
                <div className={styles.reviewAvatar}>{r.avatar}</div>
                <div>
                  <p className={styles.reviewName}>{r.name}</p>
                  <p className={styles.reviewProduct}>{r.product}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Main HomePage ────────────────────────────────────────────────────────────
export default function HomePage() {
  const { data: bannersData } = useQuery({
    queryKey: ['banners'],
    queryFn: () => homeService.getBanners('hero').then((r) => r.data),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => import('../services/api').then(({ categoryService }) =>
      categoryService.getAll({ active: true }).then(r => r.data)
    ),
  })

  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productService.getAll({ is_featured: true, limit: 8 }).then(r => r.data),
  })

  const { data: bestSellersData, isLoading: bsLoading } = useQuery({
    queryKey: ['products', 'best-sellers'],
    queryFn: () => productService.getAll({ is_best_seller: true, limit: 8 }).then(r => r.data),
  })

  const { data: newArrivalsData } = useQuery({
    queryKey: ['products', 'new'],
    queryFn: () => productService.getAll({ status: 'new', limit: 8 }).then(r => r.data),
  })

  const { data: collectionsData } = useQuery({
    queryKey: ['collections', 'featured'],
    queryFn: () => homeService.getCollections().then(r => r.data),
  })

  const SkeletonGrid = () => (
    <div className="product-grid">
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-xl)' }} />
          <div className="skeleton" style={{ height: '14px', width: '60%' }} />
          <div className="skeleton" style={{ height: '18px' }} />
          <div className="skeleton" style={{ height: '20px', width: '40%' }} />
        </div>
      ))}
    </div>
  )

  return (
    <div className="fade-in-up">
      {/* Hero */}
      <HeroSection banners={bannersData?.banners} />

      {/* Categories */}
      <CategorySection categories={categoriesData?.categories} />

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <div className={`${styles.sectionHeaderRow} ${styles.mb10}`}>
            <div className={styles.sectionHeader}>
              <span className="section-eyebrow">Lựa chọn cho bạn</span>
              <h2 className="section-title">Sản phẩm nổi bật ✨</h2>
            </div>
            <Link to="/shop?is_featured=true" className="btn btn-outline" id="featured-view-all">
              Xem tất cả <FiChevronRight size={16} />
            </Link>
          </div>
          {featuredLoading ? <SkeletonGrid /> : (
            <div className="product-grid">
              {featuredData?.rows?.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Blind Box Banner */}
      <BlindBoxSection />

      {/* Best Sellers */}
      <section className="section">
        <div className="container">
          <div className={`${styles.sectionHeaderRow} ${styles.mb10}`}>
            <div>
              <span className="section-eyebrow">Mục yêu thích</span>
              <h2 className="section-title">Bán chạy nhất 🔥</h2>
            </div>
            <Link to="/shop?is_best_seller=true" className="btn btn-outline" id="bestsellers-view-all">
              Xem tất cả <FiChevronRight size={16} />
            </Link>
          </div>
          {bsLoading ? <SkeletonGrid /> : (
            <div className="product-grid">
              {bestSellersData?.rows?.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Collections */}
      <CollectionShowcase collections={collectionsData?.collections} />

      {/* New Arrivals */}
      <section className="section" style={{ background: 'var(--color-bg-soft)' }}>
        <div className="container">
          <div className={`${styles.sectionHeaderRow} ${styles.mb10}`}>
            <div>
              <span className="section-eyebrow">Vừa ra mắt</span>
              <h2 className="section-title">Hàng mới về 🌸</h2>
            </div>
            <Link to="/shop?status=new" className="btn btn-outline" id="new-arrivals-view-all">
              Xem tất cả <FiChevronRight size={16} />
            </Link>
          </div>
          <div className="product-grid">
            {newArrivalsData?.rows?.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <ReviewsSection />

      {/* Newsletter CTA Banner */}
      <section className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaInner}>
            <div className={styles.ctaText}>
              <h2 className={styles.ctaTitle}>Không bỏ lỡ sản phẩm mới 🎁</h2>
              <p className={styles.ctaSubtitle}>Đăng ký email để nhận thông báo sớm nhất về các đợt phát hành siêu giới hạn, bộ sưu tập mới và ưu đãi độc quyền.</p>
            </div>
            <form className={styles.ctaForm} onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                className={`form-input ${styles.ctaInput}`}
                id="footer-newsletter"
                aria-label="Subscribe to newsletter"
              />
              <button type="submit" className="btn btn-primary btn-lg">
                Đăng ký ✨
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
