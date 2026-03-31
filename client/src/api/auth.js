const BASE = '/api/auth'

const handle = async (fetchPromise) => {
  const res = await fetchPromise
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}

export const register = (name, email, password) =>
  handle(
    fetch(`${BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
  )

export const login = (email, password) =>
  handle(
    fetch(`${BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  )

export const me = (token) =>
  handle(
    fetch(`${BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  )
