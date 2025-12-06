/* global describe, it, expect, beforeEach, afterEach, vi */

import {
  buildUKLocationFilters,
  combineUKSearchTerms,
  buildUKApiUrl,
  shouldCallUKApi,
  formatUKApiResponse,
  buildNIPostcodeUrl,
  formatNIResponse,
  isTestMode,
  isProductionMode,
  errorResponse,
  validateParams,
  fetchApi,
  getToken,
  isMockEnabled
} from './location-helpers.js'
import {
  STATUS_BAD_REQUEST,
  STATUS_INTERNAL_SERVER_ERROR
} from '../../data/constants.js'

// ''
const MANCHESTER_CITY = 'manchester city'
const LOCAL_TYPE_CITY = 'LOCAL_TYPE:City'
const HTTP_NOT_FOUND = 404

describe('location-helpers - buildUKLocationFilters', () => {
  it('should return UK location filters as a concatenated string', () => {
    const result = buildUKLocationFilters()
    expect(result).toBe(
      'LOCAL_TYPE:City+LOCAL_TYPE:Town+LOCAL_TYPE:Village+LOCAL_TYPE:Suburban_Area+LOCAL_TYPE:Postcode+LOCAL_TYPE:Airport'
    )
  })
})

describe('location-helpers - combineUKSearchTerms', () => {
  it('should combine search terms when not a valid postcode', () => {
    const mockIsValidFull = vi.fn().mockReturnValue(false)
    const mockIsValidPartial = vi.fn().mockReturnValue(false)

    const result = combineUKSearchTerms(
      'manchester',
      'manchester',
      'city',
      mockIsValidFull,
      mockIsValidPartial
    )

    expect(result).toBe(MANCHESTER_CITY)
    expect(mockIsValidFull).toHaveBeenCalledWith('MANCHESTER')
    expect(mockIsValidPartial).toHaveBeenCalledWith('MANCHESTER')
  })

  it('should return userLocation when it is a valid full postcode', () => {
    const mockIsValidFull = vi.fn().mockReturnValue(true)
    const mockIsValidPartial = vi.fn().mockReturnValue(false)

    const result = combineUKSearchTerms(
      'SW1A 1AA',
      'SW1A 1AA',
      'london',
      mockIsValidFull,
      mockIsValidPartial
    )

    expect(result).toBe('SW1A 1AA')
  })

  it('should return userLocation when it is a valid partial postcode', () => {
    const mockIsValidFull = vi.fn().mockReturnValue(false)
    const mockIsValidPartial = vi.fn().mockReturnValue(true)

    const result = combineUKSearchTerms(
      'SW1A',
      'SW1A',
      'london',
      mockIsValidFull,
      mockIsValidPartial
    )

    expect(result).toBe('SW1A')
  })

  it('should return userLocation when secondSearchTerm is UNDEFINED', () => {
    const mockIsValidFull = vi.fn().mockReturnValue(false)
    const mockIsValidPartial = vi.fn().mockReturnValue(false)

    const result = combineUKSearchTerms(
      'manchester',
      'manchester',
      'UNDEFINED',
      mockIsValidFull,
      mockIsValidPartial
    )

    expect(result).toBe('manchester')
  })

  it('should return userLocation when searchTerms is empty', () => {
    const mockIsValidFull = vi.fn().mockReturnValue(false)
    const mockIsValidPartial = vi.fn().mockReturnValue(false)

    const result = combineUKSearchTerms(
      'manchester',
      '',
      'city',
      mockIsValidFull,
      mockIsValidPartial
    )

    expect(result).toBe('manchester')
  })
})

describe('location-helpers - buildUKApiUrl', () => {
  it('should build UK API URL with encoded parameters', () => {
    const result = buildUKApiUrl(
      MANCHESTER_CITY,
      LOCAL_TYPE_CITY,
      'https://api.os.uk/search/names/v1/find?query=',
      'test-api-key'
    )

    expect(result).toContain('https://api.os.uk/search/names/v1/find?query=')
    expect(result).toContain(encodeURIComponent(MANCHESTER_CITY))
    expect(result).toContain('fq=' + encodeURIComponent(LOCAL_TYPE_CITY))
    expect(result).toContain('key=test-api-key')
  })

  it('should handle special characters in userLocation', () => {
    const result = buildUKApiUrl(
      'test & location',
      LOCAL_TYPE_CITY,
      'https://api.os.uk/',
      'key123'
    )

    expect(result).toContain(encodeURIComponent('test & location'))
  })
})

describe('location-helpers - shouldCallUKApi', () => {
  const symbols = ['%', '$', '&', '#', '!']

  it('should return true when userLocation has no symbols', () => {
    const result = shouldCallUKApi('manchester', symbols)
    expect(result).toBe(true)
  })

  it('should return false when userLocation contains %', () => {
    const result = shouldCallUKApi('man%chester', symbols)
    expect(result).toBe(false)
  })

  it('should return false when userLocation contains $', () => {
    const result = shouldCallUKApi('man$chester', symbols)
    expect(result).toBe(false)
  })

  it('should return false when userLocation contains &', () => {
    const result = shouldCallUKApi('man&chester', symbols)
    expect(result).toBe(false)
  })

  it('should return false when userLocation contains #', () => {
    const result = shouldCallUKApi('man#chester', symbols)
    expect(result).toBe(false)
  })

  it('should return false when userLocation contains !', () => {
    const result = shouldCallUKApi('man!chester', symbols)
    expect(result).toBe(false)
  })
})

describe('location-helpers - formatUKApiResponse', () => {
  it('should format response with results array', () => {
    const mockResponse = {
      results: [{ name: 'Location 1' }, { name: 'Location 2' }]
    }
    const result = formatUKApiResponse(mockResponse)
    expect(result).toEqual({ results: mockResponse.results })
  })

  it('should format response when getOSPlaces is an array', () => {
    const mockResponse = [{ name: 'Location 1' }, { name: 'Location 2' }]
    const result = formatUKApiResponse(mockResponse)
    expect(result).toEqual({ results: mockResponse })
  })

  it('should format response when getOSPlaces has a name property', () => {
    const mockResponse = { name: 'Single Location' }
    const result = formatUKApiResponse(mockResponse)
    expect(result).toEqual({ results: [mockResponse] })
  })

  it('should return empty results array for undefined input', () => {
    const result = formatUKApiResponse(undefined)
    expect(result).toEqual({ results: [] })
  })

  it('should return empty results array for null input', () => {
    const result = formatUKApiResponse(null)
    expect(result).toEqual({ results: [] })
  })

  it('should return empty results array for empty object', () => {
    const result = formatUKApiResponse({})
    expect(result).toEqual({ results: [] })
  })
})

describe('location-helpers - buildNIPostcodeUrl', () => {
  const mockConfig = {
    get: vi.fn()
  }
  const mockFormatPostcode = vi.fn((postcode) => postcode)

  beforeEach(() => {
    mockConfig.get.mockReset()
    mockFormatPostcode.mockClear()
  })

  it('should build mock URL when isMockEnabled is true', () => {
    mockConfig.get.mockImplementation((key) => {
      if (key === 'mockOsPlacesApiPostcodeNorthernIrelandUrl') {
        return 'http://localhost:3000/mock-ni?postcode='
      }
      return ''
    })

    const result = buildNIPostcodeUrl(
      'BT1 1AA',
      true,
      mockConfig,
      mockFormatPostcode
    )

    expect(result).toContain('http://localhost:3000/mock-ni?postcode=')
    expect(result).toContain('BT1%201AA')
    expect(result).toContain('_limit=1')
    expect(mockFormatPostcode).toHaveBeenCalledWith('BT1 1AA')
  })

  it('should build production URL when isMockEnabled is false', () => {
    mockConfig.get.mockImplementation((key) => {
      if (key === 'osPlacesApiPostcodeNorthernIrelandUrl') {
        return 'https://api.os.uk/ni/postcode?postcode='
      }
      return ''
    })

    const result = buildNIPostcodeUrl(
      'BT1 1AA',
      false,
      mockConfig,
      mockFormatPostcode
    )

    expect(result).toContain('https://api.os.uk/ni/postcode?postcode=')
    expect(result).toContain('BT1%201AA')
    expect(result).toContain('maxresults=1')
  })
})

describe('location-helpers - formatNIResponse', () => {
  it('should format response with results array', () => {
    const mockResponse = {
      results: [{ name: 'Belfast' }, { name: 'Derry' }]
    }
    const result = formatNIResponse(mockResponse)
    expect(result).toEqual({ results: mockResponse.results })
  })

  it('should format response when getNIPlaces is an array', () => {
    const mockResponse = [{ name: 'Belfast' }, { name: 'Derry' }]
    const result = formatNIResponse(mockResponse)
    expect(result).toEqual({ results: mockResponse })
  })

  it('should format response when getNIPlaces has a name property', () => {
    const mockResponse = { name: 'Belfast' }
    const result = formatNIResponse(mockResponse)
    expect(result).toEqual({ results: [mockResponse] })
  })

  it('should return empty results array for undefined input', () => {
    const result = formatNIResponse(undefined)
    expect(result).toEqual({ results: [] })
  })

  it('should return empty results array for null input', () => {
    const result = formatNIResponse(null)
    expect(result).toEqual({ results: [] })
  })
})

describe('location-helpers - isTestMode', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  it('should return true when NODE_ENV is test', () => {
    process.env.NODE_ENV = 'test'
    const result = isTestMode()
    expect(result).toBe(true)
  })

  it('should return false when NODE_ENV is not test', () => {
    process.env.NODE_ENV = 'production'
    const result = isTestMode()
    expect(result).toBe(false)
  })

  it('should return false when NODE_ENV is development', () => {
    process.env.NODE_ENV = 'development'
    const result = isTestMode()
    expect(result).toBe(false)
  })
})

describe('location-helpers - isProductionMode', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  it('should return true when NODE_ENV is production', () => {
    process.env.NODE_ENV = 'production'
    const result = isProductionMode()
    expect(result).toBe(true)
  })

  it('should return false when NODE_ENV is test', () => {
    process.env.NODE_ENV = 'test'
    const result = isProductionMode()
    expect(result).toBe(false)
  })

  it('should return false when NODE_ENV is development', () => {
    process.env.NODE_ENV = 'development'
    const result = isProductionMode()
    expect(result).toBe(false)
  })
})

describe('location-helpers - isMockEnabled', () => {
  it('should return the enabledMock config value', () => {
    const result = isMockEnabled()
    expect(typeof result).toBe('boolean')
  })

  it('should return boolean value from config', () => {
    const result = isMockEnabled()
    expect(typeof result).toBe('boolean')
  })
})

describe('location-helpers - errorResponse', () => {
  it('should return error object with default status code 500', () => {
    const result = errorResponse('Something went wrong')
    expect(result).toEqual({
      error: true,
      message: 'Something went wrong',
      statusCode: STATUS_INTERNAL_SERVER_ERROR
    })
  })

  it('should return error object with custom status code', () => {
    const result = errorResponse('Not found', HTTP_NOT_FOUND)
    expect(result).toEqual({
      error: true,
      message: 'Not found',
      statusCode: HTTP_NOT_FOUND
    })
  })

  it('should return error object with status code 400', () => {
    const result = errorResponse('Bad request', STATUS_BAD_REQUEST)
    expect(result).toEqual({
      error: true,
      message: 'Bad request',
      statusCode: STATUS_BAD_REQUEST
    })
  })
})

describe('location-helpers - validateParams', () => {
  it('should return null when all required params are present', () => {
    const params = { name: 'John', age: 30, city: 'London' }
    const result = validateParams(params, ['name', 'age'])
    expect(result).toBeNull()
  })

  it('should return error when required param is missing', () => {
    const params = { name: 'John' }
    const result = validateParams(params, ['name', 'age'])
    expect(result).toEqual({
      error: true,
      message: 'Missing required parameter: age',
      statusCode: STATUS_BAD_REQUEST
    })
  })

  it('should return error for first missing param', () => {
    const params = {}
    const result = validateParams(params, ['name', 'age', 'city'])
    expect(result).toEqual({
      error: true,
      message: 'Missing required parameter: name',
      statusCode: STATUS_BAD_REQUEST
    })
  })

  it('should return null when requiredKeys is empty array', () => {
    const params = { name: 'John' }
    const result = validateParams(params, [])
    expect(result).toBeNull()
  })

  it('should return null when no requiredKeys provided', () => {
    const params = { name: 'John' }
    const result = validateParams(params)
    expect(result).toBeNull()
  })
})

describe('location-helpers - getToken', () => {
  it('should return token from authorization header', () => {
    const req = {
      headers: {
        authorization: 'Bearer token123'
      }
    }
    const result = getToken(req)
    expect(result).toBe('Bearer token123')
  })

  it('should return null when authorization header is missing', () => {
    const req = {
      headers: {}
    }
    const result = getToken(req)
    expect(result).toBeNull()
  })

  it('should return null when headers object is missing', () => {
    const req = {}
    const result = getToken(req)
    expect(result).toBeNull()
  })

  it('should return null when req is undefined', () => {
    const result = getToken(undefined)
    expect(result).toBeNull()
  })

  it('should return null when req is null', () => {
    const result = getToken(null)
    expect(result).toBeNull()
  })
})

// ''
describe('location-helpers - fetchApi successful requests', () => {
  it('should return data when API request is successful', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ result: 'success' })
    }
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse)
    const mockLogger = { error: vi.fn() }
    const result = await fetchApi(
      'https://api.example.com/data',
      mockLogger,
      {}
    )

    expect(result).toEqual({ error: false, data: { result: 'success' } })
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/data',
      {}
    )
    expect(mockLogger.error).not.toHaveBeenCalled()
  })

  it('should pass options to fetch request', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ data: 'test' })
    }
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse)
    const mockLogger = { error: vi.fn() }
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }
    await fetchApi('https://api.example.com/post', mockLogger, options)

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/post',
      options
    )
  })
})

describe('location-helpers - fetchApi error handling', () => {
  it('should return error response when API response is not ok', async () => {
    const mockResponse = {
      ok: false,
      status: HTTP_NOT_FOUND,
      statusText: 'Not Found'
    }
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse)
    const mockLogger = { error: vi.fn() }
    const result = await fetchApi(
      'https://api.example.com/missing',
      mockLogger,
      {}
    )

    expect(result).toEqual({
      error: true,
      message: 'API request failed: Not Found',
      statusCode: HTTP_NOT_FOUND
    })
    expect(mockLogger.error).not.toHaveBeenCalled()
  })

  it('should return error response when fetch throws an error', async () => {
    const fetchError = new Error('Network error')
    globalThis.fetch = vi.fn().mockRejectedValue(fetchError)
    const mockLogger = { error: vi.fn() }
    const result = await fetchApi(
      'https://api.example.com/error',
      mockLogger,
      {}
    )

    expect(result).toEqual({
      error: true,
      message: 'API request error',
      statusCode: 500
    })
    expect(mockLogger.error).toHaveBeenCalledWith(
      'API request error:',
      fetchError
    )
  })
})
