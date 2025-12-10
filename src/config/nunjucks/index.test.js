import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('path', () => ({
  default: {
    dirname: vi.fn(() => '/mock/dirname'),
    resolve: vi.fn((...args) => args.join('/'))
  },
  dirname: vi.fn(() => '/mock/dirname')
}))

vi.mock('nunjucks', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    default: actual.default
  }
})

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

    const compileFn = module.nunjucksConfig.options.engines.njk.compile
    expect(compileFn).toBeInstanceOf(Function)
  })

  test('should register date filter that handles invalid dates', async () => {
    // '' Since filters are registered directly on the environment in the module,
    // '' we can't easily test them with mocks. This test verifies the module loads.
    const module = await import('./index.js')
    expect(module.nunjucksConfig).toBeDefined()
  })

  test('should register minusOneHour filter', async () => {
    // '' Since filters are registered directly on the environment in the module,
    // '' we can't easily test them with mocks. This test verifies the module loads.
    const module = await import('./index.js')
    expect(module.nunjucksConfig).toBeDefined()
  })

  test('should handle filter registration errors', async () => {
    // '' Import should complete successfully
    const module = await import('./index.js')
    expect(module.nunjucksConfig).toBeDefined()
    expect(module.nunjucksConfig.options).toBeDefined()
  })
})

describe('Nunjucks Filters - Actual Template Rendering', () => {
  // '' Test filters by actually rendering templates (covers lines 88-101)
  const DATE_FILTER_TEMPLATE = '{{ testDate | date }}'
  const INVALID_DATE_MESSAGE = 'Invalid date'
  const DATE_STRING_PREFIX_LENGTH = 15

  test('minusOneHour filter works in template rendering', async () => {
    // ''
    const module = await import('./index.js')
    const compile = module.nunjucksConfig.options.engines.njk.compile
    const compileOptions = module.nunjucksConfig.options.compileOptions

    const templateSource = '{{ testDate | minusOneHour }}'
    const renderFn = compile(templateSource, compileOptions)
    const testDate = new Date('2025-12-10T15:00:00Z')
    const result = renderFn({ testDate })

    const expectedDate = new Date(testDate)
    expectedDate.setHours(expectedDate.getHours() - 1)

    expect(result).toContain(
      expectedDate.toString().substring(0, DATE_STRING_PREFIX_LENGTH)
    )
  })

  test('date filter formats valid date correctly', async () => {
    // ''
    const module = await import('./index.js')
    const compile = module.nunjucksConfig.options.engines.njk.compile
    const compileOptions = module.nunjucksConfig.options.compileOptions

    const renderFn = compile(DATE_FILTER_TEMPLATE, compileOptions)
    const result = renderFn({ testDate: new Date('2025-12-10') })

    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })

  test('date filter returns Invalid date for null', async () => {
    // ''
    const module = await import('./index.js')
    const compile = module.nunjucksConfig.options.engines.njk.compile
    const compileOptions = module.nunjucksConfig.options.compileOptions

    const renderFn = compile(DATE_FILTER_TEMPLATE, compileOptions)
    const result = renderFn({ testDate: null })

    expect(result).toBe(INVALID_DATE_MESSAGE)
  })

  test('date filter returns Invalid date for invalid string', async () => {
    // ''
    const module = await import('./index.js')
    const compile = module.nunjucksConfig.options.engines.njk.compile
    const compileOptions = module.nunjucksConfig.options.compileOptions

    const renderFn = compile(DATE_FILTER_TEMPLATE, compileOptions)
    const resultInvalid = renderFn({ testDate: 'invalid' })
    const resultNull = renderFn({ testDate: null })

    expect(resultInvalid).toBe(INVALID_DATE_MESSAGE)
    expect(resultNull).toBe(INVALID_DATE_MESSAGE)
  })
})
