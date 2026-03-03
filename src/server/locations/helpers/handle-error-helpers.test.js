import { handleNoSearchTerms, handleSearchTerms } from './handle-error-helpers'
import {
  handleMissingLocation,
  handleUKError,
  handleNIError,
  formatPostcode
} from './error-input-and-redirect-helpers.js'
import { getAirQuality } from '../../data/en/air-quality.js'
import { getLocationNameOrPostcode } from './location-type-util.js'
import {
  convertStringToHyphenatedLowercaseWords,
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK,
  isValidFullPostcodeNI,
  isValidPartialPostcodeNI
} from './convert-string.js'
import { LOCATION_TYPE_UK, LOCATION_TYPE_NI } from '../../data/constants.js'
import { vi } from 'vitest'

// Mock dependencies
vi.mock('./error-input-and-redirect-helpers.js', () => ({
  handleMissingLocation: vi.fn(),
  handleUKError: vi.fn(),
  handleNIError: vi.fn(),
  formatPostcode: vi.fn()
}))

vi.mock('../../data/en/air-quality.js', () => ({
  getAirQuality: vi.fn((aqValue) => ({
    value: aqValue || '4',
    band: 'moderate',
    readableBand: 'moderate',
    advice:
      'For most people, short term exposure to moderate levels of air pollution is not an issue.',
    atrisk: {
      adults:
        'Adults who have heart problems and feel unwell should consider doing less strenuous exercise, especially outside.',
      asthma:
        'People with asthma should be prepared to use their reliever inhaler.',
      oldPeople:
        'Older people should consider doing less strenuous activity, especially outside.'
    },
    outlook:
      'The influx of warm air from the continent is resulting in moderate air pollution levels throughout many areas today.'
  }))
}))

vi.mock('./location-type-util.js', () => ({
  getLocationNameOrPostcode: vi.fn()
}))

vi.mock('./convert-string.js', () => ({
  convertStringToHyphenatedLowercaseWords: vi.fn(),
  isValidFullPostcodeUK: vi.fn(),
  isValidFullPostcodeNI: vi.fn(() => false),
  isValidPartialPostcodeNI: vi.fn(() => false),
  isValidPartialPostcodeUK: vi.fn(() => false),
  isOnlyWords: vi.fn(() => true)
}))

const GOOD_AIR_QUALITY = 'Good Air Quality'

// Shared test setup utilities
const setupMocks = () => {
  isValidFullPostcodeUK.mockReturnValue(false)
  convertStringToHyphenatedLowercaseWords.mockReturnValue(false)
  getLocationNameOrPostcode.mockReturnValue(null)
  formatPostcode.mockReturnValue(null)
  getAirQuality.mockReturnValue('Good Air Quality')
}

const createMockRequest = () => ({
  payload: {},
  yar: {
    get: vi.fn(),
    set: vi.fn()
  }
})

const createMockH = () => ({
  redirect: vi.fn(() => ({ code: vi.fn(() => ({ takeover: vi.fn() })) })),
  view: vi.fn().mockReturnValue('view rendered')
})

const createMockPayload = () => ({
  locationType: LOCATION_TYPE_UK,
  engScoWal: 'London',
  ni: '',
  aq: 'good'
})

describe('handle-error-helpers - handleNoSearchTerms error cases', () => {
  let mockRequest, mockH, mockPayload

  beforeEach(() => {
    mockRequest = createMockRequest()
    mockH = createMockH()
    mockPayload = createMockPayload()
    setupMocks()
    vi.clearAllMocks()
  })

  it('should call handleMissingLocation when locationType or locationNameOrPostcode is missing', () => {
    // Arrange
    mockRequest.payload = {}
    mockRequest.yar.get.mockReturnValueOnce(null).mockReturnValueOnce(null)

    // Act
    handleNoSearchTerms(mockRequest, mockH, 'en', mockPayload)

    // Assert
    expect(handleMissingLocation).toHaveBeenCalledWith(mockRequest, mockH, 'en')
  })

  it('should call handleUKError when userLocation is invalid and locationType is UK', () => {
    // Arrange
    mockRequest.payload = { locationType: LOCATION_TYPE_UK }
    mockRequest.yar.get
      .mockReturnValueOnce(LOCATION_TYPE_UK)
      .mockReturnValueOnce('InvalidLocation')
    getLocationNameOrPostcode.mockReturnValue('InvalidLocation')
    formatPostcode.mockReturnValue(null)

    // Act
    handleNoSearchTerms(mockRequest, mockH, 'en', mockPayload)

    // Assert
    expect(handleUKError).toHaveBeenCalledWith(
      mockRequest,
      mockH,
      'en',
      'InvalidLocation'
    )
  })

  it('should call handleNIError when userLocation is invalid and locationType is NI', () => {
    // Arrange
    mockRequest.payload = { locationType: LOCATION_TYPE_NI }
    mockRequest.yar.get
      .mockReturnValueOnce(LOCATION_TYPE_NI)
      .mockReturnValueOnce('InvalidLocation')
    getLocationNameOrPostcode.mockReturnValue('InvalidLocation')
    formatPostcode.mockReturnValue(null)

    // Act
    handleNoSearchTerms(mockRequest, mockH, 'en', mockPayload)

    // Assert
    expect(handleNIError).toHaveBeenCalledWith(
      mockRequest,
      mockH,
      'en',
      'InvalidLocation'
    )
  })
})

describe('handle-error-helpers - handleNoSearchTerms valid location', () => {
  let mockRequest, mockH, mockPayload

  beforeEach(() => {
    mockRequest = createMockRequest()
    mockH = createMockH()
    mockPayload = createMockPayload()
    setupMocks()
    vi.clearAllMocks()
  })

  it('should return location details when userLocation is valid', () => {
    // Arrange
    mockRequest.payload = { locationType: LOCATION_TYPE_UK }
    mockRequest.yar.get
      .mockReturnValueOnce(LOCATION_TYPE_UK)
      .mockReturnValueOnce('London')
    getLocationNameOrPostcode.mockReturnValue('London')
    formatPostcode.mockReturnValue('LONDON')
    getAirQuality.mockReturnValue(GOOD_AIR_QUALITY)

    // Act
    const result = handleNoSearchTerms(mockRequest, mockH, 'en', mockPayload)

    // Assert
    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'locationType',
      LOCATION_TYPE_UK
    )
    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'locationNameOrPostcode',
      'London'
    )
    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'airQuality',
      GOOD_AIR_QUALITY
    )
    expect(result).toEqual({
      locationType: LOCATION_TYPE_UK,
      userLocation: 'LONDON',
      locationNameOrPostcode: 'London'
    })
  })
})

describe('handle-error-helpers - handleSearchTerms', () => {
  beforeEach(() => {
    setupMocks()
    vi.clearAllMocks()
  })

  describe('handleSearchTerms', () => {
    it('should return default UK location details for invalid search terms', () => {
      // Act
      const result = handleSearchTerms('InvalidSearchTerm')

      // Assert
      expect(result).toEqual({
        locationType: 'uk-location',
        userLocation: 'InvalidSearchTerm',
        locationNameOrPostcode: 'InvalidSearchTerm'
      })
    })

    it('should handle valid UK full postcode', () => {
      isValidFullPostcodeUK.mockReturnValue(true)
      const result = handleSearchTerms('SW1A 1AA')

      expect(result).toEqual({
        locationType: LOCATION_TYPE_UK,
        userLocation: 'SW1A 1AA',
        locationNameOrPostcode: 'SW1A 1AA'
      })
    })

    it('should handle valid UK partial postcode', () => {
      isValidPartialPostcodeUK.mockReturnValue(true)
      const result = handleSearchTerms('SW1A')

      expect(result).toEqual({
        locationType: LOCATION_TYPE_UK,
        userLocation: 'SW1A',
        locationNameOrPostcode: 'SW1A'
      })
    })

    it('should handle valid NI full postcode', () => {
      // Reset all mocks first
      isValidFullPostcodeUK.mockReturnValue(false)
      isValidPartialPostcodeUK.mockReturnValue(false)
      isValidFullPostcodeNI.mockReturnValue(true)
      isValidPartialPostcodeNI.mockReturnValue(false)

      const result = handleSearchTerms('BT1 1AA')

      expect(result).toEqual({
        locationType: LOCATION_TYPE_NI,
        userLocation: 'BT1 1AA',
        locationNameOrPostcode: 'BT1 1AA'
      })
    })

    it('should handle valid NI partial postcode', () => {
      // Reset all mocks first
      isValidFullPostcodeUK.mockReturnValue(false)
      isValidPartialPostcodeUK.mockReturnValue(false)
      isValidFullPostcodeNI.mockReturnValue(false)
      isValidPartialPostcodeNI.mockReturnValue(true)

      const result = handleSearchTerms('BT1')

      expect(result).toEqual({
        locationType: LOCATION_TYPE_NI,
        userLocation: 'BT1',
        locationNameOrPostcode: 'BT1'
      })
    })
  })
})

describe('handle-error-helpers - referer search-location', () => {
  let mockRequest, mockH, mockPayload

  beforeEach(() => {
    mockRequest = createMockRequest()
    mockH = createMockH()
    mockPayload = createMockPayload()
    setupMocks()
    vi.clearAllMocks()
  })

  describe('handleNoSearchTerms - search-location referer', () => {
    it('should set session values when referer path is search-location', () => {
      mockRequest.headers = {
        referer: 'http://localhost:3000/search-location?lang=en'
      }
      mockRequest.payload = { locationType: LOCATION_TYPE_UK }
      getLocationNameOrPostcode.mockReturnValue('London')
      formatPostcode.mockReturnValue('LONDON')

      const result = handleNoSearchTerms(mockRequest, mockH, 'en', mockPayload)

      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'locationType',
        LOCATION_TYPE_UK
      )
      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'locationNameOrPostcode',
        'London'
      )
      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'airQuality',
        GOOD_AIR_QUALITY
      )
      expect(result).toEqual({
        locationType: LOCATION_TYPE_UK,
        userLocation: 'LONDON',
        locationNameOrPostcode: 'London'
      })
    })
  })
})

describe('handle-error-helpers - referer chwilio-lleoliad', () => {
  let mockRequest, mockH, mockPayload

  beforeEach(() => {
    mockRequest = createMockRequest()
    mockH = createMockH()
    mockPayload = createMockPayload()
    setupMocks()
    vi.clearAllMocks()
  })

  describe('handleNoSearchTerms - chwilio-lleoliad referer', () => {
    it('should set session values when referer path is chwilio-lleoliad', () => {
      mockRequest.headers = {
        referer: 'http://localhost:3000/chwilio-lleoliad?lang=cy'
      }
      mockRequest.payload = { locationType: LOCATION_TYPE_UK }
      getLocationNameOrPostcode.mockReturnValue('Cardiff')
      formatPostcode.mockReturnValue('CARDIFF')

      const result = handleNoSearchTerms(mockRequest, mockH, 'cy', mockPayload)

      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'locationType',
        LOCATION_TYPE_UK
      )
      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'locationNameOrPostcode',
        'Cardiff'
      )
      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'airQuality',
        GOOD_AIR_QUALITY
      )
      expect(result).toEqual({
        locationType: LOCATION_TYPE_UK,
        userLocation: 'CARDIFF',
        locationNameOrPostcode: 'Cardiff'
      })
    })
  })
})

describe('handle-error-helpers - other referer paths', () => {
  let mockRequest, mockH, mockPayload

  beforeEach(() => {
    mockRequest = createMockRequest()
    mockH = createMockH()
    mockPayload = createMockPayload()
    setupMocks()
    vi.clearAllMocks()
  })

  describe('handleNoSearchTerms - other referer', () => {
    it('should retrieve from session when referer path is not search-location or chwilio-lleoliad', () => {
      mockRequest.headers = {
        referer: 'http://localhost:3000/some-other-page'
      }
      mockRequest.payload = {}
      getLocationNameOrPostcode.mockReturnValue(null)
      mockRequest.yar.get
        .mockReturnValueOnce(null) // First call in getLocationTypeAndName for locationNameOrPostcode
        .mockReturnValueOnce(LOCATION_TYPE_UK) // Second call in handleNoSearchTerms for locationType
        .mockReturnValueOnce('Manchester') // Third call in handleNoSearchTerms for locationNameOrPostcode
      formatPostcode.mockReturnValue('MANCHESTER')

      const result = handleNoSearchTerms(mockRequest, mockH, 'en', mockPayload)

      expect(mockRequest.yar.get).toHaveBeenCalledWith('locationNameOrPostcode')
      expect(mockRequest.yar.get).toHaveBeenCalledWith('locationType')
      expect(mockRequest.yar.get).toHaveBeenCalledWith('locationNameOrPostcode')
      expect(result).toEqual({
        locationType: LOCATION_TYPE_UK,
        userLocation: 'MANCHESTER',
        locationNameOrPostcode: 'Manchester'
      })
    })
  })
})
