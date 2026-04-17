import ChatPanel from './ChatPanel'

export default function HomePage({ onLogout }) {
  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden" style={{ fontFamily: "'Lora', Georgia, serif" }}>

      {/* ── Header ── */}
      <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-stone-200">
        <span className="text-lg font-semibold tracking-tight text-stone-900">paisa</span>
        <button
          onClick={onLogout}
          className="font-mono text-xs uppercase tracking-widest text-stone-400 hover:text-stone-700 transition-colors"
        >
          Log out
        </button>
      </header>

      {/* ── Main area (70%) ── */}
      <main className="overflow-y-auto px-8 py-10" style={{ flex: '0 0 70%' }}>
        <p className="text-2xl text-stone-800 leading-snug">Welcome back.</p>
        <p className="mt-2 text-sm text-stone-400 font-mono">Your dashboard will live here.</p>

        {/* placeholder grid for future content */}
        <div className="mt-10 grid grid-cols-3 gap-4">
          {['Accounts', 'Transactions', 'Summary'].map((label) => (
            <div key={label} className="border border-stone-200 p-5">
              <p className="text-xs font-mono uppercase tracking-widest text-stone-300">{label}</p>
              <p className="mt-3 text-2xl font-semibold text-stone-200">—</p>
            </div>
          ))}
        </div>
      </main>

      {/* ── Divider ── */}
      <div className="shrink-0 border-t-2 border-stone-900" />

      {/* ── Chat panel (30%) ── */}
      <div className="overflow-hidden" style={{ flex: '0 0 30%' }}>
        <ChatPanel />
      </div>

    </div>
  )
}
