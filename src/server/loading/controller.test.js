import { describe, expect, test, vi, beforeEach } from 'vitest'
import { loadingController } from './controller.js'

// ''

const buildRequest = ({
  payload = {},
  query = {},
  headers = {},
  yar = null
} = {}) => ({
  payload,
  query,
  headers,
  yar:
    yar ||
    vi.fn(() => ({
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn()
    }))
})

const buildH = () => ({
  view: vi.fn((template, viewModel) => viewModel),
  redirect: vi.fn((path) => path)
})

describe('loadingController', () => {
  let mockRequest
  let mockH
  let mockYar

  beforeEach(() => {
    mockYar = {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn()
    }
    mockRequest = buildRequest({ yar: mockYar })
    mockH = buildH()
  })

  test('should redirect to search when no NI processing active', () => {
    mockYar.get.mockReturnValue(false)

    const result = loadingController.handler(mockRequest, mockH)

    expect(mockYar.get).toHaveBeenCalledWith('niProcessing')
    expect(mockH.redirect).toHaveBeenCalledWith('/search-location')
    expect(result).toBe('/search-location')
  })

  test('should redirect to Welsh search when no processing and lang is cy', () => {
    mockRequest.query = { lang: 'cy' }
    mockYar.get.mockReturnValue(false)

    loadingController.handler(mockRequest, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith('/chwilio-lleoliad/cy')
  })

  test('should redirect to Welsh search when referer contains Welsh path', () => {
    mockRequest.headers = {
      referer: 'https://example.com/chwilio-lleoliad/cy'
    }
    mockYar.get.mockReturnValue(false)

    loadingController.handler(mockRequest, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith('/chwilio-lleoliad/cy')
  })

  test('should render loading view when NI processing is active', () => {
    mockYar.get.mockReturnValue(true)
    mockRequest.query = { postcode: 'BT1 1AA' }

    loadingController.handler(mockRequest, mockH)

    expect(mockYar.get).toHaveBeenCalledWith('niProcessing')
    expect(mockH.view).toHaveBeenCalledWith(
      'loading/index',
      expect.objectContaining({
        pageTitle: 'Loading air quality data',
        lang: 'en',
        preloader: expect.objectContaining({
          heading: 'Loading air quality data',
          statusUrl: '/loading-status',
          retryUrl: '/retry?postcode=BT1%201AA&lang=en'
        })
      })
    )
  })

  test('should use lang from payload', () => {
    mockYar.get.mockReturnValue(true)
    mockRequest.payload = { lang: 'cy' }

    loadingController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      'loading/index',
      expect.objectContaining({
        lang: 'cy'
      })
    )
  })

  test('should use lang from query when payload not set', () => {
    mockYar.get.mockReturnValue(true)
    mockRequest.query = { lang: 'cy' }

    loadingController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      'loading/index',
      expect.objectContaining({
        lang: 'cy'
      })
    )
  })

  test('should default to empty postcode in retry URL when not provided', () => {
    mockYar.get.mockReturnValue(true)

    loadingController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      'loading/index',
      expect.objectContaining({
        preloader: expect.objectContaining({
          retryUrl: '/retry?postcode=&lang=en'
        })
      })
    )
  })

  test('should include all required view properties', () => {
    mockYar.get.mockReturnValue(true)
    mockRequest.query = { postcode: 'BT1 1AA' }

    loadingController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalled()
    const viewCall = mockH.view.mock.calls[0]
    expect(viewCall[0]).toBe('loading/index')
    const viewModel = viewCall[1]

    expect(viewModel).toHaveProperty('pageTitle')
    expect(viewModel).toHaveProperty('serviceName')
    expect(viewModel).toHaveProperty('lang')
    expect(viewModel).toHaveProperty('currentPath', '/loading')
    expect(viewModel).toHaveProperty('page')
    expect(viewModel).toHaveProperty('phaseBanner')
    expect(viewModel).toHaveProperty('cookieBanner')
    expect(viewModel).toHaveProperty('footerTxt')
    expect(viewModel).toHaveProperty('description')
    expect(viewModel).toHaveProperty('metaSiteUrl')
    expect(viewModel).toHaveProperty('preloader')
  })
})
