/**
 * Format number as Vietnamese currency (VNĐ)
 * @param {number} amount
 * @returns {string} e.g. "320.000 ₫"
 */
export const formatPrice = (amount) => {
  if (amount === null || amount === undefined) return ''
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date string
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

/**
 * Truncate string
 */
export const truncate = (str = '', maxLen = 100) =>
  str.length > maxLen ? str.slice(0, maxLen) + '...' : str

/**
 * Get primary image from product
 */
export const getProductImage = (product) =>
  product?.primary_image ||
  product?.images?.[0]?.image_url ||
  null

/**
 * Compute discount percentage
 */
export const getDiscount = (price, comparePrice) => {
  if (!comparePrice || comparePrice <= price) return null
  return Math.round((1 - price / comparePrice) * 100)
}

/**
 * Format order status
 */
export const ORDER_STATUS_MAP = {
  pending:   { label: 'Pending',    color: '#FFB347' },
  confirmed: { label: 'Confirmed',  color: '#7BC0FF' },
  shipping:  { label: 'Shipping',   color: '#C9B8FF' },
  completed: { label: 'Completed',  color: '#6BCB8B' },
  cancelled: { label: 'Cancelled',  color: '#FF7B7B' },
}

export const PAYMENT_STATUS_MAP = {
  pending:  { label: 'Unpaid',   color: '#FFB347' },
  paid:     { label: 'Paid',     color: '#6BCB8B' },
  failed:   { label: 'Failed',   color: '#FF7B7B' },
  refunded: { label: 'Refunded', color: '#7BC0FF' },
}
