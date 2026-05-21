import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi'
import { productService, categoryService } from '../../services/api'
import { formatPrice } from '../../utils/format'
import toast from 'react-hot-toast'
import styles from './AdminPage.module.css'

export default function AdminProducts() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => productService.getAll({ page, limit: 20, q: search }).then(r => r.data),
  })

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll().then(r => r.data),
  })

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa "${name}"?`)) return
    try {
      await productService.delete(id)
      toast.success('Đã xóa sản phẩm')
      qc.invalidateQueries(['admin-products'])
    } catch { 
      toast.error('Xóa thất bại') 
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Sản phẩm</h1>
          <p className={styles.pageCount}>{data?.total || 0} tổng số sản phẩm</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditProduct(null); setShowForm(true); }} id="add-product">
          <FiPlus size={16} /> Thêm sản phẩm
        </button>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className={styles.searchInput}
            id="admin-product-search"
          />
          {search && <button onClick={() => setSearch('')}><FiX size={14} /></button>}
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Đã bán</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 14, width: '80%' }} /></td>
                  ))}
                </tr>
              ))
            ) : 
            data?.rows?.map(p => (
              <tr key={p.id}>
                <td>
                  <div className={styles.productCell}>
                    <div className={styles.productThumb}>
                      {p.primary_image ? <img src={p.primary_image} alt={p.name} /> : <span>🎁</span>}
                    </div>
                    <div>
                      <p className={styles.productName}>{p.name}</p>
                      <p className={styles.productSku}>{p.sku || `#${p.id}`}</p>
                    </div>
                  </div>
                </td>
                <td><span className={styles.catBadge}>{p.category_name}</span></td>
                <td className={styles.priceCell}>{formatPrice(p.price)}</td>
                <td>
                  <span className={p.stock_qty < 10 ? styles.lowStock : styles.normalStock}>
                    {p.stock_qty}
                  </span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${styles['status_' + p.status]}`}>
                    {p.status}
                  </span>
                </td>
                <td className={styles.soldCell}>{p.total_sold?.toLocaleString()}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      // Khi click thì gán sản phẩm p vào state editProduct và bật showForm lên true
                      onClick={() => { setEditProduct(p); setShowForm(true); }}
                      title="Edit"
                      id={`edit-product-${p.id}`}
                    >
                      {/* Icon sửa */}
                      <FiEdit2 size={14} />
                    </button>
                    {/* Nút bấm để Xóa sản phẩm */}
                    <button
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      // Khi click thì gọi hàm handleDelete với id và tên sản phẩm
                      onClick={() => handleDelete(p.id, p.name)}
                      title="Delete"
                      id={`delete-product-${p.id}`}
                    >
                      {/* Icon thùng rác */}
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Khối phân trang: Chỉ hiện nếu tổng số trang (totalPages) > 1 */}
        {data?.totalPages > 1 && (
          <div className={styles.pagination}>
            {/* Nút 'Trước' để lùi 1 trang. Vô hiệu hóa (disabled) nếu đang ở trang 1 */}
            <button className="btn btn-outline btn-sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Trước</button>
            {/* Chữ hiển thị [Trang hiện tại] / [Tổng số trang] */}
            <span>{page} / {data.totalPages}</span>
            {/* Nút 'Sau' để tới 1 trang. Vô hiệu hóa (disabled) nếu đang ở trang cuối cùng */}
            <button className="btn btn-outline btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages}>Sau</button>
          </div>
        )}
      </div>

      {/* Hiển thị Modal Form Thêm/Sửa sản phẩm nếu biến showForm là true */}
      {showForm && (
        <ProductFormModal
          product={editProduct} // Truyền vào thông tin sản phẩm cần sửa (nếu là Thêm mới thì là null)
          categories={catData?.categories || []} // Truyền danh sách danh mục cho Form chọn
          onClose={() => setShowForm(false)} // Sự kiện khi bấm tắt Modal -> set showForm = false
          // Sự kiện khi lưu thành công: tắt Modal và báo React Query tải lại danh sách
          onSuccess={() => { setShowForm(false); qc.invalidateQueries(['admin-products']); }}
        />
      )}
    </div>
  )
}

function ProductFormModal({ product, categories, onClose, onSuccess }) {
  const isEdit = !!product?.id
  const [form, setForm] = useState({
    name: product?.name || '', 
    description: product?.description || '', 
    short_description: product?.short_description || '', 
    price: product?.price || '', 
    compare_price: product?.compare_price || '', // Giá gốc (để hiển thị giảm giá)
    stock_qty: product?.stock_qty || 0, // Tồn kho
    category_id: product?.category_id || '', // ID danh mục
    brand: product?.brand || '', // Thương hiệu
    material: product?.material || '', // Chất liệu
    dimensions: product?.dimensions || '', // Kích thước
    status: product?.status || 'normal', // Trạng thái mặc định là 'normal'
    is_blind_box: product?.is_blind_box ? '1' : '0', // Đánh dấu là blind box (hộp mù)
    is_featured: product?.is_featured ? '1' : '0', // Đánh dấu là sản phẩm nổi bật
    is_best_seller: product?.is_best_seller ? '1' : '0', // Đánh dấu là bán chạy
    sku: product?.sku || '', // Mã sku
  })
  // State lưu danh sách file ảnh tải lên
  const [files, setFiles] = useState([])
  // State lưu trạng thái đang gửi API (để disable nút bấm, tránh click nhiều lần)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      files.forEach(f => fd.append('images', f))

      if (isEdit) {
        await productService.update(product.id, fd)
        toast.success('Đã cập nhật sản phẩm!')
      } else {
        await productService.create(fd)
        toast.success('Đã tạo sản phẩm!')
      }
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lưu thất bại')
    } finally {
      setSaving(false)
    }
  }

  return (

    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          <button className={styles.modalClose} onClick={onClose}><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGrid2}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Tên sản phẩm *</label>
              <input className="form-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} id="pf-name" />
            </div>
            <div className="form-group">
              <label className="form-label">SKU</label>
              <input className="form-input" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} id="pf-sku" placeholder="e.g. BX-001" />
            </div>
            <div className="form-group">
              <label className="form-label">Danh mục *</label>
              <select className="form-input" required value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} id="pf-category">
                <option value="">Chọn danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Giá (VNĐ) *</label>
              <input type="number" className="form-input" required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} id="pf-price" min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Giá ban đầu</label>
              <input type="number" className="form-input" value={form.compare_price} onChange={e => setForm(f => ({ ...f, compare_price: e.target.value }))} id="pf-compare-price" min="0" placeholder="Original price" />
            </div>
            <div className="form-group">
              <label className="form-label">Số lượng tồn</label>
              <input type="number" className="form-input" value={form.stock_qty} onChange={e => setForm(f => ({ ...f, stock_qty: e.target.value }))} id="pf-stock" min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} id="pf-status">
                {['normal','new','hot','limited','sold_out'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Thương hiệu</label>
              <input className="form-input" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} id="pf-brand" />
            </div>
            <div className="form-group">
              <label className="form-label">Chất liệu</label>
              <input className="form-input" value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} id="pf-material" />
            </div>
            <div className="form-group">
              <label className="form-label">Kích thước</label>
              <input className="form-input" value={form.dimensions} onChange={e => setForm(f => ({ ...f, dimensions: e.target.value }))} id="pf-dimensions" placeholder="VD: 10cm × 8cm × 6cm" />
            </div>
            <div className={styles.checkboxRow}>
              {[['is_blind_box','Blind Box'],['is_featured','Featured'],['is_best_seller','Best Seller']].map(([k,l]) => (
                <label key={k} className={styles.checkboxLabel}>
                  <input type="checkbox" checked={form[k]==='1'} onChange={e => setForm(f => ({ ...f, [k]: e.target.checked ? '1' : '0' }))} id={`pf-${k}`} />
                  <span>{l}</span>
                </label>
              ))}
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Mô tả ngắn</label>
              <input className="form-input" value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} id="pf-short-desc" placeholder="Mô tả tóm tắt" />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Mô tả chi tiết</label>
              <textarea className="form-input" rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} id="pf-description" style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Hình ảnh sản phẩm</label>
              <input type="file" multiple accept="image/*" onChange={e => setFiles(Array.from(e.target.files))} className={styles.fileInput} id="pf-images" />
              {files.length > 0 && <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 4 }}>đã chọn {files.length} tệp</p>}
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={saving} id="pf-save">
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

