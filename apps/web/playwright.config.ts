import { defineConfig } from '@playwright/test'

const apiServerCommand =
  process.env.PULSEBOARD_E2E_API_COMMAND ?? 'python ../api/scripts/run_e2e_server.py'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: apiServerCommand,
      url: 'http://127.0.0.1:8000/api/v1/health',
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command: 'npm run preview -- --host 127.0.0.1 --port 4173',
      url: 'http://127.0.0.1:4173/communities',
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
})
