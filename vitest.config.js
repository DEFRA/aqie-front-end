import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    threads: false, // Disable worker threads to avoid EPERM errors
    exclude: [
      ...configDefaults.exclude,
      'src/src/govuk/**/*', // Ignore files inside src/src/govuk from testing
      'src/server/common/**/*' // Ignore files inside src/server/common from testing
    ],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov'], // Display coverage in the terminal and generate an HTML report
      all: false, // Include all files in the coverage report
      include: ['src/**'],
      exclude: [
        'src/src/govuk/**/*',
        '.public',
        'coverage',
        'postcss.config.js',
        'stylelint.config.js',
        'src/src/govuk/**/*', // Ignore files inside src/src/govuk from testing
        'src/server/common/**/*' // Ignore files inside src/server/common from testing
      ] // Exclude src/src/govuk from coverage
    }
  }
})
