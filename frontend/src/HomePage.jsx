import { useState, useEffect } from 'react'
import ChatPanel from './ChatPanel'
import AccountsPage from './AccountsPage'

function useIsLarge() {
  const [isLarge, setIsLarge] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const handler = () => setIsLarge(window.innerWidth >= 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isLarge
}

export default function HomePage({ onLogout }) {
  const [chatMode, setChatMode] = useState('default') // 'default' | 'fullscreen' | 'hidden'
  const [page, setPage] = useState('home') // 'home' | 'accounts'
  const isLarge = useIsLarge()

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden" style={{ fontFamily: "'Lora', Georgia, serif" }}>

      {/* ── Header ── */}
      <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-stone-200">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setPage('home')}
            className="text-lg font-semibold tracking-tight text-stone-900 hover:opacity-70 transition-opacity"
          >
            paisa
          </button>
          <nav className="flex gap-4">
            {[['accounts', 'Accounts']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setPage(id)}
                className={`font-mono text-xs uppercase tracking-widest transition-colors ${
                  page === id ? 'text-stone-900 border-b border-stone-900' : 'text-stone-400 hover:text-stone-700'
                }`}
                style={{ color: page === id ? '#c8a96e' : undefined }}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={onLogout}
          className="font-mono text-xs uppercase tracking-widest text-stone-400 hover:text-stone-700 transition-colors"
        >
          Log out
        </button>
      </header>

      {/* ── Body ── */}
      <div className={`flex-1 flex overflow-hidden ${isLarge ? 'flex-row' : 'flex-col'}`}>

        {/* ── Main area ── */}
        {chatMode !== 'fullscreen' && (
          <main className="flex-1 overflow-y-auto px-8 py-10 min-w-0">
            {page === 'accounts' ? (
              <AccountsPage />
            ) : (
              <>
                <p className="text-2xl text-stone-800 leading-snug">Welcome back.</p>
                <p className="mt-2 text-sm text-stone-400 font-mono">Your dashboard will live here.</p>

                <div className="mt-10 grid grid-cols-3 gap-4">
                  {[['accounts', 'Accounts'], ['transactions', 'Transactions'], ['summary', 'Summary']].map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => id !== 'transactions' && id !== 'summary' && setPage(id)}
                      className="border border-stone-200 p-5 text-left hover:bg-stone-50 transition-colors"
                    >
                      <p className="text-xs font-mono uppercase tracking-widest text-stone-300">{label}</p>
                      <p className="mt-3 text-2xl font-semibold text-stone-200">—</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </main>
        )}

        {/* ── Divider ── */}
        <div className={`shrink-0 border-stone-900 ${isLarge ? 'border-l-2' : 'border-t-2'}`} />

        {/* ── Chat panel / collapsed strip ── */}
        {chatMode === 'hidden' ? (
          isLarge ? (
            /* Vertical strip on right edge */
            <div className="shrink-0 flex flex-col items-center justify-between py-4 bg-stone-50" style={{ width: '36px' }}>
              <button
                onClick={() => setChatMode('default')}
                title="Restore"
                className="font-mono text-stone-400 hover:text-stone-700 transition-colors leading-none"
                style={{ fontSize: '14px' }}
              >
                ←
              </button>
              <span
                className="text-[9px] uppercase tracking-widest text-stone-400 font-mono"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                AI Assistant
              </span>
            </div>
          ) : (
            /* Horizontal strip at bottom */
            <div className="shrink-0 flex items-center gap-2 px-5 py-2 bg-stone-50">
              <span className="text-[10px] uppercase tracking-widest text-stone-400 font-mono">AI Assistant</span>
              <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
              <button
                onClick={() => setChatMode('default')}
                title="Restore"
                className="font-mono text-stone-400 hover:text-stone-700 transition-colors leading-none ml-auto"
                style={{ fontSize: '14px' }}
              >
                ↑
              </button>
            </div>
          )
        ) : (
          <div
            className="overflow-hidden flex flex-col shrink-0"
            style={
              isLarge
                ? { width: chatMode === 'fullscreen' ? '100%' : '35%' }
                : { flex: chatMode === 'fullscreen' ? '1 1 auto' : '0 0 30%' }
            }
          >
            <ChatPanel
              onExpand={() => setChatMode('fullscreen')}
              onCollapse={() => setChatMode('default')}
              onDismiss={() => setChatMode('hidden')}
              isFullscreen={chatMode === 'fullscreen'}
              isLarge={isLarge}
            />
          </div>
        )}

      </div>
    </div>
  )
}
