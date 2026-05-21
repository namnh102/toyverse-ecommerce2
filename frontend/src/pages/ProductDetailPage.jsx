import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiShoppingBag, FiHeart, FiStar, FiShare2, FiChevronRight, FiMinus, FiPlus, FiPackage, FiTruck, FiRefreshCw } from 'react-icons/fi'
import { productService, userService } from '../services/api'
import { useCartStore } from '../store/cartStore'
import ProductCard from '../components/product/ProductCard'
import { formatPrice } from '../utils/format'
import toast from 'react-hot-toast'
import styles from './ProductDetailPage.module.css'

export default function ProductDetailPage() {
  const { idOrSlug } = useParams()
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [tab, setTab] = useState('description')
  const { addToCart, isLoading } = useCartStore()

  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: () => productService.getById(idOrSlug).then(r => r.data),
  })

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', data?.product?.id],
    queryFn: () => productService.getReviews(data.product.id).then(r => r.data),
    enabled: !!data?.product?.id,
  })

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className={styles.skeletonLayout}>
          <div className={styles.skeletonGallery}>
            <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-2xl)' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)' }} />)}
            </div>
          </div>
          <div className={styles.skeletonInfo}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: i === 0 ? 36 : 16, marginBottom: 12, width: i === 0 ? '80%' : i === 1 ? '40%' : '100%' }} />)}
          </div>
        </div>
      </div>
    )
  }

  if (error || !data?.product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>😔</div>
        <h2>Không tìm thấy sản phẩm</h2>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: 24 }}>Quay lại Cửa hàng</Link>
      </div>
    )
  }

  const { product, related } = data
  const images = product.images?.length > 0 ? product.images : [{ image_url: null, alt_text: product.name }]
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null

  const handleAddToCart = async () => {
    await addToCart(product.id, qty)
  }

  const handleBuyNow = async () => {
    const ok = await addToCart(product.id, qty)
    if (ok) window.location.href = '/checkout'
  }

  const handleWishlist = async () => {
    try {
      const { data: res } = await userService.toggleWishlist(product.id)
      toast(res.added ? '❤️ Đã thêm vào yêu thích!' : '💔 Đã xóa khỏi yêu thích', { icon: '' })
    } catch {
      toast.error('Đăng nhập để lưu yêu thích')
    }
  }

  const SPECS = [
    { label: 'Thương hiệu', value: product.brand },
    { label: 'Chất liệu', value: product.material },
    { label: 'Kích thước', value: product.dimensions },
    { label: 'Bộ sưu tập', value: product.collection_name },
    { label: 'Danh mục', value: product.category_name },
    { label: 'SKU', value: product.sku },
  ].filter(s => s.value)

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">Trang chủ</Link>
          <FiChevronRight size={14} />
          <Link to="/shop">Cửa hàng</Link>
          <FiChevronRight size={14} />
          <Link to={`/shop?category=${product.category_slug}`}>{product.category_name}</Link>
          <FiChevronRight size={14} />
          <span>{product.name}</span>
        </nav>

        {/* Main Layout */}
        <div className={styles.layout}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              {images[activeImage]?.image_url ? (
                <img
                  src={images[activeImage].image_url}
                  alt={images[activeImage].alt_text || product.name}
                  className={styles.mainImg}
                />
              ) : (
                <div className={styles.imgPlaceholder}>
                  <span>🎁</span>
                </div>
              )}
              {discount && <div className={styles.discountBadge}>-{discount}%</div>}
              {product.status === 'limited' && (
                <div className={styles.limitedBadge}>⭐ Bản giới hạn</div>
              )}
            </div>
            {images.length > 1 && (
              <div className={styles.thumbnails}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${i === activeImage ? styles.thumbActive : ''}`}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    {img.image_url ? (
                      <img src={img.image_url} alt={img.alt_text || product.name} />
                    ) : (
                      <span>🎁</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={styles.info}>
            {/* Badges row */}
            <div className={styles.badgeRow}>
              {product.is_blind_box && <span className="badge badge-lavender">Blind Box</span>}
              <span className={`badge badge-${product.status === 'hot' ? 'pink' : product.status === 'new' ? 'green' : product.status === 'limited' ? 'dark' : 'blue'}`}>
                {product.status === 'hot' ? '🔥 Hot' : product.status === 'new' ? '✨ Mới' : product.status === 'limited' ? '⭐ Giới hạn' : product.status}
              </span>
              {product.stock_qty < 10 && product.stock_qty > 0 && (
                <span className="badge badge-peach">Chỉ còn {product.stock_qty} chiếc!</span>
              )}
            </div>

            <h1 className={styles.productName}>{product.name}</h1>

            {/* Rating */}
            {product.review_count > 0 && (
              <div className={styles.ratingRow}>
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={16}
                      fill={i < Math.round(product.avg_rating) ? '#FFB347' : 'none'}
                      stroke={i < Math.round(product.avg_rating) ? '#FFB347' : '#ddd'}
                    />
                  ))}
                </div>
                <span className={styles.ratingText}>{product.avg_rating.toFixed(1)}</span>
                <span className={styles.reviewCount}>({product.review_count} đánh giá)</span>
                <button className={styles.reviewLink} onClick={() => setTab('reviews')}>
                  Xem tất cả
                </button>
              </div>
            )}

            {/* Short description */}
            {product.short_description && (
              <p className={styles.shortDesc}>{product.short_description}</p>
            )}

            {/* Price */}
            <div className={styles.priceBlock}>
              <span className={styles.price}>{formatPrice(product.price)}</span>
              {product.compare_price && (
                <span className={styles.comparePrice}>{formatPrice(product.compare_price)}</span>
              )}
              {discount && <span className={styles.saveBadge}>Tiết kiệm {discount}%</span>}
            </div>

            {/* Quantity */}
            <div className={styles.qtyRow}>
              <span className={styles.qtyLabel}>Số lượng</span>
              <div className={styles.qty}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease"
                >
                  <FiMinus size={14} />
                </button>
                <span className={styles.qtyVal}>{qty}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQty(q => Math.min(product.stock_qty, q + 1))}
                  disabled={qty >= product.stock_qty}
                  aria-label="Increase"
                >
                  <FiPlus size={14} />
                </button>
              </div>
              <span className={styles.stockText}>
                {product.stock_qty > 0 ? `Còn ${product.stock_qty} sản phẩm có sẵn` : 'Hết hàng'}
              </span>
            </div>

            {/* CTAs */}
            <div className={styles.ctaRow}>
              <button
                className={`btn btn-primary btn-lg ${styles.addBtn}`}
                onClick={handleAddToCart}
                disabled={isLoading || product.stock_qty === 0}
                id="product-add-to-cart"
              >
                <FiShoppingBag size={18} />
                {isLoading ? 'Đang thêm...' : 'Thêm vào giỏ'}
              </button>
              <button
                className={`btn btn-dark btn-lg ${styles.buyBtn}`}
                onClick={handleBuyNow}
                disabled={product.stock_qty === 0}
                id="product-buy-now"
              >
                Mua ngay
              </button>
              <button className="btn btn-icon btn-outline" onClick={handleWishlist} aria-label="Add to wishlist" id="product-wishlist">
                <FiHeart size={18} />
              </button>
              <button className="btn btn-icon btn-ghost" aria-label="Share product" id="product-share">
                <FiShare2 size={18} />
              </button>
            </div>

            {/* Trust signals */}
            <div className={styles.trustRow}>
              <div className={styles.trust}><FiTruck size={14} /> Miễn phí giao hàng từ 500K</div>
              <div className={styles.trust}><FiPackage size={14} /> Đóng gói an toàn</div>
              <div className={styles.trust}><FiRefreshCw size={14} /> Đổi trả trong 7 ngày</div>
            </div>

            {/* Specs */}
            {SPECS.length > 0 && (
              <div className={styles.specs}>
                {SPECS.map(s => (
                  <div key={s.label} className={styles.specRow}>
                    <span className={styles.specLabel}>{s.label}</span>
                    <span className={styles.specValue}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs: Description / Reviews */}
        <div className={styles.tabsSection}>
          <div className={styles.tabs}>
            {['description', 'specs', 'reviews'].map(t => (
              <button
                key={t}
                className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
                onClick={() => setTab(t)}
                id={`tab-${t}`}
              >
                {t === 'description' ? 'Mô tả' : t === 'specs' ? 'Thông số & Thông tin' : `Đánh giá (${product.review_count || 0})`}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {tab === 'description' && (
              <div className={styles.descContent}>
                <p>{product.description || 'Chưa có thông tin mô tả chi tiết.'}</p>
              </div>
            )}
            {tab === 'specs' && (
              <div className={styles.specsTable}>
                {SPECS.map(s => (
                  <div key={s.label} className={styles.specTableRow}>
                    <span className={styles.specTableLabel}>{s.label}</span>
                    <span className={styles.specTableValue}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === 'reviews' && (
              <div className={styles.reviewsSection}>
                {reviewsData?.total > 0 ? (
                  <>
                    <div className={styles.reviewStats}>
                      <div className={styles.reviewAvgBig}>{parseFloat(reviewsData.avg_rating).toFixed(1)}</div>
                      <div className={styles.reviewStarsLarge}>
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} size={20}
                            fill={i < Math.round(reviewsData.avg_rating) ? '#FFB347' : 'none'}
                            stroke={i < Math.round(reviewsData.avg_rating) ? '#FFB347' : '#ddd'}
                          />
                        ))}
                        <span>({reviewsData.total} đánh giá)</span>
                      </div>
                    </div>
                    <div className={styles.reviewList}>
                      {reviewsData.rows?.map(r => (
                        <div key={r.id} className={styles.reviewItem}>
                          <div className={styles.reviewHeader}>
                            <div className={styles.reviewerAvatar}>{r.reviewer_name?.[0]?.toUpperCase()}</div>
                            <div>
                              <p className={styles.reviewerName}>{r.reviewer_name}</p>
                              <div className={styles.reviewStars}>
                                {[...Array(5)].map((_, i) => (
                                  <FiStar key={i} size={12}
                                    fill={i < r.rating ? '#FFB347' : 'none'}
                                    stroke={i < r.rating ? '#FFB347' : '#ddd'}
                                  />
                                ))}
                              </div>
                            </div>
                            {r.is_verified_purchase ? <span className="badge badge-green" style={{ marginLeft: 'auto' }}>Đã mua hàng ✓</span> : null}
                          </div>
                          {r.title && <p className={styles.reviewTitle}>{r.title}</p>}
                          <p className={styles.reviewBody}>{r.body}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className={styles.noReviews}>
                    <p>Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nhận!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related?.length > 0 && (
          <section className={styles.relatedSection}>
            <div className={styles.relatedHeader}>
              <h2 className={styles.relatedTitle}>Có thể bạn cũng thích</h2>
              <Link to={`/shop?category=${product.category_slug}`} className="btn btn-outline btn-sm">
                Xem tất cả <FiChevronRight size={14} />
              </Link>
            </div>
            <div className="product-grid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
