import { useState, useEffect } from 'react'
import api from './api'

const TYPE_LABELS = {
  checking: 'Checking',
  savings: 'Savings',
  credit: 'Credit',
  cash: 'Cash',
}

function fmt(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function AccountsPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  async function load() {
    try {
      const res = await api.get('/accounts')
      setData(res.data)
    } catch {
      setError('Failed to load accounts.')
    }
  }

  useEffect(() => { load() }, [])

  if (error) return (
    <p className="font-mono text-xs text-stone-400 mt-8">{error}</p>
  )

  if (!data) return (
    <p className="font-mono text-xs text-stone-400 mt-8">Loading…</p>
  )

  const { accounts, net_worth } = data

  return (
    <div>
      {/* Section header */}
      <div className="border-b-2 border-stone-900 pb-3 mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold text-stone-900" style={{ fontFamily: "'Lora', Georgia, serif" }}>
          Accounts
        </h1>
        <span className="font-mono text-xs uppercase tracking-widest text-stone-400">
          Net worth&nbsp;
          <span className={`text-sm ${net_worth >= 0 ? 'text-stone-900' : 'text-red-600'}`}>
            {fmt(net_worth)}
          </span>
        </span>
      </div>

      {accounts.length === 0 ? (
        <p className="font-mono text-xs text-stone-400">No accounts yet. Ask the AI assistant to create one.</p>
      ) : (
        <div className="divide-y divide-stone-200 border border-stone-200">
          {/* Table header */}
          <div className="grid grid-cols-4 px-5 py-2 bg-stone-50">
            {['Name', 'Type', 'Currency', 'Balance'].map((h) => (
              <span key={h} className="font-mono text-[10px] uppercase tracking-widest text-stone-400">{h}</span>
            ))}
          </div>
          {accounts.map((a) => (
            <div key={a.id} className="grid grid-cols-4 px-5 py-4 hover:bg-stone-50 transition-colors">
              <span className="text-sm text-stone-900" style={{ fontFamily: "'Lora', Georgia, serif" }}>{a.name}</span>
              <span className="font-mono text-xs text-stone-500">{TYPE_LABELS[a.type] ?? a.type}</span>
              <span className="font-mono text-xs text-stone-500">{a.currency}</span>
              <span className={`font-mono text-sm ${a.type === 'credit' ? 'text-red-600' : 'text-stone-900'}`}>
                {fmt(a.balance)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
