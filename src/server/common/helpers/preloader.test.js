// ''
import { describe, expect, test, vi } from 'vitest'
import {
  DEFAULT_PRELOADER_CONFIG,
  buildPreloaderStatusResponse,
  buildPreloaderViewModel,
  resolvePreloaderLanguage
} from './preloader.js'

const buildRequest = ({ payload = {}, query = {}, headers = {} } = {}) => ({
  payload,
  query,
  headers
})

const buildH = () => ({
  response: vi.fn((data) => ({
    code: vi.fn((statusCode) => ({ data, statusCode }))
  }))
})

describe('preloader helpers', () => {
  test('resolvePreloaderLanguage uses payload lang', () => {
    const request = buildRequest({ payload: { lang: 'cy' } })

    const result = resolvePreloaderLanguage(request)

    expect(result).toBe('cy')
  })

  test('resolvePreloaderLanguage uses query lang', () => {
    const request = buildRequest({ query: { lang: 'cy' } })

    const result = resolvePreloaderLanguage(request)

    expect(result).toBe('cy')
  })

  test('resolvePreloaderLanguage uses Welsh referer', () => {
    const request = buildRequest({
      headers: { referer: 'https://example.com/chwilio-lleoliad/cy' }
    })

    const result = resolvePreloaderLanguage(request)

    expect(result).toBe('cy')
  })

  test('resolvePreloaderLanguage falls back to default', () => {
    const request = buildRequest()

    const result = resolvePreloaderLanguage(request)

    expect(result).toBe('en')
  })

  test('buildPreloaderViewModel merges default config', () => {
    const viewModel = buildPreloaderViewModel({
      lang: 'en',
      pageTitle: 'Loading',
      description: 'Loading content',
      page: 'Page',
      serviceName: 'Service',
      heading: 'Heading',
      body: 'Body',
      statusText: 'Status',
      retryUrl: '/retry'
    })

    expect(viewModel.preloader).toEqual(
      expect.objectContaining({
        heading: 'Heading',
        body: 'Body',
        statusText: 'Status',
        retryUrl: '/retry',
        statusUrl: DEFAULT_PRELOADER_CONFIG.statusUrl,
        maxPolls: DEFAULT_PRELOADER_CONFIG.maxPolls,
        pollIntervalMs: DEFAULT_PRELOADER_CONFIG.pollIntervalMs,
        initialDelayMs: DEFAULT_PRELOADER_CONFIG.initialDelayMs
      })
    )
  })

  test('buildPreloaderStatusResponse returns processing response', () => {
    const h = buildH()

    const result = buildPreloaderStatusResponse({
      h,
      isProcessing: true,
      hasError: false
    })

    expect(h.response).toHaveBeenCalledWith({ status: 'processing' })
    expect(result.statusCode).toBe(200)
  })

  test('buildPreloaderStatusResponse returns failed response', () => {
    const h = buildH()

    const result = buildPreloaderStatusResponse({
      h,
      isProcessing: false,
      hasError: true,
      retryRedirect: '/retry',
      defaultRedirect: '/search-location'
    })

    expect(h.response).toHaveBeenCalledWith({
      status: 'failed',
      redirectTo: '/retry'
    })
    expect(result.statusCode).toBe(200)
  })

  test('buildPreloaderStatusResponse returns complete response', () => {
    const h = buildH()

    const result = buildPreloaderStatusResponse({
      h,
      isProcessing: false,
      hasError: false,
      redirectTo: '/location/123',
      defaultRedirect: '/search-location'
    })

    expect(h.response).toHaveBeenCalledWith({
      status: 'complete',
      redirectTo: '/location/123'
    })
    expect(result.statusCode).toBe(200)
  })
})
