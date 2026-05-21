import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          set({ user: data.user, token: data.token, isLoading: false })
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Login failed' }
        }
      },

      register: async (formData) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/register', formData)
          set({ user: data.user, token: data.token, isLoading: false })
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Registration failed' }
        }
      },

      logout: () => {
        set({ user: null, token: null })
      },

      refreshUser: async () => {
        const { token } = get()
        if (!token) return
        try {
          const { data } = await api.get('/auth/me')
          set({ user: data.user })
        } catch {
          set({ user: null, token: null })
        }
      },

      isAuthenticated: () => !!get().token,
      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'toyverse-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
