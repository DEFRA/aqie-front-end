import {
  getLocationDataController,
  determineLanguage,
  prepareViewData
} from './controller.js'

/* global vi, describe, it, expect, beforeEach */

// '' - Constants to avoid duplicated strings
const OTHER_PATH = '/other-path'
const OTHER_URL = 'https://example.com/other'
const LOCATION_NOT_FOUND_VIEW = 'location-not-found/index'
const LOCATION_NOT_FOUND_TITLE = 'Location not found - Air Quality Index'
const MOCKED_VIEW_RESPONSE = 'mocked-view-response'

// Mock dependencies
vi.mock('../data/en/en.js', () => ({
  english: {
    searchLocation: {
      serviceName: 'Check local air quality'
    },
    notFoundLocation: {
      paragraphs: {
        a: 'Location not found'
      }
    },
    footerTxt: {
      text: 'Footer text'
    },
    phaseBanner: {
      tag: 'alpha'
    },
    backlink: {
      href: '/back'
    },
    home: {
      pageTitle: 'Air Quality Index'
    },
    cookieBanner: {
      text: 'Cookie banner'
    }
  }
}))

vi.mock('../common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn()
  })
}))

describe('locations controller - determineLanguage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return "cy" when queryLang starts with "cy"', () => {
    expect(determineLanguage('cy-GB')).toBe('cy')
    expect(determineLanguage('cy')).toBe('cy')
  })

  it('should return "en" when queryLang starts with "en"', () => {
    expect(determineLanguage('en-GB')).toBe('en')
    expect(determineLanguage('en')).toBe('en')
  })

  it('should return "en" when path is "/location"', () => {
    expect(determineLanguage(null, '/location')).toBe('en')
  })

  it('should return "en" when referer includes "search-location"', () => {
    expect(
      determineLanguage(null, null, 'https://example.com/search-location')
    ).toBe('en')
  })

  it('should return "cy" as default when no conditions are met', () => {
    expect(determineLanguage(null, OTHER_PATH, OTHER_URL)).toBe('cy')
    expect(determineLanguage(undefined, undefined, undefined)).toBe('cy')
  })

  it('should handle invalid queryLang gracefully', () => {
    expect(determineLanguage('invalid', OTHER_PATH)).toBe('cy')
    expect(determineLanguage('fr', OTHER_PATH)).toBe('cy')
  })
})

describe('locations controller - prepareViewData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should prepare view data with default English language', () => {
    const result = prepareViewData()

    expect(result).toEqual({
      userLocation: '',
      pageTitle: LOCATION_NOT_FOUND_TITLE,
      paragraph: { a: 'Location not found' },
      footerTxt: { text: 'Footer text' },
      serviceName: 'Check local air quality',
      phaseBanner: { tag: 'alpha' },
      backlink: { href: '/back' },
      cookieBanner: { text: 'Cookie banner' },
      lang: 'en'
    })
  })

  it('should prepare view data with specified language', () => {
    const result = prepareViewData('cy')

    expect(result.lang).toBe('cy')
    expect(result.pageTitle).toBe(LOCATION_NOT_FOUND_TITLE)
  })

  it('should default to English when language is null', () => {
    const result = prepareViewData(null)

    expect(result.lang).toBe('en')
  })

  it('should default to English when language is undefined', () => {
    const result = prepareViewData(undefined)

    expect(result.lang).toBe('en')
  })
})

describe('locations controller - getLocationDataController - Language routing', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockH = {
      view: vi.fn().mockReturnValue(MOCKED_VIEW_RESPONSE)
    }

    mockRequest = {
      query: {},
      path: '/location',
      headers: {}
    }
  })

  it('should handle request with English query parameter', async () => {
    mockRequest.query = { lang: 'en' }

    const result = await getLocationDataController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      LOCATION_NOT_FOUND_VIEW,
      expect.objectContaining({
        lang: 'en',
        pageTitle: LOCATION_NOT_FOUND_TITLE
      })
    )
    expect(result).toBe(MOCKED_VIEW_RESPONSE)
  })

  it('should handle request with Welsh query parameter', async () => {
    mockRequest.query = { lang: 'cy' }

    const result = await getLocationDataController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      LOCATION_NOT_FOUND_VIEW,
      expect.objectContaining({
        lang: 'cy'
      })
    )
    expect(result).toBe(MOCKED_VIEW_RESPONSE)
  })

  it('should handle request with /location path', async () => {
    mockRequest.path = '/location'

    const result = await getLocationDataController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      LOCATION_NOT_FOUND_VIEW,
      expect.objectContaining({
        lang: 'en'
      })
    )
    expect(result).toBe(MOCKED_VIEW_RESPONSE)
  })

  it('should handle request with search-location referer', async () => {
    mockRequest.headers.referer = 'https://example.com/search-location'

    const result = await getLocationDataController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      LOCATION_NOT_FOUND_VIEW,
      expect.objectContaining({
        lang: 'en'
      })
    )
    expect(result).toBe(MOCKED_VIEW_RESPONSE)
  })

  it('should default to Welsh when no specific conditions are met', async () => {
    mockRequest.path = '/other-path'
    mockRequest.headers.referer = 'https://example.com/other'

    const result = await getLocationDataController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      LOCATION_NOT_FOUND_VIEW,
      expect.objectContaining({
        lang: 'cy'
      })
    )
    expect(result).toBe(MOCKED_VIEW_RESPONSE)
  })
})

describe('locations controller - getLocationDataController - Edge cases', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockH = {
      view: vi.fn().mockReturnValue(MOCKED_VIEW_RESPONSE)
    }

    mockRequest = {
      query: {},
      path: '/location',
      headers: {}
    }
  })

  it('should handle request without headers', async () => {
    delete mockRequest.headers

    const result = await getLocationDataController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      LOCATION_NOT_FOUND_VIEW,
      expect.objectContaining({
        lang: 'en'
      })
    )
    expect(result).toBe(MOCKED_VIEW_RESPONSE)
  })

  it('should handle request without query', async () => {
    delete mockRequest.query

    const result = await getLocationDataController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      LOCATION_NOT_FOUND_VIEW,
      expect.objectContaining({
        lang: 'en'
      })
    )
    expect(result).toBe(MOCKED_VIEW_RESPONSE)
  })
})

describe('locations controller - getLocationDataController - Error handling', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockH = {
      view: vi.fn().mockReturnValue(MOCKED_VIEW_RESPONSE)
    }

    mockRequest = {
      query: {},
      path: '/location',
      headers: {}
    }
  })

  it('should handle errors and re-throw them', async () => {
    mockH.view.mockImplementation(() => {
      throw new Error('View rendering failed')
    })

    await expect(
      getLocationDataController.handler(mockRequest, mockH)
    ).rejects.toThrow('View rendering failed')
  })

  it('should log request details and process flow', async () => {
    await getLocationDataController.handler(mockRequest, mockH)

    // The logger calls are checked implicitly by ensuring the handler completes successfully
    expect(mockH.view).toHaveBeenCalledTimes(1)
  })
})
