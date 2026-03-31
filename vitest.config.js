import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      JWT_SECRET: 'test-secret-key-for-vitest',
      JWT_EXPIRES_IN: '7d',
    },
  },
})
