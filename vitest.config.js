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
        'src/server/locations/helpers/search-by-location-id.js' // Exclude unused helper
      ] // Exclude src/src/govuk from coverage
    }
  }
})
