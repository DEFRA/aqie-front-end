module.exports = {
  rootDir: '.',
  testEnvironment: 'jsdom',
  verbose: true,
  resetModules: true,
  clearMocks: true,
  silent: true,
  testMatch: ['**/src/**/*.test.js'],
  reporters: ['default', ['github-actions', { silent: false }], 'summary'],
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server/common/**' // Exclude test in server/common
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/src/server/common/',
    '<rootDir>/src/__fixtures__/'
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/.server',
    '<rootDir>/.public',
    '<rootDir>/src/__fixtures__',
    '<rootDir>/test-helpers',
    '<rootDir>/mock-api',
    '<rootDir>/src/server/common/components',
    '<rootDir>/src/server/common/helpers',
    '<rootDir>/src/client/assets/javascripts',
    '<rootDir>/src/common/helpers/redis-client.js',
    '<rootDir>/src/config',
    '<rootDir>/src/helpers',
    '<rootDir>/src/server/router.js',
    '<rootDir>/src/server/index.js',
    '<rootDir>/test-helpers/component-helpers.js',
    '<rootDir>/src/index.js',
    '<rootDir>/src/indextest.js'
  ],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverage: false,
  coverageReporters: ['clover', 'json', 'text', 'lcov', 'text-summary']
  // coverageThreshold: {
  //   global: {
  //     branches: 90,
  //     functions: 90,
  //     lines: 90,
  //     statements: 90
  //   }
  // }
}
