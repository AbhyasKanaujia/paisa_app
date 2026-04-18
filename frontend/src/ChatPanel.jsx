import { useState, useRef, useEffect } from 'react'

export default function ChatPanel({ onExpand, onCollapse, onDismiss, isFullscreen, isLarge }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi — ask me anything about your money.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const threadIdRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    setLoading(true)

    // Add a placeholder AI message that we'll stream into
    setMessages((m) => [...m, { role: 'ai', text: '', streaming: true }])

    try {
      const token = localStorage.getItem('token')
      const resp = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text, thread_id: threadIdRef.current }),
      })

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let firstEvent = true

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)

          if (firstEvent) {
            // First event is the thread_id
            threadIdRef.current = payload
            firstEvent = false
            continue
          }

          if (payload === '[DONE]') break

          if (payload === '[ERROR]') {
            setMessages((m) => {
              const updated = [...m]
              updated[updated.length - 1] = { role: 'ai', text: 'Something went wrong. Check server logs.' }
              return updated
            })
            break
          }

          const chunk = payload.replace(/\\n/g, '\n')
          setMessages((m) => {
            const updated = [...m]
            const last = updated[updated.length - 1]
            if (last.role === 'ai') {
              updated[updated.length - 1] = { ...last, text: last.text + chunk }
            }
            return updated
          })
        }
      }
    } catch (err) {
      setMessages((m) => {
        const updated = [...m]
        updated[updated.length - 1] = { role: 'ai', text: 'Something went wrong. Please try again.' }
        return updated
      })
    } finally {
      // Remove streaming flag from last message
      setMessages((m) => {
        const updated = [...m]
        const last = updated[updated.length - 1]
        if (last.role === 'ai') {
          updated[updated.length - 1] = { role: 'ai', text: last.text }
        }
        return updated
      })
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* panel header */}
      <div className="flex items-center gap-2 px-5 py-2 border-b border-stone-200 bg-stone-50 shrink-0">
        <span className="text-[10px] uppercase tracking-widest text-stone-400 font-mono">AI Assistant</span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-400' : 'bg-emerald-400'}`}
          title={loading ? 'thinking' : 'online'}
        />
        <div className="ml-auto flex items-center gap-3">
          {isFullscreen ? (
            <button
              onClick={onCollapse}
              title="Collapse"
              className="font-mono text-stone-400 hover:text-stone-700 transition-colors leading-none"
              style={{ fontSize: '14px' }}
            >
              {isLarge ? '→' : '↓'}
            </button>
          ) : (
            <button
              onClick={onExpand}
              title="Expand"
              className="font-mono text-stone-400 hover:text-stone-700 transition-colors leading-none"
              style={{ fontSize: '14px' }}
            >
              {isLarge ? '←' : '↑'}
            </button>
          )}
          <button
            onClick={onDismiss}
            title="Dismiss"
            className="font-mono text-stone-400 hover:text-stone-700 transition-colors leading-none"
            style={{ fontSize: '14px' }}
          >
            ×
          </button>
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <p
              className={`font-mono text-sm max-w-[78%] leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' ? 'text-stone-800' : 'text-stone-500'
              }`}
            >
              {msg.role === 'ai' && (
                <span className="text-[#c8a96e] mr-1 select-none">›</span>
              )}
              {msg.text}
              {msg.streaming && <span className="animate-pulse">▍</span>}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* input */}
      <form onSubmit={send} className="flex items-center border-t border-stone-200 px-5 py-3 gap-3 shrink-0">
        <span className="font-mono text-[#c8a96e] text-sm select-none">›_</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your finances…"
          disabled={loading}
          className="flex-1 font-mono text-sm bg-transparent outline-none text-stone-800 placeholder-stone-300 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="font-mono text-xs text-stone-400 hover:text-stone-700 disabled:opacity-30 transition-colors uppercase tracking-widest"
        >
          {loading ? '…' : 'Send'}
        </button>
      </form>
    </div>
  )
}
