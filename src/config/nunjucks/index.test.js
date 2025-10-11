import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('path', () => ({
  default: {
    dirname: vi.fn(() => '/mock/dirname'),
    resolve: vi.fn((...args) => args.join('/'))
  },
  dirname: vi.fn(() => '/mock/dirname')
}))

vi.mock('nunjucks', () => ({
  default: {
    configure: vi.fn(() => ({
      addFilter: vi.fn(),
      addGlobal: vi.fn(),
      render: vi.fn()
    }))
  }
}))

vi.mock('@hapi/vision', () => ({
  default: {
    name: 'vision',
    register: vi.fn()
  }
}))

vi.mock('node:url', () => ({
  fileURLToPath: vi.fn(() => '/mock/file/path')
}))

vi.mock('../index.js', () => ({
  config: {
    get: vi.fn((key) => {
      const mockConfig = {
        'nunjucks.watch': false,
        'nunjucks.noCache': true
      }
      return mockConfig[key] || 'mock-value'
    })
  }
}))

vi.mock('./context/context.js', () => ({
  context: vi.fn(() => ({ mockContext: true }))
}))

vi.mock('./filters/index.js', () => ({
  addDaysToTodayAbrev: vi.fn(),
  addDaysToTodayAbrevWelsh: vi.fn(),
  default: {}
}))

vi.mock('./globals/globals.js', () => ({
  assign: vi.fn()
}))

vi.mock('../../server/common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn()
  }))
}))

vi.mock('./filters/format-sentence.js', () => ({
  addToSentenceCase: vi.fn()
}))

describe('Nunjucks Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should configure nunjucks environment', async () => {
    // ''
    const nunjucksMock = await import('nunjucks')

    // Import the module to trigger configuration
    await import('./index.js')

    expect(nunjucksMock.default.configure).toHaveBeenCalled()
  })

  test('should export nunjucksConfig with required properties', async () => {
    // ''
    const module = await import('./index.js')

    expect(module.nunjucksConfig).toBeDefined()
    expect(module.nunjucksConfig.plugin).toBeDefined()
    expect(module.nunjucksConfig.options).toBeDefined()
    expect(module.nunjucksConfig.options.engines).toBeDefined()
    expect(module.nunjucksConfig.options.engines.njk).toBeDefined()
  })

  test('should have correct engine configuration', async () => {
    // ''
    const module = await import('./index.js')

    const { nunjucksConfig } = module
    expect(nunjucksConfig.options.engines.njk.compile).toBeInstanceOf(Function)
    expect(nunjucksConfig.options.compileOptions.environment).toBeDefined()
  })

  test('should have context function defined', async () => {
    // ''
    const module = await import('./index.js')

    expect(module.nunjucksConfig.options.context).toBeDefined()
    expect(typeof module.nunjucksConfig.options.context).toBe('function')
  })

  test('should have compile function that returns a function', async () => {
    // ''
    const module = await import('./index.js')
    const nunjucksMock = await import('nunjucks')

    const compileFn = module.nunjucksConfig.options.engines.njk.compile
    expect(compileFn).toBeInstanceOf(Function)

    // Mock compile to return a mock template
    nunjucksMock.default.compile = vi.fn(() => ({
      render: vi.fn((ctx) => `rendered: ${JSON.stringify(ctx)}`)
    }))

    const result = compileFn('test template', {
      environment: nunjucksMock.default.configure()
    })
    expect(result).toBeInstanceOf(Function)
  })
})
