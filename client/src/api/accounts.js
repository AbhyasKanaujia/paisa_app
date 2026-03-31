const BASE = '/api/accounts'

const handle = async (fetchPromise) => {
  const res = await fetchPromise
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}

export const getAccounts = (token) =>
  handle(
    fetch(BASE, {
      headers: { Authorization: `Bearer ${token}` },
    })
  )

export const createAccount = (data, token) =>
  handle(
    fetch(BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  )
