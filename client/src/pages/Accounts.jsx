import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import useAccountStore from '../store/useAccountStore'
import AddAccountModal from '../components/AddAccountModal'

const TYPE_LABEL = {
  bank: 'Bank',
  cash: 'Cash',
  credit_card: 'Credit card',
}

export default function Accounts() {
  const [showModal, setShowModal] = useState(false)

  const token = useAuthStore((s) => s.token)
  const { accounts, loading, error, fetchAccounts } = useAccountStore()

  useEffect(() => {
    fetchAccounts(token)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-lg mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <Link to="/" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
              ← Home
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight mt-1">Accounts</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-gray-950 font-medium rounded-lg px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
          >
            Add account
          </button>
        </div>

        {loading && <p className="text-gray-500 text-sm">Loading…</p>}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {!loading && !error && accounts.length === 0 && (
          <p className="text-gray-500 text-sm">No accounts yet.</p>
        )}

        {accounts.map((account) => (
          <div
            key={account._id}
            className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex items-center justify-between"
          >
            <div>
              <p className="text-white font-medium">{account.name}</p>
              <p className="text-gray-500 text-sm">{TYPE_LABEL[account.type]}</p>
            </div>
            <p className="text-white font-semibold">
              {account.currency}{' '}
              {account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>

      {showModal && <AddAccountModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
