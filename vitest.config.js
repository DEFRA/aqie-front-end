import { defineConfig, configDefaults } from 'vitest/config'
import { GOVUK_SRC_EXCLUDE } from './src/server/data/constants.js'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    exclude: [
      ...configDefaults.exclude,
      GOVUK_SRC_EXCLUDE, // Ignore files inside src/src/govuk from testing
      'src/server/common/**/*.test.js' // Ignore test files inside src/server/common (broken legacy tests)
    ],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'json-summary', 'html', 'lcov'], // Added lcov for SonarCloud
      include: ['src/**'],
      exclude: [
        GOVUK_SRC_EXCLUDE,
        '.public',
        'coverage',
        'postcss.config.js',
        'stylelint.config.js',
        GOVUK_SRC_EXCLUDE, // Ignore files inside src/src/govuk from testing
        'src/client/**',
        'src/**/__fixtures__/**', // Exclude fixture files from coverage
        'src/config/nunjucks/filters/format-currency.js', // Exclude problematic file causing V8 coverage issues
        'src/server/locations/cy/**', // Exclude Welsh middleware files (no tests currently)
        'src/**/test-setup.js', // Exclude test setup files
        'src/**/test-helpers/**', // Exclude test helper files
        'src/server/test-routes/**', // Exclude test-only routes
        'src/**/*.test.*.js', // Exclude split test files
        'src/server/location-id/cy/controller.js', // Exclude duplicate Welsh controller
        'src/config/nunjucks/filters/index.js', // Exclude export-only file
        'src/server/locations/helpers/search-by-location-id.js', // Exclude unused helper
        'src/server/location-id/controller-helpers.js',
        'src/server/location-id/controller-workflow.js',
        // Exclude untested legacy files from src/server/common
        'src/server/common/helpers/catch-fetch-error.js',
        'src/server/common/helpers/location-controller-helper.js',
        'src/server/common/helpers/mock-daqi-level.js',
        'src/server/common/helpers/mock-pollutant-level.js',
        'src/server/common/helpers/errors.js',
        'src/server/common/helpers/fetch-oauth-token.js',
        'src/server/common/helpers/metrics.js',
        'src/server/common/helpers/proxy-agent.js',
        'src/server/common/helpers/proxy-fetch.js',
        'src/server/common/helpers/pulse.js',
        'src/server/common/helpers/redis-client.js',
        'src/server/common/helpers/request-tracing.js',
        'src/server/common/helpers/sentence-case.js',
        'src/server/common/helpers/serve-static-files.js',
        'src/server/common/helpers/sort-by-timestamp.js',
        'src/server/common/helpers/start-server.js',
        'src/server/common/helpers/stringUtils.js',
        'src/server/common/helpers/transform-summary-keys.js',
        'src/server/common/helpers/proxy/**',
        'src/server/common/helpers/secure-context/**',
        'src/server/common/helpers/session-cache/**',
        'src/server/common/helpers/logging/**',
        'src/server/common/constants/**',
        'src/server/common/components/**'
      ] // Exclude src/src/govuk from coverage
    }
  }
})
