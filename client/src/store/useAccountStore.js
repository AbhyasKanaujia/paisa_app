import { create } from 'zustand'
import * as accountsApi from '../api/accounts'

const useAccountStore = create((set) => ({
  accounts: [],
  loading: false,
  error: null,

  fetchAccounts: async (token) => {
    set({ loading: true, error: null })
    try {
      const data = await accountsApi.getAccounts(token)
      set({ accounts: data.accounts, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  addAccount: async (data, token) => {
    const result = await accountsApi.createAccount(data, token)
    set((s) => ({ accounts: [result.account, ...s.accounts] }))
  },
}))

export default useAccountStore
