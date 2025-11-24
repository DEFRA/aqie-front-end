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
    isValidFullPostcodeUK,
    isValidPartialPostcodeUK,
    isMockEnabled
  } from './location-helpers.js'
  
  // Mock config for isMockEnabled test ''
  vi.mock('../../../config/index.js', () => ({
    config: {
      get: vi.fn((key) => key === 'enabledMock' ? true : null)
    }
  }))
  
  // Mocks
  const mockConfig = {
    get: vi.fn((key) => {
      if (key === 'osPlacesApiPostcodeNorthernIrelandUrl') return 'https://real/';
      if (key === 'mockOsPlacesApiPostcodeNorthernIrelandUrl') return 'https://mock/';
      if (key === 'enabledMock') return true;
      return null;
    })
  }
  const mockFormatNI = vi.fn((postcode) => postcode)
  const mockLogger = { error: vi.fn() }
  
  describe('location-helpers', () => {
    it('buildUKLocationFilters returns correct string', () => {
      expect(buildUKLocationFilters()).toBe(
        'LOCAL_TYPE:City+LOCAL_TYPE:Town+LOCAL_TYPE:Village+LOCAL_TYPE:Suburban_Area+LOCAL_TYPE:Postcode+LOCAL_TYPE:Airport'
      ) // ''
    })
  
    it('combineUKSearchTerms returns combined terms if not postcode', () => {
      const result = combineUKSearchTerms(
        'abc',
        'search',
        'second',
        () => false,
        () => false
      )
      expect(result).toBe('search second') // ''
    })
  
    it('combineUKSearchTerms returns userLocation if postcode', () => {
      const result = combineUKSearchTerms(
        'SW1A 1AA',
        'search',
        'second',
        () => true,
        () => false
      )
      expect(result).toBe('SW1A 1AA') // ''
    })
  
    it('buildUKApiUrl returns correct url', () => {
      const url = buildUKApiUrl('London', 'filter', 'https://api/', 'key123')
      expect(url).toContain('London')
      expect(url).toContain('filter')
      expect(url).toContain('key123')
    })
  
    it('shouldCallUKApi returns false if symbol present', () => {
      expect(shouldCallUKApi('London!', ['!'])).toBe(false) // ''
    })
  
    it('shouldCallUKApi returns true if no symbol present', () => {
      expect(shouldCallUKApi('London', ['!'])).toBe(true) // ''
    })
  
    it('formatUKApiResponse returns results from .results', () => {
      expect(formatUKApiResponse({ results: [1, 2] })).toEqual({ results: [1, 2] }) // ''
    })
  
    it('formatUKApiResponse returns results from array', () => {
      expect(formatUKApiResponse([1, 2])).toEqual({ results: [1, 2] }) // ''
    })
  
    it('formatUKApiResponse returns results from .name', () => {
      expect(formatUKApiResponse({ name: 'Test' })).toEqual({ results: [{ name: 'Test' }] }) // ''
    })
  
    it('formatUKApiResponse returns empty results', () => {
      expect(formatUKApiResponse(null)).toEqual({ results: [] }) // ''
    })
  
    it('buildNIPostcodeUrl returns mock url if isMockEnabled', () => {
      const url = buildNIPostcodeUrl('BT1', true, mockConfig, mockFormatNI)
      expect(url).toContain('https://mock/')
    })
  
    it('buildNIPostcodeUrl returns real url if not mock', () => {
      const url = buildNIPostcodeUrl('BT1', false, mockConfig, mockFormatNI)
      expect(url).toContain('https://real/')
    })
  
    it('formatNIResponse returns results from .results', () => {
      expect(formatNIResponse({ results: [1, 2] })).toEqual({ results: [1, 2] }) // ''
    })
  
    it('formatNIResponse returns results from array', () => {
      expect(formatNIResponse([1, 2])).toEqual({ results: [1, 2] }) // ''
    })
  
    it('formatNIResponse returns results from .name', () => {
      expect(formatNIResponse({ name: 'Test' })).toEqual({ results: [{ name: 'Test' }] }) // ''
    })
  
    it('formatNIResponse returns empty results', () => {
      expect(formatNIResponse(null)).toEqual({ results: [] }) // ''
    })
  
    it('isTestMode returns true if NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test'
      expect(isTestMode()).toBe(true) // ''
    })
  
    it('isProductionMode returns true if NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production'
      expect(isProductionMode()).toBe(true) // ''
    })
  
    it('errorResponse returns error object', () => {
      expect(errorResponse('fail', 404)).toEqual({ error: true, message: 'fail', statusCode: 404 }) // ''
    })
  
    it('validateParams returns error if missing', () => {
      expect(validateParams({ a: 1 }, ['a', 'b'])).toEqual({ error: true, message: 'Missing required parameter: b', statusCode: 400 }) // ''
    })
  
    it('validateParams returns null if all present', () => {
      expect(validateParams({ a: 1, b: 2 }, ['a', 'b'])).toBeNull() // ''
    })
  
    it('fetchApi returns error if fetch fails', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('fail')))
      const result = await fetchApi('url', {}, mockLogger)
      expect(result.error).toBe(true)
      expect(mockLogger.error).toHaveBeenCalled()
    })
  
    it('fetchApi returns error if response not ok', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: () => Promise.resolve({})
        })
      )
      const result = await fetchApi('url', {}, mockLogger)
      expect(result.error).toBe(true)
      expect(result.statusCode).toBe(400)
    })
  
    it('fetchApi returns data if response ok', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ foo: 'bar' })
        })
      )
      const result = await fetchApi('url', {}, mockLogger)
      expect(result.error).toBe(false)
      expect(result.data).toEqual({ foo: 'bar' })
    })
  
    it('getToken returns token from headers', () => {
      expect(getToken({ headers: { authorization: 'token' } })).toBe('token') // ''
    })
  
    it('getToken returns null if no token', () => {
      expect(getToken({})).toBeNull() // ''
    })
  
    it('isMockEnabled returns value from config', () => {
      expect(isMockEnabled()).toBe(true) // ''
    })
  })