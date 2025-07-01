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
  isValidFullPostcodeUK
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

describe('handle-error-helpers', () => {
  let mockRequest, mockH, mockPayload

  const setupMocks = () => {
    isValidFullPostcodeUK.mockReturnValue(false)
    convertStringToHyphenatedLowercaseWords.mockReturnValue(false)
    getLocationNameOrPostcode.mockReturnValue(null)
    formatPostcode.mockReturnValue(null)
    getAirQuality.mockReturnValue('Good Air Quality')
  }

  beforeEach(() => {
    // Mock request and response objects
    mockRequest = {
      payload: {},
      yar: {
        get: vi.fn(),
        set: vi.fn()
      }
    }

    mockH = {
      redirect: vi.fn(() => ({ code: vi.fn(() => ({ takeover: vi.fn() })) })),
      view: vi.fn().mockReturnValue('view rendered')
    }

    // Mock payload
    mockPayload = {
      locationType: LOCATION_TYPE_UK,
      engScoWal: 'London',
      ni: '',
      aq: 'good'
    }

    setupMocks()
    vi.clearAllMocks()
  })

  describe('handleNoSearchTerms', () => {
    it('should call handleMissingLocation when locationType or locationNameOrPostcode is missing', () => {
      // Arrange
      mockRequest.payload = {}
      mockRequest.yar.get.mockReturnValueOnce(null).mockReturnValueOnce(null)

      // Act
      handleNoSearchTerms(mockRequest, mockH, 'en', mockPayload)

      // Assert
      expect(handleMissingLocation).toHaveBeenCalledWith(
        mockRequest,
        mockH,
        'en'
      )
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

    it('should return location details when userLocation is valid', () => {
      // Arrange
      mockRequest.payload = { locationType: LOCATION_TYPE_UK }
      mockRequest.yar.get
        .mockReturnValueOnce(LOCATION_TYPE_UK)
        .mockReturnValueOnce('London')
      getLocationNameOrPostcode.mockReturnValue('London')
      formatPostcode.mockReturnValue('LONDON')
      getAirQuality.mockReturnValue('Good Air Quality')

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
        'Good Air Quality'
      )
      expect(result).toEqual({
        locationType: LOCATION_TYPE_UK,
        userLocation: 'LONDON',
        locationNameOrPostcode: 'London'
      })
    })
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
  })
})
