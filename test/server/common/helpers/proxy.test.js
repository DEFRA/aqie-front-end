import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies at top level (hoisted)
const mockConfig = {
  get: vi.fn()
}

const mockLogger = {
  debug: vi.fn()
}

vi.mock('../../../../src/config/index.js', () => ({
  config: mockConfig
}))

vi.mock('../../../../src/server/common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => mockLogger)
}))

const HTTP_PORT = 80
const HTTPS_PORT = 443

describe('proxy.js - provideProxy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return null when no proxy URL is configured', async () => {
    mockConfig.get.mockReturnValue(null)

    const { provideProxy } = await import(
      '../../../../src/server/common/helpers/proxy.js'
    )

    const result = provideProxy()

    expect(result).toBeNull()
    expect(mockConfig.get).toHaveBeenCalledWith('httpsProxy')
    expect(mockConfig.get).toHaveBeenCalledWith('httpProxy')
  })

  it('should set up proxy with http protocol (port 80)', async () => {
    const httpProxyUrl = 'http://proxy.example.com'
    mockConfig.get.mockImplementation((key) => {
      if (key === 'httpsProxy') {
        return null
      }
      if (key === 'httpProxy') {
        return httpProxyUrl
      }
      return null
    })

    const { provideProxy } = await import(
      '../../../../src/server/common/helpers/proxy.js'
    )

    const result = provideProxy()

    expect(result).not.toBeNull()
    expect(result.port).toBe(HTTP_PORT)
    expect(result.url.href).toBe('http://proxy.example.com/')
    expect(result.proxyAgent).toBeDefined()
    expect(result.httpAndHttpsProxyAgent).toBeDefined()
    expect(mockLogger.debug).toHaveBeenCalledWith(
      'Proxy set up using http://proxy.example.com:80'
    )
  })

  it('should set up proxy with https protocol (port 443)', async () => {
    const httpsProxyUrl = 'https://secure-proxy.example.com'
    mockConfig.get.mockImplementation((key) => {
      if (key === 'httpsProxy') {
        return httpsProxyUrl
      }
      return null
    })

    const { provideProxy } = await import(
      '../../../../src/server/common/helpers/proxy.js'
    )

    const result = provideProxy()

    expect(result).not.toBeNull()
    expect(result.port).toBe(HTTPS_PORT)
    expect(result.url.href).toBe('https://secure-proxy.example.com/')
    expect(result.proxyAgent).toBeDefined()
    expect(result.httpAndHttpsProxyAgent).toBeDefined()
    expect(mockLogger.debug).toHaveBeenCalledWith(
      'Proxy set up using https://secure-proxy.example.com:443'
    )
  })
})

describe('proxy.js - provideProxy prioritization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should prioritize httpsProxy over httpProxy', async () => {
    const httpsProxyUrl = 'https://https-proxy.example.com'
    const httpProxyUrl = 'http://http-proxy.example.com'
    mockConfig.get.mockImplementation((key) => {
      if (key === 'httpsProxy') {
        return httpsProxyUrl
      }
      if (key === 'httpProxy') {
        return httpProxyUrl
      }
      return null
    })

    const { provideProxy } = await import(
      '../../../../src/server/common/helpers/proxy.js'
    )

    const result = provideProxy()

    expect(result.url.href).toBe('https://https-proxy.example.com/')
    expect(result.port).toBe(HTTPS_PORT)
  })
})

describe('proxy.js - proxyFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should use standard fetch when no proxy is configured', async () => {
    mockConfig.get.mockReturnValue(null)
    const testUrl = 'https://api.example.com/data'
    const testOptions = { method: 'GET' }

    const mockFetch = vi.fn().mockResolvedValue({ ok: true })
    globalThis.fetch = mockFetch

    const { proxyFetch } = await import(
      '../../../../src/server/common/helpers/proxy.js'
    )

    await proxyFetch(testUrl, testOptions)

    expect(mockFetch).toHaveBeenCalledWith(testUrl, testOptions)
    expect(mockLogger.debug).not.toHaveBeenCalled()
  })

  it('should use proxy fetch when proxy is configured', async () => {
    const httpsProxyUrl = 'https://proxy.example.com'
    mockConfig.get.mockImplementation((key) => {
      if (key === 'httpsProxy') {
        return httpsProxyUrl
      }
      return null
    })

    const testUrl = 'https://api.example.com/data'
    const testOptions = { method: 'GET' }

    const mockFetch = vi.fn().mockResolvedValue({ ok: true })
    globalThis.fetch = mockFetch

    const { proxyFetch } = await import(
      '../../../../src/server/common/helpers/proxy.js'
    )

    await proxyFetch(testUrl, testOptions)

    expect(mockFetch).toHaveBeenCalled()
    const callArgs = mockFetch.mock.calls[0]
    expect(callArgs[0]).toBe(testUrl)
    expect(callArgs[1]).toHaveProperty('dispatcher')
    expect(callArgs[1].method).toBe('GET')
    expect(mockLogger.debug).toHaveBeenCalledWith(
      expect.stringContaining(
        `Fetching: ${testUrl} via the proxy: https://proxy.example.com:443`
      )
    )
  })
})
