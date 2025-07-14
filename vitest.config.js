import { defineConfig, configDefaults } from 'vitest/config'
import { GOVUK_SRC_EXCLUDE } from './src/server/data/constants.js'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    threads: false, // Disable worker threads to avoid EPERM errors
    exclude: [
      ...configDefaults.exclude,
      GOVUK_SRC_EXCLUDE, // Ignore files inside src/src/govuk from testing
      'src/server/common/**/*' // Ignore files inside src/server/common from testing
    ],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov'], // Display coverage in the terminal and generate an HTML report
      include: ['src/**'],
      exclude: [
        GOVUK_SRC_EXCLUDE,
        '.public',
        'coverage',
        'postcss.config.js',
        'stylelint.config.js',
        GOVUK_SRC_EXCLUDE, // Ignore files inside src/src/govuk from testing
        'src/server/common/**/*', // Ignore files inside src/server/common from testing
        'src/client/**'
      ] // Exclude src/src/govuk from coverage
    }
  }
})
