import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../app.js'
import { setupDB } from './setup.js'

setupDB()

// Shared state across tests
let token

const user = {
  name: 'Abhyas',
  email: 'abhyas@paisa.dev',
  password: 'password123',
}

// ─── Register ────────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('creates a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(user)

    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe(user.email)
    expect(res.body.user.password).toBeUndefined() // never expose password

    token = res.body.token
  })

  it('rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send(user)
    const res = await request(app).post('/api/auth/register').send(user)

    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/already registered/i)
  })

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'incomplete@paisa.dev' })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/required/i)
  })

  it('rejects password shorter than 8 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test',
      email: 'short@paisa.dev',
      password: '123',
    })

    expect(res.status).toBe(400)
  })
})

// ─── Login ───────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await request(app).post('/api/auth/register').send(user)
  })

  it('returns token on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe(user.email)

    token = res.body.token
  })

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'wrongpassword' })

    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/invalid credentials/i)
  })

  it('rejects unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@paisa.dev', password: 'password123' })

    expect(res.status).toBe(401)
  })

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email })

    expect(res.status).toBe(400)
  })
})

// ─── Me ──────────────────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send(user)
    token = res.body.token
  })

  it('returns the current user for a valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.email).toBe(user.email)
    expect(res.body.name).toBe(user.name)
    expect(res.body.password).toBeUndefined()
  })

  it('rejects request with no token', async () => {
    const res = await request(app).get('/api/auth/me')

    expect(res.status).toBe(401)
  })

  it('rejects a malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not.a.valid.token')

    expect(res.status).toBe(401)
  })

  it('rejects an expired or tampered token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ImZha2UifQ.badsig')

    expect(res.status).toBe(401)
  })
})
