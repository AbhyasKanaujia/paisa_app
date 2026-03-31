import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authApi from '../api/auth'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      register: async (name, email, password) => {
        const data = await authApi.register(name, email, password)
        set({ user: data.user, token: data.token })
      },

      login: async (email, password) => {
        const data = await authApi.login(email, password)
        set({ user: data.user, token: data.token })
      },

      logout: () => set({ user: null, token: null }),

      isAuthenticated: () => !!get().token,
    }),
    { name: 'paisa-auth' }
  )
)

export default useAuthStore
