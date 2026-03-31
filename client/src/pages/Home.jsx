import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

export default function Home() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Hey, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 text-sm">Financial clarity is coming soon.</p>
        <Link
          to="/accounts"
          className="inline-block mt-4 text-gray-400 hover:text-white text-sm transition-colors"
        >
          Accounts →
        </Link>
        <button
          onClick={handleLogout}
          className="mt-8 text-gray-600 hover:text-gray-400 text-sm transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
