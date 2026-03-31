import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const register = useAuthStore((s) => s.register)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold text-white tracking-tight">Paisa</h1>
          <p className="text-gray-500 mt-2 text-sm">Start knowing where you stand</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="w-full bg-gray-900 text-white placeholder-gray-600 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600 transition-colors"
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-900 text-white placeholder-gray-600 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600 transition-colors"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-gray-900 text-white placeholder-gray-600 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-gray-950 font-medium rounded-lg px-4 py-3 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}
