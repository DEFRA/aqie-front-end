import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
const mockUndiciFetch = vi.fn()
const mockProxyAgent = vi.fn()

vi.mock('undici', () => ({
  ProxyAgent: mockProxyAgent,
  fetch: mockUndiciFetch
}))

vi.mock('../config/index.js', () => ({
  config: {
    get: vi.fn()
  }
}))

// '' Constants to avoid duplication
const TEST_URL = 'https://example.com'

describe('proxy-fetch', () => {
  let mockConfig

  beforeEach(async () => {
    vi.clearAllMocks()
    const configModule = await import('../config/index.js')
    mockConfig = configModule.config

    mockUndiciFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: 'test' })
    })

    mockProxyAgent.mockImplementation(() => ({
      proxy: 'https://proxy.example.com:8080'
    }))
  })

  test('should export proxyFetch function', async () => {
    // ''
    const module = await import('./proxy-fetch.js')

    expect(module.proxyFetch).toBeDefined()
    expect(typeof module.proxyFetch).toBe('function')
  })

  test('should use non-proxy fetch when no proxy is configured', async () => {
    // ''
    mockConfig.get.mockReturnValue(null)

    const module = await import('./proxy-fetch.js')
    await module.proxyFetch(TEST_URL, { method: 'GET' })

    expect(mockUndiciFetch).toHaveBeenCalledWith(TEST_URL, {
      method: 'GET'
    })
    expect(mockConfig.get).toHaveBeenCalledWith('httpsProxy')
    expect(mockConfig.get).toHaveBeenCalledWith('httpProxy')
  })

  test('should use proxy fetch when https proxy is configured', async () => {
    // ''
    mockConfig.get.mockImplementation((key) => {
      if (key === 'httpsProxy') {
        return 'https://proxy.example.com:8080'
      }
      return null
    })

    const module = await import('./proxy-fetch.js')
    await module.proxyFetch(TEST_URL, { method: 'POST' })

    expect(mockUndiciFetch).toHaveBeenCalledWith(TEST_URL, {
      method: 'POST',
      dispatcher: expect.any(Object)
    })
    expect(mockProxyAgent).toHaveBeenCalled()
  })

  test('should handle fetch with options correctly', async () => {
    // ''
    mockConfig.get.mockReturnValue(null)

    const module = await import('./proxy-fetch.js')
    const options = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' })
    }

    await module.proxyFetch('https://api.example.com', options)

    expect(mockUndiciFetch).toHaveBeenCalledWith(
      'https://api.example.com',
      options
    )
  })
})
