import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import { categoryService } from '../../services/api'
import toast from 'react-hot-toast'
import styles from './AdminPage.module.css'

export default function AdminCategories() {
  const [showForm, setShowForm] = useState(false)
  const [editCat, setEditCat] = useState(null)
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoryService.getAll().then(r => r.data),
  })

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa danh mục "${name}"?`)) return
    try {
      await categoryService.delete(id)
      toast.success('Đã xóa danh mục')
      qc.invalidateQueries(['admin-categories'])
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Xóa thất bại') 
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Danh mục</h1>
          <p className={styles.pageCount}>{data?.categories?.length || 0} danh mục</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditCat(null); setShowForm(true); }} id="add-category">
          <FiPlus size={16} /> Thêm danh mục
        </button>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead><tr><th>Danh mục</th><th>Đường dẫn</th><th>Sản phẩm</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => <tr key={i}>{[...Array(5)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14, width: '80%' }} /></td>)}</tr>)
            ) : 
            data?.categories?.map(cat => (
              <tr key={cat.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {cat.image_url && <img src={cat.image_url} alt={cat.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />}
                    <div>
                      <p className={styles.productName}>{cat.name}</p>
                      {cat.description && <p className={styles.productSku}>{cat.description.slice(0, 50)}</p>}
                    </div>
                  </div>
                </td>
                <td><code style={{ fontSize: '12px', background: 'var(--color-bg-soft)', padding: '2px 6px', borderRadius: 4 }}>{cat.slug}</code></td>
                <td>{cat.product_count || 0}</td>
                <td><span className={`${styles.statusBadge} ${cat.is_active ? styles.status_new : styles.status_sold_out}`}>{cat.is_active ? 'Hoạt động' : 'Đã ẩn'}</span></td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={() => { setEditCat(cat); setShowForm(true); }} id={`edit-cat-${cat.id}`}><FiEdit2 size={14} /></button>
                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(cat.id, cat.name)} id={`delete-cat-${cat.id}`}><FiTrash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <CategoryFormModal
          category={editCat}
          onClose={() => setShowForm(false)} 
          onSuccess={() => { 
            setShowForm(false); 
            qc.invalidateQueries(['admin-categories']); 
            qc.invalidateQueries(['categories']); 
          }}
        />
      )}
    </div>
  )
}

function CategoryFormModal({ category, onClose, onSuccess }) {
  const isEdit = !!category?.id
  const [form, setForm] = useState({
    name: category?.name || '', 
    slug: category?.slug || '', 
    description: category?.description || '', 
    meta_title: category?.meta_title || '', 
    is_active: category?.is_active ?? 1, 
    sort_order: category?.sort_order || 0,
  })
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault() // Chặn sự kiện tải lại trang của form
    setSaving(true) // Đổi trạng thái sang đang lưu
    try {
      // Khởi tạo FormData để gửi được cả text và file
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      // Nếu có chọn file ảnh mới thì thêm vào FormData
      if (file) fd.append('image', file)
      
      if (isEdit) {
        // Cập nhật nếu đang ở chế độ sửa
        await categoryService.update(category.id, fd)
        toast.success('Đã cập nhật danh mục!')
      } else {
        // Tạo mới nếu đang ở chế độ thêm
        await categoryService.create(fd)
        toast.success('Đã tạo danh mục!')
      }
      onSuccess() // Gọi hàm báo thành công (để đóng Modal và load lại data)
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Lưu thất bại') 
    } finally { 
      setSaving(false) // Trả về trạng thái bình thường
    }
  }

  // Hàm tự động tạo URL tĩnh (slug) từ tên nhập vào
  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')

  return (
    // Lớp phủ nền mờ, click vào đây để tắt Modal
    <div className={styles.modalOverlay} onClick={onClose}>
      {/* Box nội dung form */}
      <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        {/* Header form */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{isEdit ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
          <button className={styles.modalClose} onClick={onClose}><FiX size={20} /></button>
        </div>
        {/* Nội dung Form */}
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Tên danh mục */}
            <div className="form-group">
              <label className="form-label">Tên *</label>
              {/* Khi nhập Tên, tự động điền luôn phần Slug */}
              <input className="form-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) }))} id="cf-name" />
            </div>
            {/* Slug (URL) */}
            <div className="form-group">
              <label className="form-label">Đường dẫn</label>
              <input className="form-input" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} id="cf-slug" />
            </div>
            {/* Mô tả */}
            <div className="form-group">
              <label className="form-label">Mô tả</label>
              <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} id="cf-desc" style={{ resize: 'vertical' }} />
            </div>
            {/* Thứ tự */}
            <div className="form-group">
              <label className="form-label">Thứ tự</label>
              <input type="number" className="form-input" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} id="cf-sort" min="0" />
            </div>
            {/* Checkbox Trạng thái Hoạt động */}
            <label className={styles.checkboxLabel} htmlFor="cf-active">
              <input id="cf-active" type="checkbox" checked={!!form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked ? 1 : 0 }))} />
              <span>Hoạt động</span>
            </label>
            {/* Chọn ảnh */}
            <div className="form-group">
              <label className="form-label">Hình ảnh</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className={styles.fileInput} id="cf-image" />
            </div>
          </div>
          {/* Footer form chứa nút Hủy/Lưu */}
          <div className={styles.modalFooter}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={saving} id="cf-save">
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
