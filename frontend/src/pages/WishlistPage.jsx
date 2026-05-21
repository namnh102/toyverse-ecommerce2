import { useQuery } from '@tanstack/react-query'
import { userService } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import { Link } from 'react-router-dom'
import { FiHeart } from 'react-icons/fi'

export default function WishlistPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => userService.getWishlist().then(r => r.data),
  })

  return (
    <div style={{ padding: '48px 0 80px' }}>
      <div className="container">
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 900 }}>
            <FiHeart style={{ display: 'inline', marginRight: 12, color: 'var(--color-primary-dark)' }} />
            Danh sách yêu thích
          </h1>
          {data?.items?.length > 0 && (
            <p style={{ color: 'var(--color-text-muted)', marginTop: 8 }}>{data.items.length} sản phẩm đã lưu</p>
          )}
        </div>

        {isLoading ? (
          <div className="product-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-xl)', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 18 }} />
              </div>
            ))}
          </div>
        ) : !data?.items?.length ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>💝</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 8 }}>
              Danh sách yêu thích đang trống
            </h3>
            <p style={{ marginBottom: 24 }}>Lưu lại những sản phẩm yêu thích và quay lại mua sau nhé!</p>
            <Link to="/shop" className="btn btn-primary btn-lg">Khám phá Cửa hàng</Link>
          </div>
        ) : (
          <div className="product-grid">
            {data.items.map(item => (
              <ProductCard key={item.product_id} product={{ ...item, id: item.product_id, primary_image: item.image, avg_rating: 0, review_count: 0, is_blind_box: false, is_featured: false, is_best_seller: false }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
