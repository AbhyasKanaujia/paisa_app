import { useState } from 'react'
import api from './api'

export default function AuthPage({ onAuth }) {
  const [tab, setTab] = useState('login')
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    const { email, password } = e.target
    try {
      const { data } = await api.post('/auth/login', { email: email.value, password: password.value })
      localStorage.setItem('token', data.access_token)
      onAuth()
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    }
  }

  async function handleSignup(e) {
    e.preventDefault()
    setError('')
    const { name, email, password } = e.target
    try {
      await api.post('/auth/signup', { name: name.value, email: email.value, password: password.value })
      const { data } = await api.post('/auth/login', { email: email.value, password: password.value })
      localStorage.setItem('token', data.access_token)
      onAuth()
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center" style={{ fontFamily: "'Lora', Georgia, serif" }}>

      <div className="w-80">
        {/* Logo */}
        <h1 className="text-4xl font-semibold text-stone-900 tracking-tight">paisa</h1>
        <p className="mt-1 font-mono text-xs text-stone-400 uppercase tracking-widest">your money, simply tracked</p>

        {/* Card */}
        <div className="mt-8 border border-stone-200 p-6">

          {/* Tabs */}
          <div className="flex border-b border-stone-200 mb-6">
            {['login', 'signup'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className={`flex-1 pb-2 font-mono text-xs uppercase tracking-widest transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                {t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <input
                name="email" type="email" placeholder="Email" required autoComplete="email"
                className="border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder-stone-300 outline-none focus:border-stone-900 transition-colors font-mono"
              />
              <input
                name="password" type="password" placeholder="Password" required autoComplete="current-password"
                className="border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder-stone-300 outline-none focus:border-stone-900 transition-colors font-mono"
              />
              {error && <p className="font-mono text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                className="mt-1 bg-stone-900 text-white font-mono text-xs uppercase tracking-widest py-2.5 hover:bg-stone-700 transition-colors"
              >
                Log In
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="flex flex-col gap-3">
              <input
                name="name" type="text" placeholder="Your name" required autoComplete="name"
                className="border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder-stone-300 outline-none focus:border-stone-900 transition-colors font-mono"
              />
              <input
                name="email" type="email" placeholder="Email" required autoComplete="email"
                className="border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder-stone-300 outline-none focus:border-stone-900 transition-colors font-mono"
              />
              <input
                name="password" type="password" placeholder="Password" required autoComplete="new-password"
                className="border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder-stone-300 outline-none focus:border-stone-900 transition-colors font-mono"
              />
              {error && <p className="font-mono text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                className="mt-1 bg-stone-900 text-white font-mono text-xs uppercase tracking-widest py-2.5 hover:bg-stone-700 transition-colors"
              >
                Create Account
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  )
}
