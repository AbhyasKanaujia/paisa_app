import { test, expect, request } from '@playwright/test'

// Unique credentials per run — avoids DB conflicts between test runs
const run = Date.now()
const testUser = {
  name: 'Test User',
  email: `test_${run}@paisa.dev`,
  password: 'password123',
}

// Seed Zustand auth state into localStorage, then navigate to target.
// For tests that only need a logged-in state without hitting the API.
const seedAuth = async (page, user, token, target = '/') => {
  await page.evaluate(
    ({ user, token }) => {
      localStorage.setItem(
        'paisa-auth',
        JSON.stringify({ state: { user, token }, version: 0 })
      )
    },
    { user, token }
  )
  await page.goto(target)
}

// Register the test user once before all tests that need it
let registeredToken
let registeredUser

test.beforeAll(async () => {
  const ctx = await request.newContext()
  const res = await ctx.post('http://localhost:8000/api/auth/register', {
    data: testUser,
  })

  if (!res.ok()) {
    const text = await res.text()
    throw new Error(
      `beforeAll: failed to register test user (${res.status()}). ` +
      `Is the backend running with auth routes? Response: ${text.slice(0, 100)}`
    )
  }

  const body = await res.json()
  registeredToken = body.token
  registeredUser = body.user
  await ctx.dispose()
})

test.afterAll(async () => {
  if (!registeredToken) return
  const ctx = await request.newContext()
  await ctx.delete('http://localhost:8000/api/auth/me', {
    headers: { Authorization: `Bearer ${registeredToken}` },
  })
  await ctx.dispose()
})

// ─── Register page ────────────────────────────────────────────────────────────

test.describe('Register page', () => {
  test('renders all fields and branding', async ({ page }) => {
    await page.goto('/register')

    await expect(page.getByRole('heading', { name: 'Paisa' })).toBeVisible()
    await expect(page.getByText('Start knowing where you stand')).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Your name' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Password (min 8 characters)' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible()
  })

  test('successful registration redirects to home', async ({ page }) => {
    const uniqueEmail = `register_${Date.now()}@paisa.dev`
    await page.goto('/register')

    await page.getByRole('textbox', { name: 'Your name' }).fill('New User')
    await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail)
    await page.getByRole('textbox', { name: 'Password (min 8 characters)' }).fill('password123')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText('Hey, New')).toBeVisible()
  })

  test('shows error on duplicate email', async ({ page }) => {
    await page.goto('/register')

    // testUser was registered in beforeAll — should get duplicate error
    await page.getByRole('textbox', { name: 'Your name' }).fill(testUser.name)
    await page.getByRole('textbox', { name: 'Email' }).fill(testUser.email)
    await page.getByRole('textbox', { name: 'Password (min 8 characters)' }).fill(testUser.password)
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page.getByText('Email already registered')).toBeVisible()
    await expect(page).toHaveURL('/register')
  })

  test('cross-link navigates to login', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('link', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/login')
  })
})

// ─── Login page ───────────────────────────────────────────────────────────────

test.describe('Login page', () => {
  test('renders all fields and branding', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByRole('heading', { name: 'Paisa' })).toBeVisible()
    await expect(page.getByText('Your financial clarity')).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Create one' })).toBeVisible()
  })

  test('successful login redirects to home', async ({ page }) => {
    await page.goto('/login')

    await page.getByRole('textbox', { name: 'Email' }).fill(testUser.email)
    await page.getByRole('textbox', { name: 'Password' }).fill(testUser.password)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText(`Hey, ${testUser.name.split(' ')[0]}`)).toBeVisible()
  })

  test('shows error on wrong password', async ({ page }) => {
    await page.goto('/login')

    await page.getByRole('textbox', { name: 'Email' }).fill(testUser.email)
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('Invalid credentials')).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('cross-link navigates to register', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: 'Create one' }).click()
    await expect(page).toHaveURL('/register')
  })
})

// ─── Protected route ──────────────────────────────────────────────────────────

test.describe('Protected route', () => {
  test('redirects unauthenticated user to /login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/login')
  })

  test('shows home page for user with valid auth state', async ({ page }) => {
    await page.goto('/login')
    await seedAuth(page, registeredUser, registeredToken, '/')

    await expect(page).toHaveURL('/')
    await expect(page.getByText(`Hey, ${registeredUser.name.split(' ')[0]}`)).toBeVisible()
  })

  test('sign out clears session and redirects to login', async ({ page }) => {
    await page.goto('/login')
    await seedAuth(page, registeredUser, registeredToken, '/')
    await expect(page.getByText(`Hey, ${registeredUser.name.split(' ')[0]}`)).toBeVisible()

    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page).toHaveURL('/login')

    // Navigate to / — session is gone, should redirect to login
    await page.goto('/')
    await expect(page).toHaveURL('/login')
  })
})
