import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: [
    {
      command: 'npm run server',
      url: 'http://localhost:8000/api/health',
      reuseExistingServer: true,
      timeout: 10000,
    },
    {
      command: 'npm run client',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 10000,
    },
  ],
})
