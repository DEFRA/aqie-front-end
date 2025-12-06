import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPollutantHandler } from '../../../../src/server/common/helpers/pollutant-controller-helper.js'

// Constants for testing
const SEARCH_LOCATION_URL_EN = '/search-location?lang=en'
const HTTP_MOVED_PERMANENTLY = 301
const TEST_HOST = 'localhost:3000'

describe('pollutant-controller-helper edge cases', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = {
      info: {
        host: TEST_HOST
      },
      headers: {
        'x-forwarded-proto': 'http'
      }
    }

    mockH = {
      view: vi.fn((template, context) => ({ template, context })),
      redirect: vi.fn((url) => ({
        code: vi.fn((statusCode) => ({ url, statusCode }))
      }))
    }
  })

  describe('redirect status codes', () => {
    it('should use correct redirect status code for Welsh redirect', () => {
      mockRequest.query = {
        locationId: 'LOC808',
        lang: 'cy'
      }

      createPollutantHandler('particulateMatter10', mockRequest, mockH)

      const redirectResult = mockH.redirect.mock.results[0].value
      expect(redirectResult.code).toHaveBeenCalledWith(HTTP_MOVED_PERMANENTLY)
    })

    it('should use correct redirect status code for search location', () => {
      mockRequest.query = {}

      createPollutantHandler('sulphurDioxide', mockRequest, mockH)

      const redirectResult = mockH.redirect.mock.results[0].value
      expect(redirectResult.code).toHaveBeenCalledWith(HTTP_MOVED_PERMANENTLY)
    })
  })
})

describe('pollutant-controller-helper Welsh redirect with locationName', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = {
      info: {
        host: TEST_HOST
      },
      headers: {
        'x-forwarded-proto': 'http'
      }
    }

    mockH = {
      view: vi.fn((template, context) => ({ template, context })),
      redirect: vi.fn((url) => ({
        code: vi.fn((statusCode) => ({ url, statusCode }))
      }))
    }
  })

  it('should handle Welsh redirect with locationName but no searchTerms', () => {
    mockRequest.query = {
      locationId: 'LOC909',
      locationName: 'Caerphilly',
      lang: 'cy'
    }

    createPollutantHandler('nitrogenDioxide', mockRequest, mockH)

    const redirectCall = mockH.redirect.mock.calls[0][0]
    expect(redirectCall).toContain('lang=cy')
    expect(redirectCall).toContain('locationId=LOC909')
    expect(redirectCall).toContain('locationName=Caerphilly')
    expect(redirectCall).not.toContain('searchTerms')
  })
})

describe('pollutant-controller-helper Welsh redirect with searchTerms', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = {
      info: {
        host: TEST_HOST
      },
      headers: {
        'x-forwarded-proto': 'http'
      }
    }

    mockH = {
      view: vi.fn((template, context) => ({ template, context })),
      redirect: vi.fn((url) => ({
        code: vi.fn((statusCode) => ({ url, statusCode }))
      }))
    }
  })

  it('should handle Welsh redirect with searchTerms but no locationName', () => {
    mockRequest.query = {
      locationId: 'LOC1010',
      searchTerms: 'Wales',
      lang: 'cy'
    }

    createPollutantHandler('ozone', mockRequest, mockH)

    const redirectCall = mockH.redirect.mock.calls[0][0]
    expect(redirectCall).toContain('lang=cy')
    expect(redirectCall).toContain('locationId=LOC1010')
    expect(redirectCall).toContain('searchTerms=Wales')
    expect(redirectCall).not.toContain('locationName')
  })
})

describe('pollutant-controller-helper null/undefined query edge cases', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = {
      info: {
        host: TEST_HOST
      },
      headers: {
        'x-forwarded-proto': 'http'
      }
    }

    mockH = {
      view: vi.fn((template, context) => ({ template, context })),
      redirect: vi.fn((url) => ({
        code: vi.fn((statusCode) => ({ url, statusCode }))
      }))
    }
  })

  it('should handle request with null query object', () => {
    mockRequest.query = null

    createPollutantHandler('particulateMatter25', mockRequest, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith(SEARCH_LOCATION_URL_EN)
  })

  it('should handle request with undefined query object', () => {
    mockRequest.query = null

    createPollutantHandler('sulphurDioxide', mockRequest, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith(SEARCH_LOCATION_URL_EN)
  })
})

describe('pollutant-controller-helper view context edge cases', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = {
      info: {
        host: TEST_HOST
      },
      headers: {
        'x-forwarded-proto': 'http'
      }
    }

    mockH = {
      view: vi.fn((template, context) => ({ template, context })),
      redirect: vi.fn((url) => ({
        code: vi.fn((statusCode) => ({ url, statusCode }))
      }))
    }
  })

  it('should handle query with lang parameter other than cy or en', () => {
    mockRequest.query = {
      locationId: 'LOC1111',
      locationName: 'Oxford',
      lang: 'fr'
    }

    createPollutantHandler('nitrogenDioxide', mockRequest, mockH)

    const viewContext = mockH.view.mock.calls[0][1]
    expect(viewContext.lang).toBe('fr')
    expect(mockH.redirect).not.toHaveBeenCalled()
  })

  it('should include complete queryParams in view context', () => {
    mockRequest.query = {
      locationId: 'LOC1212',
      locationName: 'Bristol',
      searchTerms: 'Bristol',
      lang: 'en'
    }

    createPollutantHandler('ozone', mockRequest, mockH)

    const viewContext = mockH.view.mock.calls[0][1]
    expect(viewContext.locationId).toBe('LOC1212')
    expect(viewContext.locationName).toBe('Bristol')
    expect(viewContext.searchTerms).toBe('Bristol')
    expect(viewContext.lang).toBe('en')
  })
})
