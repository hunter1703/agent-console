import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Agent Console E2E Testing
 * 
 * Production-ready testing setup with maximum parallelism and reliability.
 * Optimized for fast execution and comprehensive coverage.
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI and locally for production reliability */
  retries: process.env.CI ? 3 : 2,
  
  /* Maximum parallel workers for speed (12 max to avoid system overload) */
  workers: process.env.CI ? 4 : 12,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['line']
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Increased timeouts for production reliability */
    actionTimeout: 15000,
    navigationTimeout: 45000,
    
    /* Ignore HTTPS errors for local development */
    ignoreHTTPSErrors: true,
    
    /* Bypass CSP for testing */
    bypassCSP: true,
  },

  /* Configure projects for major browsers with production focus */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        /* Faster execution settings */
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        }
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            'security.tls.insecure_fallback_hosts': 'localhost',
          }
        }
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
      },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        launchOptions: {
          args: ['--disable-web-security']
        }
      },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    {
      name: 'Google Chrome',
      use: { 
        ...devices['Desktop Chrome'], 
        channel: 'chrome',
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        }
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,
  },

  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),

  /* Increased test timeout for production reliability */
  timeout: 90000,

  /* Increased expect timeout */
  expect: {
    timeout: 15000,
  },

  /* Output directory for test results */
  outputDir: 'test-results/',
  
  /* Test match patterns */
  testMatch: '**/*.spec.ts',
  
  /* Metadata */
  metadata: {
    'test-suite': 'Agent Console E2E',
    'environment': process.env.NODE_ENV || 'development',
    'version': '1.0.0'
  }
});