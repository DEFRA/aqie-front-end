import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('../config/index.js', () => ({
  config: {
    get: vi.fn()
  }
}))

vi.mock('https-proxy-agent', () => ({
  HttpsProxyAgent: vi.fn().mockImplementation((url) => ({
    proxy: url,
    type: 'https-proxy-agent'
  }))
}))

vi.mock('../server/common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    error: vi.fn(),
    info: vi.fn()
  }))
}))

// Mock URL constructor
const mockUrl = vi.fn()
vi.mock('url', () => ({
  Url: mockUrl
}))

describe('proxy-agent', () => {
  let mockConfig

  beforeEach(async () => {
    vi.clearAllMocks()
    const configModule = await import('../config/index.js')
    mockConfig = configModule.config

    // Reset URL mock
    mockUrl.mockImplementation((url) => ({
      href: url,
      protocol: 'https:',
      host: 'proxy.example.com:8080'
    }))
  })

  test('should export proxyAgent function', async () => {
    // ''
    const module = await import('./proxy-agent.js')

    expect(module.proxyAgent).toBeDefined()
    expect(typeof module.proxyAgent).toBe('function')
  })

  test('should return null when no https proxy is configured', async () => {
    // ''
    mockConfig.get.mockReturnValue(null)

    const module = await import('./proxy-agent.js')
    const result = module.proxyAgent()

    expect(result).toBe(null)
    expect(mockConfig.get).toHaveBeenCalledWith('httpsProxy')
  })

  test('should create proxy agent when https proxy is configured', async () => {
    // ''
    const proxyUrl = 'https://proxy.example.com:8080'
    mockConfig.get.mockReturnValue(proxyUrl)

    const module = await import('./proxy-agent.js')
    const result = module.proxyAgent()

    expect(result).toBeDefined()
    expect(result.url).toBeDefined()
    expect(result.agent).toBeDefined()
    expect(mockConfig.get).toHaveBeenCalledWith('httpsProxy')
  })

  test('should handle invalid proxy URL gracefully', async () => {
    // ''
    mockConfig.get.mockReturnValue('invalid-url')
    mockUrl.mockImplementation(() => {
      throw new Error('Invalid URL')
    })

    const module = await import('./proxy-agent.js')
    const result = module.proxyAgent()

    expect(result).toBe(null)
  })
})
