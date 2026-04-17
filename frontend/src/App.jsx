import { useState } from 'react'
import AuthPage from './AuthPage'
import HomePage from './HomePage'

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'))

  function logout() {
    localStorage.removeItem('token')
    setAuthed(false)
  }

  return authed
    ? <HomePage onLogout={logout} />
    : <AuthPage onAuth={() => setAuthed(true)} />
}
