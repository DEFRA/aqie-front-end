// ''
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  handleErrorInputAndRedirect,
  handleUKLocationType
} from './extra-middleware-helpers.js'

// Mock all dependencies
vi.mock('./middleware-helpers.js', () => ({
  processMatches: vi.fn(),
  deduplicateResults: vi.fn()
}))

vi.mock('./generate-title-data.js', () => ({
  generateTitleData: vi.fn()
}))

vi.mock('./handle-single-match-helper.js', () => ({
  handleSingleMatchHelper: vi.fn()
}))

vi.mock('./handle-multiple-match-helper.js', () => ({
  handleMultipleMatchesHelper: vi.fn()
}))

vi.mock('../../common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  })
}))

vi.mock('../../data/en/en.js', () => ({
  english: {
    notFoundUrl: '/not-found',
    phaseBanner: { tag: 'alpha' },
    footerTxt: 'Footer text',
    cookieBanner: { title: 'Cookies' },
    multipleLocations: { serviceName: 'Air Quality Service' }
  }
}))

vi.mock('../../data/constants.js', () => ({
  STATUS_NOT_FOUND: 404,
  PAGE_NOT_FOUND_MESSAGE: 'Page not found'
}))

describe('extra-middleware-helpers.js', () => {
  let mockRequest
  let mockH
  let mockProcessMatches
  let mockDeduplicateResults
  let mockGenerateTitleData
  let mockHandleSingleMatchHelper
  let mockHandleMultipleMatchesHelper

  beforeEach(async () => {
    vi.clearAllMocks()

    // Import mocked functions
    const middlewareHelpers = await import('./middleware-helpers.js')
    const generateTitleDataModule = await import('./generate-title-data.js')
    const singleMatchModule = await import('./handle-single-match-helper.js')
    const multipleMatchModule = await import(
      './handle-multiple-match-helper.js'
    )

    mockProcessMatches = middlewareHelpers.processMatches
    mockDeduplicateResults = middlewareHelpers.deduplicateResults
    mockGenerateTitleData = generateTitleDataModule.generateTitleData
    mockHandleSingleMatchHelper = singleMatchModule.handleSingleMatchHelper
    mockHandleMultipleMatchesHelper =
      multipleMatchModule.handleMultipleMatchesHelper

    // Mock request object
    mockRequest = {
      yar: {
        set: vi.fn(),
        clear: vi.fn(),
        get: vi.fn()
      },
      path: '/test-path'
    }

    // Mock h object with proper chaining
    const mockTakeover = vi.fn()
    const mockCode = vi.fn().mockReturnValue({
      takeover: mockTakeover
    })
    const mockRedirectResult = {
      takeover: mockTakeover
    }
    const mockViewResult = {
      code: mockCode
    }

    mockH = {
      redirect: vi.fn().mockReturnValue(mockRedirectResult),
      view: vi.fn().mockReturnValue(mockViewResult)
    }
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('handleErrorInputAndRedirect', () => {
    it('should redirect to location-not-found when no payload locationType and no searchTerms', () => {
      // ''
      const payload = { engScoWal: 'London' }
      const searchTerms = ''
      const lang = 'en'

      handleErrorInputAndRedirect(
        mockRequest,
        mockH,
        lang,
        payload,
        searchTerms
      )

      expect(mockRequest.yar.set).toHaveBeenCalledWith('locationDataNotFound', {
        locationNameOrPostcode: '',
        lang: 'en'
      })
      expect(mockH.redirect).toHaveBeenCalledWith('/location-not-found')
      expect(mockH.redirect().takeover).toBeDefined()
    })

    it('should return location data when payload has locationType', () => {
      // ''
      const payload = {
        locationType: 'UK',
        engScoWal: 'London'
      }
      const searchTerms = 'London Bridge'
      const lang = 'en'

      const result = handleErrorInputAndRedirect(
        mockRequest,
        mockH,
        lang,
        payload,
        searchTerms
      )

      expect(result).toEqual({
        locationType: 'UK',
        userLocation: 'London Bridge',
        locationNameOrPostcode: 'London Bridge'
      })
      expect(mockRequest.yar.set).not.toHaveBeenCalled()
    })

    it('should return location data when searchTerms provided', () => {
      // ''
      const payload = { engScoWal: 'London' }
      const searchTerms = 'Birmingham'
      const lang = 'cy'

      const result = handleErrorInputAndRedirect(
        mockRequest,
        mockH,
        lang,
        payload,
        searchTerms
      )

      expect(result).toEqual({
        locationType: '',
        userLocation: 'Birmingham',
        locationNameOrPostcode: 'Birmingham'
      })
    })

    it('should use NI location when payload has ni property', () => {
      // ''
      const payload = {
        locationType: 'NI',
        ni: 'Belfast'
      }
      const searchTerms = ''
      const lang = 'en'

      const result = handleErrorInputAndRedirect(
        mockRequest,
        mockH,
        lang,
        payload,
        searchTerms
      )

      expect(result).toEqual({
        locationType: 'NI',
        userLocation: 'Belfast',
        locationNameOrPostcode: 'Belfast'
      })
    })

    it('should handle empty payload gracefully', () => {
      // ''
      const payload = {}
      const searchTerms = ''
      const lang = 'en'

      handleErrorInputAndRedirect(
        mockRequest,
        mockH,
        lang,
        payload,
        searchTerms
      )

      expect(mockRequest.yar.set).toHaveBeenCalledWith('locationDataNotFound', {
        locationNameOrPostcode: '',
        lang: 'en'
      })
      expect(mockH.redirect).toHaveBeenCalledWith('/location-not-found')
    })

    it('should handle null payload gracefully', () => {
      // ''
      const payload = null
      const searchTerms = 'Test Location'
      const lang = 'cy'

      const result = handleErrorInputAndRedirect(
        mockRequest,
        mockH,
        lang,
        payload,
        searchTerms
      )

      expect(result).toEqual({
        locationType: '',
        userLocation: 'Test Location',
        locationNameOrPostcode: 'Test Location'
      })
    })
  })

  describe('handleUKLocationType', () => {
    const mockParams = {
      getOSPlaces: { results: [{ name: 'London', id: 1 }] },
      userLocation: 'London',
      locationNameOrPostcode: 'London',
      searchTerms: 'London',
      secondSearchTerm: 'City',
      lang: 'en'
    }

    it('should handle single match correctly', async () => {
      // ''
      const deduplicatedResults = [{ name: 'London', id: 1 }]
      const selectedMatches = [{ name: 'London', id: 1 }]
      const titleData = { title: 'London' }
      const singleMatchResult = { view: 'location-details' }

      mockDeduplicateResults.mockReturnValue(deduplicatedResults)
      mockProcessMatches.mockReturnValue({ selectedMatches })
      mockGenerateTitleData.mockReturnValue(titleData)
      mockHandleSingleMatchHelper.mockResolvedValue(singleMatchResult)

      const result = await handleUKLocationType(mockRequest, mockH, mockParams)

      expect(mockDeduplicateResults).toHaveBeenCalledWith([
        { name: 'London', id: 1 }
      ])
      expect(mockProcessMatches).toHaveBeenCalledWith(
        deduplicatedResults,
        'London',
        'London',
        'London',
        'City'
      )
      expect(mockGenerateTitleData).toHaveBeenCalledWith(
        selectedMatches,
        'London'
      )
      expect(mockHandleSingleMatchHelper).toHaveBeenCalledWith(
        mockH,
        mockRequest,
        mockParams,
        selectedMatches,
        titleData
      )
      expect(result).toEqual(singleMatchResult)
    })

    it('should handle multiple matches correctly', async () => {
      // ''
      const deduplicatedResults = [
        { name: 'London', id: 1 },
        { name: 'London Bridge', id: 2 }
      ]
      const selectedMatches = [
        { name: 'London', id: 1 },
        { name: 'London Bridge', id: 2 }
      ]
      const multipleMatchResult = { view: 'multiple-results' }

      mockDeduplicateResults.mockReturnValue(deduplicatedResults)
      mockProcessMatches.mockReturnValue({ selectedMatches })
      mockHandleMultipleMatchesHelper.mockResolvedValue(multipleMatchResult)

      const result = await handleUKLocationType(mockRequest, mockH, mockParams)

      expect(mockHandleMultipleMatchesHelper).toHaveBeenCalledWith(
        mockH,
        mockRequest,
        mockParams,
        selectedMatches
      )
      expect(result).toEqual(multipleMatchResult)
    })

    it('should redirect to location-not-found when no matches and no searchTerms', async () => {
      // ''
      const paramsNoSearchTerms = { ...mockParams, searchTerms: '' }

      mockDeduplicateResults.mockReturnValue([])
      mockProcessMatches.mockReturnValue({ selectedMatches: [] })

      await handleUKLocationType(mockRequest, mockH, paramsNoSearchTerms)

      expect(mockRequest.yar.set).toHaveBeenCalledWith('locationDataNotFound', {
        locationNameOrPostcode: 'London',
        lang: 'en'
      })
      expect(mockRequest.yar.clear).toHaveBeenCalledWith('searchTermsSaved')
      expect(mockH.redirect).toHaveBeenCalledWith('/location-not-found')
      expect(mockH.redirect().takeover).toBeDefined()
    })

    it('should render error view when no matches but searchTerms exist', async () => {
      // ''
      mockDeduplicateResults.mockReturnValue([])
      mockProcessMatches.mockReturnValue({ selectedMatches: [] })

      await handleUKLocationType(mockRequest, mockH, mockParams)

      expect(mockRequest.yar.set).toHaveBeenCalledWith('locationDataNotFound', {
        locationNameOrPostcode: 'London',
        lang: 'en'
      })
      expect(mockRequest.yar.clear).toHaveBeenCalledWith('searchTermsSaved')
      expect(mockH.view).toHaveBeenCalledWith('error/index', {
        pageTitle: 'Page not found',
        heading: 'Page not found',
        statusCode: 404,
        message: 'Page not found',
        url: '/test-path',
        notFoundUrl: '/not-found',
        displayBacklink: false,
        phaseBanner: { tag: 'alpha' },
        footerTxt: 'Footer text',
        cookieBanner: { title: 'Cookies' },
        serviceName: 'Air Quality Service',
        lang: 'en'
      })
      expect(mockH.view().code).toBeDefined()
      expect(mockH.view().code().takeover).toBeDefined()
    })

    it('should handle empty results array', async () => {
      // ''
      const emptyParams = { ...mockParams, getOSPlaces: { results: [] } }

      mockDeduplicateResults.mockReturnValue([])
      mockProcessMatches.mockReturnValue({ selectedMatches: [] })

      await handleUKLocationType(mockRequest, mockH, emptyParams)

      expect(mockDeduplicateResults).toHaveBeenCalledWith([])
    })

    it('should handle Welsh language correctly', async () => {
      // ''
      const welshParams = { ...mockParams, lang: 'cy' }

      mockDeduplicateResults.mockReturnValue([])
      mockProcessMatches.mockReturnValue({ selectedMatches: [] })

      await handleUKLocationType(mockRequest, mockH, welshParams)

      expect(mockRequest.yar.set).toHaveBeenCalledWith('locationDataNotFound', {
        locationNameOrPostcode: 'London',
        lang: 'cy'
      })
    })
  })
})
