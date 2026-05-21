import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'
import toast from 'react-hot-toast'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      isOpen: false,
      isLoading: false,

      setCart: (items, subtotal) => set({ items, subtotal }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      fetchCart: async () => {
        try {
          const { data } = await api.get('/cart')
          set({ items: data.items, subtotal: data.subtotal })
        } catch { /* Guest — cart stays empty */ }
      },

      addToCart: async (productId, quantity = 1) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/cart/add', { product_id: productId, quantity })
          set({ items: data.items, subtotal: data.subtotal, isLoading: false, isOpen: true })
          toast.success('Added to cart! 🛍️')
          return true
        } catch (err) {
          set({ isLoading: false })
          toast.error(err.response?.data?.message || 'Could not add to cart')
          return false
        }
      },

      updateQuantity: async (productId, quantity) => {
        try {
          const { data } = await api.put('/cart/update', { product_id: productId, quantity })
          set({ items: data.items, subtotal: data.subtotal })
        } catch (err) {
          toast.error(err.response?.data?.message || 'Update failed')
        }
      },

      removeItem: async (productId) => {
        try {
          const { data } = await api.delete('/cart/remove', { data: { product_id: productId } })
          set({ items: data.items, subtotal: data.subtotal })
          toast.success('Item removed')
        } catch (err) {
          toast.error(err.response?.data?.message || 'Remove failed')
        }
      },

      clearCart: () => set({ items: [], subtotal: 0 }),

      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },
    }),
    {
      name: 'toyverse-cart',
      partialize: (state) => ({ items: state.items, subtotal: state.subtotal }),
    }
  )
)
