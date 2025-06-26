module.exports = {
  rootDir: '.',
  testEnvironment: 'jsdom', // Switch to jsdom environment for DOM-related tests
  verbose: true,
  resetModules: true,
  clearMocks: true,
  silent: true,
  testMatch: ['**/src/**/*.test.js'],
  reporters: ['default', ['github-actions', { silent: false }], 'summary'],
  setupFilesAfterEnv: ['./jest-setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server/common/**', // Exclude test in server/common
    '!src/client/**' // Exclude files in client
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/src/server/common/',
    '<rootDir>/src/client/',
    '<rootDir>/src/__fixtures__/'
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/.server',
    '<rootDir>/.public',
    '<rootDir>/src/__fixtures__/',
    '<rootDir>/test-helpers/',
    '<rootDir>/mock-api/',
    '<rootDir>/src/server/common/',
    '<rootDir>/src/client/',
    '<rootDir>/src/common/helpers/redis-client.js',
    '<rootDir>/src/config/',
    '<rootDir>/src/helpers/',
    '<rootDir>/src/server/router.js',
    '<rootDir>/src/server/index.js',
    '<rootDir>/test-helpers/component-helpers.js',
    '<rootDir>/src/index.js',
    '<rootDir>/src/indextest.js'
  ],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverage: true,
  coverageReporters: ['clover', 'json', 'text', 'lcov', 'text-summary'],
  coverageThreshold: {
    global: {
      branches: 45,
      functions: 45,
      lines: 45,
      statements: 45
    }
  },
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1'
  }
}
