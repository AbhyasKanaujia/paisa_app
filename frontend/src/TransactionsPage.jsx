import { useState, useEffect } from 'react'
import api from './api'

const TYPE_LABELS = { income: 'Income', expense: 'Expense', transfer: 'Transfer' }
const TYPE_COLORS = { income: 'text-stone-900', expense: 'text-red-600', transfer: 'text-stone-500' }

function fmt(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(null)
  const [accounts, setAccounts] = useState({})
  const [monthly, setMonthly] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    Promise.all([
      api.get('/transactions'),
      api.get('/accounts'),
      api.get(`/transactions/summary/monthly?year=${year}&month=${month}`),
    ]).then(([txnRes, accRes, monthRes]) => {
      setTransactions(txnRes.data)
      const map = {}
      for (const a of accRes.data.accounts) map[a.id] = a.name
      setAccounts(map)
      setMonthly(monthRes.data)
    }).catch(() => setError('Failed to load transactions.'))
  }, [])

  if (error) return <p className="font-mono text-xs text-stone-400 mt-8">{error}</p>
  if (!transactions) return <p className="font-mono text-xs text-stone-400 mt-8">Loading…</p>

  const monthName = new Date().toLocaleString('en-IN', { month: 'long' })

  return (
    <div>
      {/* Section header */}
      <div className="border-b-2 border-stone-900 pb-3 mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold text-stone-900" style={{ fontFamily: "'Lora', Georgia, serif" }}>
          Transactions
        </h1>
        {monthly && monthly.transaction_count > 0 && (
          <div className="flex gap-6 font-mono text-xs uppercase tracking-widest text-stone-400">
            <span>
              In&nbsp;<span className="text-stone-900">{fmt(monthly.income)}</span>
            </span>
            <span>
              Out&nbsp;<span className="text-red-600">{fmt(monthly.expenses)}</span>
            </span>
            <span>
              Net&nbsp;
              <span className={monthly.net >= 0 ? 'text-stone-900' : 'text-red-600'}>
                {monthly.net < 0 ? '−' : ''}₹{Math.abs(monthly.net).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </span>
            <span className="text-stone-300">{monthName}</span>
          </div>
        )}
      </div>

      {transactions.length === 0 ? (
        <p className="font-mono text-xs text-stone-400">No transactions yet. Ask the AI assistant to record one.</p>
      ) : (
        <div className="divide-y divide-stone-200 border border-stone-200">
          {/* Table header */}
          <div className="grid px-5 py-2 bg-stone-50" style={{ gridTemplateColumns: '1fr 2fr 1.5fr 1fr 1fr' }}>
            {['Date', 'Description', 'Account', 'Type', 'Amount'].map((h) => (
              <span key={h} className="font-mono text-[10px] uppercase tracking-widest text-stone-400">{h}</span>
            ))}
          </div>
          {transactions.map((t) => (
            <div key={t.id} className="grid px-5 py-4 hover:bg-stone-50 transition-colors items-center" style={{ gridTemplateColumns: '1fr 2fr 1.5fr 1fr 1fr' }}>
              <span className="font-mono text-xs text-stone-500">{fmtDate(t.date)}</span>
              <div>
                {t.description && (
                  <p className="text-sm text-stone-900" style={{ fontFamily: "'Lora', Georgia, serif" }}>{t.description}</p>
                )}
                {t.category && (
                  <p className="font-mono text-[10px] uppercase tracking-widest text-stone-400 mt-0.5">{t.category}</p>
                )}
                {!t.description && !t.category && (
                  <p className="font-mono text-xs text-stone-300">—</p>
                )}
              </div>
              <span className="font-mono text-xs text-stone-500">{accounts[t.account_id] ?? '—'}</span>
              <span className={`font-mono text-xs ${TYPE_COLORS[t.type] ?? 'text-stone-500'}`}>
                {TYPE_LABELS[t.type] ?? t.type}
              </span>
              <span className={`font-mono text-sm ${TYPE_COLORS[t.type] ?? 'text-stone-900'}`}>
                {t.type === 'expense' ? '−' : t.type === 'income' ? '+' : ''}{fmt(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
