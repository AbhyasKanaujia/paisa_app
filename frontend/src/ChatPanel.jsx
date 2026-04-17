import { useState, useRef, useEffect } from 'react'

const PLACEHOLDER_RESPONSES = [
  "I'm here to help you understand your finances.",
  "Ask me about your spending, accounts, or anything money-related.",
]

export default function ChatPanel() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi — ask me anything about your money.' },
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    // placeholder response
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: 'ai', text: PLACEHOLDER_RESPONSES[Math.floor(Math.random() * PLACEHOLDER_RESPONSES.length)] },
      ])
    }, 600)
  }

  return (
    <div className="flex flex-col h-full">
      {/* panel header */}
      <div className="flex items-center gap-2 px-5 py-2 border-b border-stone-200 bg-stone-50 shrink-0">
        <span className="text-[10px] uppercase tracking-widest text-stone-400 font-mono">AI Assistant</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-auto" title="online" />
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <p
              className={`font-mono text-sm max-w-[78%] leading-relaxed ${
                msg.role === 'user'
                  ? 'text-stone-800'
                  : 'text-stone-500'
              }`}
            >
              {msg.role === 'ai' && (
                <span className="text-[#c8a96e] mr-1 select-none">›</span>
              )}
              {msg.text}
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
          className="flex-1 font-mono text-sm bg-transparent outline-none text-stone-800 placeholder-stone-300"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="font-mono text-xs text-stone-400 hover:text-stone-700 disabled:opacity-30 transition-colors uppercase tracking-widest"
        >
          Send
        </button>
      </form>
    </div>
  )
}
