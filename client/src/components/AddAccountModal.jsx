import { useState } from 'react'
import useAuthStore from '../store/useAuthStore'
import useAccountStore from '../store/useAccountStore'

const inputClass =
  'w-full bg-gray-900 text-white placeholder-gray-600 border border-gray-800 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-gray-600 transition-colors'

export default function AddAccountModal({ onClose }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('bank')
  const [balance, setBalance] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const token = useAuthStore((s) => s.token)
  const addAccount = useAccountStore((s) => s.addAccount)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return setError('Account name is required')
    setError('')
    setLoading(true)
    try {
      await addAccount({ name, type, balance: balance === '' ? 0 : Number(balance), currency }, token)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
      <div className="bg-gray-950 border border-gray-800 rounded-xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-white font-semibold text-lg">Add account</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Account name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            className={inputClass}
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputClass}
          >
            <option value="bank">Bank</option>
            <option value="cash">Cash</option>
            <option value="credit_card">Credit card</option>
          </select>

          <input
            type="number"
            placeholder="Opening balance (0)"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className={inputClass}
          />

          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={inputClass}
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-800 text-gray-400 hover:text-white rounded-lg px-4 py-3 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-white text-gray-950 font-medium rounded-lg px-4 py-3 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving…' : 'Add account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
