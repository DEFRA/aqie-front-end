import { describe, expect, test, vi, beforeEach } from 'vitest'
import { loadingStatusController } from './status-controller.js'

// '' Mock logger
vi.mock('../common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}))

const buildRequest = ({ yar = null } = {}) => ({
  yar:
    yar ||
    vi.fn(() => ({
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn()
    }))
})

const buildH = () => ({
  response: vi.fn((data) => ({
    code: vi.fn((statusCode) => ({ data, statusCode }))
  }))
})

describe('loadingStatusController', () => {
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

  test('should return processing status when NI processing is active', async () => {
    mockYar.get.mockImplementation((key) => {
      if (key === 'niProcessing') return true
      return null
    })

    const result = await loadingStatusController.handler(mockRequest, mockH)

    expect(mockYar.get).toHaveBeenCalledWith('niProcessing')
    expect(mockH.response).toHaveBeenCalledWith({
      status: 'processing'
    })
    expect(result.statusCode).toBe(200)
  })

  test('should return complete status when redirectTo is set', async () => {
    mockYar.get.mockImplementation((key) => {
      if (key === 'niProcessing') return false
      if (key === 'niRedirectTo') return '/location/bt11aa?lang=en'
      return null
    })

    const result = await loadingStatusController.handler(mockRequest, mockH)

    expect(mockYar.get).toHaveBeenCalledWith('niRedirectTo')
    expect(mockH.response).toHaveBeenCalledWith({
      status: 'complete',
      redirectTo: '/location/bt11aa?lang=en'
    })
    expect(result.statusCode).toBe(200)
  })

  test('should return failed status when niError is set', async () => {
    mockYar.get.mockImplementation((key) => {
      if (key === 'niProcessing') return false
      if (key === 'niError') return 'service-unavailable'
      if (key === 'niPostcode') return 'BT1 1AA'
      if (key === 'lang') return 'en'
      return null
    })

    const result = await loadingStatusController.handler(mockRequest, mockH)

    expect(mockYar.get).toHaveBeenCalledWith('niError')
    expect(mockYar.get).toHaveBeenCalledWith('niPostcode')
    expect(mockYar.get).toHaveBeenCalledWith('lang')
    expect(mockH.response).toHaveBeenCalledWith({
      status: 'failed',
      redirectTo: '/retry?postcode=BT1%201AA&lang=en'
    })
    expect(result.statusCode).toBe(200)
  })

  test('should return failed status with default lang when lang not in session', async () => {
    mockYar.get.mockImplementation((key) => {
      if (key === 'niProcessing') return false
      if (key === 'niError') return 'service-unavailable'
      if (key === 'niPostcode') return 'BT2 2BB'
      return null
    })

    await loadingStatusController.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      status: 'failed',
      redirectTo: '/retry?postcode=BT2%202BB&lang=en'
    })
  })

  test('should return failed status with default postcode when not in session', async () => {
    mockYar.get.mockImplementation((key) => {
      if (key === 'niProcessing') return false
      if (key === 'niError') return 'service-unavailable'
      if (key === 'lang') return 'cy'
      return null
    })

    await loadingStatusController.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      status: 'failed',
      redirectTo: '/retry?postcode=&lang=cy'
    })
  })

  test('should return failed status with search redirect when no error or redirectTo', async () => {
    mockYar.get.mockReturnValue(false)

    const result = await loadingStatusController.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      status: 'failed',
      redirectTo: '/search-location'
    })
    expect(result.statusCode).toBe(200)
  })

  test('should prioritize error over redirectTo when both are set', async () => {
    mockYar.get.mockImplementation((key) => {
      if (key === 'niProcessing') return false
      if (key === 'niError') return 'service-unavailable'
      if (key === 'niPostcode') return 'BT1 1AA'
      if (key === 'lang') return 'en'
      if (key === 'niRedirectTo') return '/location/bt11aa?lang=en'
      return null
    })

    await loadingStatusController.handler(mockRequest, mockH)

    // Error check happens before redirectTo check
    expect(mockH.response).toHaveBeenCalledWith({
      status: 'failed',
      redirectTo: '/retry?postcode=BT1%201AA&lang=en'
    })
  })

  test('should handle Welsh language in error redirect', async () => {
    mockYar.get.mockImplementation((key) => {
      if (key === 'niProcessing') return false
      if (key === 'niError') return 'service-unavailable'
      if (key === 'niPostcode') return 'BT7 7AA'
      if (key === 'lang') return 'cy'
      return null
    })

    await loadingStatusController.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      status: 'failed',
      redirectTo: '/retry?postcode=BT7%207AA&lang=cy'
    })
  })
})
