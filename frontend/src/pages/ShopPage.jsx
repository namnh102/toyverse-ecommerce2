import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiFilter, FiGrid, FiList, FiX, FiChevronDown, FiSearch } from 'react-icons/fi'
import { productService, categoryService } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import styles from './ShopPage.module.css'

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Mới nhất' },
  { value: 'popular',   label: 'Phổ biến nhất' },
  { value: 'price_asc', label: 'Giá: Thấp đến Cao' },
  { value: 'price_desc',label: 'Giá: Cao xuống Thấp' },
  { value: 'rating',    label: 'Đánh giá cao' },
]

const STATUS_FILTERS = [
  { value: '',        label: 'Tất cả' },
  { value: 'new',     label: 'Mới ✨' },
  { value: 'hot',     label: 'Hot 🔥' },
  { value: 'limited', label: 'Giới hạn ⭐' },
]

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilter, setShowFilter] = useState(false)
  const [layout, setLayout] = useState('grid')
  const [localSearch, setLocalSearch] = useState(searchParams.get('q') || '')

  // Read filters from URL
  const filters = {
    page:           parseInt(searchParams.get('page')) || 1,
    sort:           searchParams.get('sort') || 'newest',
    category:       searchParams.get('category') || '',
    status:         searchParams.get('status') || '',
    is_blind_box:   searchParams.get('is_blind_box') || '',
    is_featured:    searchParams.get('is_featured') || '',
    is_best_seller: searchParams.get('is_best_seller') || '',
    min_price:      searchParams.get('min_price') || '',
    max_price:      searchParams.get('max_price') || '',
    q:              searchParams.get('q') || '',
    collection:     searchParams.get('collection') || '',
  }

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setFilter('q', localSearch.trim())
  }

  const clearAll = () => {
    setSearchParams({})
    setLocalSearch('')
  }

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll({ active: true }).then(r => r.data),
  })

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getAll({ ...filters, limit: 16 }).then(r => r.data),
    keepPreviousData: true,
  })

  const activeFiltersCount = [
    filters.category, filters.status, filters.is_blind_box,
    filters.is_featured, filters.is_best_seller, filters.min_price, filters.q
  ].filter(Boolean).length

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className="container">
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span>Cửa hàng</span>
            {filters.category && <><span>/</span><span style={{ textTransform: 'capitalize' }}>{filters.category.replace('-', ' ')}</span></>}
          </nav>
          <h1 className={styles.pageTitle}>
            {filters.q ? `Kết quả cho "${filters.q}"` :
             filters.category ? `${catData?.categories?.find(c => c.slug === filters.category)?.name || filters.category}` :
             filters.is_blind_box === 'true' ? 'Blind Box 🎁' :
             filters.is_best_seller === 'true' ? 'Bán chạy nhất 🔥' :
             filters.status === 'new' ? 'Hàng mới ✨' : 'Tất cả sản phẩm'}
          </h1>
          {data && <p className={styles.resultCount}>Tìm thấy {data.total} sản phẩm</p>}
        </div>
      </div>

      <div className="container">
        {/* Toolbar */}
        <div className={styles.toolbar}>
          {/* Search */}
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <FiSearch size={16} style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className={styles.searchInput}
              id="shop-search"
            />
            {localSearch && (
              <button type="button" onClick={() => { setLocalSearch(''); setFilter('q', '') }}>
                <FiX size={14} />
              </button>
            )}
          </form>

          <div className={styles.toolbarRight}>
            {/* Filter toggle (mobile) */}
            <button
              className={`btn btn-outline btn-sm ${styles.filterBtn}`}
              onClick={() => setShowFilter(!showFilter)}
              id="filter-toggle"
            >
              <FiFilter size={14} />
              Bộ lọc
              {activeFiltersCount > 0 && <span className={styles.filterCount}>{activeFiltersCount}</span>}
            </button>

            {/* Sort */}
            <div className={styles.sortWrap}>
              <select
                value={filters.sort}
                onChange={e => setFilter('sort', e.target.value)}
                className={styles.sortSelect}
                id="sort-select"
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <FiChevronDown size={14} className={styles.sortIcon} />
            </div>

            {/* Layout toggle */}
            <div className={styles.layoutToggle}>
              <button
                className={`${styles.layoutBtn} ${layout === 'grid' ? styles.layoutBtnActive : ''}`}
                onClick={() => setLayout('grid')} aria-label="Grid view"
              >
                <FiGrid size={16} />
              </button>
              <button
                className={`${styles.layoutBtn} ${layout === 'list' ? styles.layoutBtnActive : ''}`}
                onClick={() => setLayout('list')} aria-label="List view"
              >
                <FiList size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {/* Sidebar Filters */}
          <aside className={`${styles.sidebar} ${showFilter ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarHeader}>
              <h3 className={styles.sidebarTitle}>Bộ lọc</h3>
              {activeFiltersCount > 0 && (
                <button className="btn btn-text" onClick={clearAll} style={{ fontSize: '13px' }}>
                  Xóa tất cả
                </button>
              )}
            </div>

            {/* Categories */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterTitle}>Danh mục</h4>
              <div className={styles.filterList}>
                <button
                  className={`${styles.filterItem} ${!filters.category ? styles.filterItemActive : ''}`}
                  onClick={() => setFilter('category', '')}
                >
                  Tất cả danh mục
                </button>
                {catData?.categories?.map(cat => (
                  <button
                    key={cat.id}
                    className={`${styles.filterItem} ${filters.category === cat.slug ? styles.filterItemActive : ''}`}
                    onClick={() => setFilter('category', filters.category === cat.slug ? '' : cat.slug)}
                    id={`filter-cat-${cat.slug}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterTitle}>Trạng thái</h4>
              <div className={styles.filterList}>
                {STATUS_FILTERS.map(s => (
                  <button
                    key={s.value}
                    className={`${styles.filterItem} ${filters.status === s.value ? styles.filterItemActive : ''}`}
                    onClick={() => setFilter('status', s.value)}
                    id={`filter-status-${s.value || 'all'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Special */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterTitle}>Loại</h4>
              <label className={styles.checkboxLabel} htmlFor="filter-blind-box">
                <input
                  id="filter-blind-box"
                  type="checkbox"
                  checked={filters.is_blind_box === 'true'}
                  onChange={e => setFilter('is_blind_box', e.target.checked ? 'true' : '')}
                />
                <span>Chỉ Blind Box</span>
              </label>
              <label className={styles.checkboxLabel} htmlFor="filter-best-seller">
                <input
                  id="filter-best-seller"
                  type="checkbox"
                  checked={filters.is_best_seller === 'true'}
                  onChange={e => setFilter('is_best_seller', e.target.checked ? 'true' : '')}
                />
                <span>Bán chạy nhất</span>
              </label>
            </div>

            {/* Price Range */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterTitle}>Khoảng giá</h4>
              <div className={styles.priceInputs}>
                <input
                  type="number"
                  min="0"
                  placeholder="Tối thiểu"
                  value={filters.min_price}
                  onChange={e => setFilter('min_price', e.target.value)}
                  className={styles.priceInput}
                  id="filter-min-price"
                />
                <span>—</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Tối đa"
                  value={filters.max_price}
                  onChange={e => setFilter('max_price', e.target.value)}
                  className={styles.priceInput}
                  id="filter-max-price"
                />
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className={styles.main}>
            {isLoading ? (
              <div className={layout === 'grid' ? 'product-grid' : styles.listGrid}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-xl)' }} />
                    <div className="skeleton" style={{ height: '14px', width: '60%' }} />
                    <div className="skeleton" style={{ height: '18px' }} />
                    <div className="skeleton" style={{ height: '20px', width: '40%' }} />
                  </div>
                ))}
              </div>
            ) : data?.rows?.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔍</div>
                <h3>Không tìm thấy sản phẩm nào</h3>
                <p>Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                <button className="btn btn-primary" onClick={clearAll}>Xóa bộ lọc</button>
              </div>
            ) : (
              <>
                <div className={layout === 'grid' ? 'product-grid' : styles.listGrid}
                     style={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                  {data?.rows?.map(p => <ProductCard key={p.id} product={p} layout={layout} />)}
                </div>

                {/* Pagination */}
                {data?.totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setFilter('page', filters.page - 1)}
                      disabled={filters.page <= 1}
                      id="pagination-prev"
                    >
                      Trước
                    </button>
                    <div className={styles.pageNumbers}>
                      {[...Array(data.totalPages)].map((_, i) => {
                        const p = i + 1
                        if (p === 1 || p === data.totalPages || Math.abs(p - filters.page) <= 1) {
                          return (
                            <button
                              key={p}
                              className={`${styles.pageNum} ${p === filters.page ? styles.pageNumActive : ''}`}
                              onClick={() => setFilter('page', p)}
                              id={`page-${p}`}
                            >
                              {p}
                            </button>
                          )
                        }
                        if (Math.abs(p - filters.page) === 2) return <span key={p} className={styles.pageEllipsis}>...</span>
                        return null
                      })}
                    </div>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setFilter('page', filters.page + 1)}
                      disabled={filters.page >= data.totalPages}
                      id="pagination-next"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
