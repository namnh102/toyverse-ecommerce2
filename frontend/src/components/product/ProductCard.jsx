import { Link } from 'react-router-dom'
import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi'
import { useCartStore } from '../../store/cartStore'
import { userService } from '../../services/api'
import { formatPrice } from '../../utils/format'
import toast from 'react-hot-toast'
import styles from './ProductCard.module.css'

const STATUS_BADGE = {
  hot:      { label: 'Hot 🔥', cls: 'badge-pink' },
  new:      { label: 'Mới ✨',  cls: 'badge-green' },
  limited:  { label: 'Giới hạn', cls: 'badge-dark' },
  sold_out: { label: 'Hết hàng',cls: 'badge-peach' },
}

export default function ProductCard({ product, layout = 'grid' }) {
  const { addToCart, isLoading } = useCartStore()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock_qty === 0) return
    await addToCart(product.id, 1)
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const { data } = await userService.toggleWishlist(product.id)
      toast(data.added ? '❤️ Đã thêm vào yêu thích!' : '💔 Đã xóa khỏi yêu thích', { icon: '' })
    } catch {
      toast.error('Đăng nhập để lưu yêu thích')
    }
  }

  const badge = STATUS_BADGE[product.status]
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null

  const image = product.primary_image || product.images?.[0]?.image_url

  return (
    <Link to={`/products/${product.slug || product.id}`} className={`${styles.card} ${layout === 'list' ? styles.list : ''}`}>
      {/* Image */}
      <div className={styles.imageWrap}>
        {image ? (
          <img
            src={image}
            alt={product.name}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderEmoji}>🎁</span>
          </div>
        )}

        {/* Badges */}
        <div className={styles.badges}>
          {badge && <span className={`badge ${badge.cls}`}>{badge.label}</span>}
          {product.is_blind_box ? <span className="badge badge-lavender">Blind Box</span> : null}
          {discount ? <span className="badge badge-yellow">-{discount}%</span> : null}
        </div>

        {/* Wishlist */}
        <button className={styles.wishlistBtn} onClick={handleWishlist} aria-label="Toggle wishlist">
          <FiHeart size={16} />
        </button>

        {/* Quick add — shows on hover */}
        {product.stock_qty > 0 && (
          <div className={styles.quickAdd}>
            <button
              className="btn btn-primary btn-sm btn-full"
              onClick={handleAddToCart}
              disabled={isLoading}
              id={`quick-add-${product.id}`}
            >
              <FiShoppingBag size={14} />
              {isLoading ? 'Đang thêm...' : 'Thêm vào giỏ'}
            </button>
          </div>
        )}

        {product.stock_qty === 0 && (
          <div className={styles.soldOutOverlay}>
            <span>Hết hàng</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className={styles.body}>
        <p className={styles.category}>{product.category_name}</p>
        <h3 className={styles.name}>{product.name}</h3>

        {/* Rating */}
        {product.review_count > 0 && (
          <div className={styles.rating}>
            <span className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={12}
                  fill={i < Math.round(product.avg_rating) ? '#FFB347' : 'none'}
                  stroke={i < Math.round(product.avg_rating) ? '#FFB347' : '#ccc'}
                />
              ))}
            </span>
            <span className={styles.ratingText}>({product.review_count})</span>
          </div>
        )}

        {/* Price */}
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {product.compare_price && (
            <span className={styles.comparePrice}>{formatPrice(product.compare_price)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
