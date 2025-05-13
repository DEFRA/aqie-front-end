import { handleNoSearchTerms, handleSearchTerms } from './handle-error-helpers'
import {
  handleMissingLocation,
  handleUKError,
  handleNIError,
  formatPostcode
} from './error-input-and-redirect-helpers.js'
import { getAirQuality } from '~/src/server/data/en/air-quality.js'
import { getLocationNameOrPostcode } from '~/src/server/locations/helpers/location-type-util'
import {
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK,
  isOnlyWords,
  isValidFullPostcodeNI,
  isValidPartialPostcodeNI
} from '~/src/server/locations/helpers/convert-string'
import { LOCATION_TYPE_UK, LOCATION_TYPE_NI } from '~/src/server/data/constants'

// Mock dependencies
jest.mock('./error-input-and-redirect-helpers.js', () => ({
  handleMissingLocation: jest.fn(),
  handleUKError: jest.fn(),
  handleNIError: jest.fn(),
  formatPostcode: jest.fn()
}))

jest.mock('~/src/server/data/en/air-quality.js', () => ({
  getAirQuality: jest.fn()
}))

jest.mock('~/src/server/locations/helpers/location-type-util', () => ({
  getLocationNameOrPostcode: jest.fn()
}))

jest.mock('~/src/server/locations/helpers/convert-string', () => ({
  isValidFullPostcodeUK: jest.fn(),
  isValidPartialPostcodeUK: jest.fn(),
  isOnlyWords: jest.fn(),
  isValidFullPostcodeNI: jest.fn(),
  isValidPartialPostcodeNI: jest.fn()
}))

describe('handle-error-helpers', () => {
  let mockRequest, mockH, mockPayload

  beforeEach(() => {
    // Mock request and response objects
    mockRequest = {
      payload: {},
      yar: {
        get: jest.fn(),
        set: jest.fn()
      }
    }

    mockH = {
      redirect: jest.fn(() => ({ takeover: jest.fn() }))
    }

    // Mock payload
    mockPayload = {
      locationType: LOCATION_TYPE_UK,
      engScoWal: 'London',
      ni: '',
      aq: 'good'
    }

    // Default mock return values
    isValidFullPostcodeUK.mockReturnValue(false)
    isValidPartialPostcodeUK.mockReturnValue(false)
    isOnlyWords.mockReturnValue(false)
    isValidFullPostcodeNI.mockReturnValue(false)
    isValidPartialPostcodeNI.mockReturnValue(false)
    getLocationNameOrPostcode.mockReturnValue(null)
    formatPostcode.mockReturnValue(null)
    getAirQuality.mockReturnValue('Good Air Quality')

    jest.clearAllMocks()
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
    it('should return UK location details for valid UK search terms', () => {
      // Arrange
      isOnlyWords.mockReturnValue(true)

      // Act
      const result = handleSearchTerms('London')

      // Assert
      expect(result).toEqual({
        locationType: 'uk-location',
        userLocation: 'London',
        locationNameOrPostcode: 'London'
      })
    })

    it('should return NI location details for valid NI search terms', () => {
      // Arrange
      isValidFullPostcodeNI.mockReturnValue(true)

      // Act
      const result = handleSearchTerms('BT1 1AA')

      // Assert
      expect(result).toEqual({
        locationType: 'ni-location',
        userLocation: 'BT1 1AA',
        locationNameOrPostcode: 'BT1 1AA'
      })
    })

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
