import { handleErrorInputAndRedirect } from './error-input-and-redirect'
import {
  handleNoSearchTerms,
  handleSearchTerms
} from '~/src/server/locations/helpers/handle-error-helpers'

// Mock dependencies
jest.mock('~/src/server/locations/helpers/handle-error-helpers.js', () => ({
  handleNoSearchTerms: jest.fn(),
  handleSearchTerms: jest.fn()
}))

jest.mock('~/src/server/common/helpers/logging/logger', () => ({
  createLogger: jest.fn(() => ({
    error: jest.fn()
  }))
}))

describe('handleErrorInputAndRedirect', () => {
  let mockRequest, mockH, mockPayload // Declare mockRequest and other variables

  beforeEach(() => {
    // Initialize mockRequest and other variables
    mockRequest = {
      path: '/test-path',
      yar: {
        get: jest.fn(),
        set: jest.fn()
      }
    }

    mockH = {
      view: jest.fn(),
      redirect: jest.fn(() => ({ takeover: jest.fn() }))
    }

    mockPayload = {
      locationType: 'uk-location',
      engScoWal: 'London',
      ni: '',
      aq: 'good'
    }

    // Reset all mocks
    jest.clearAllMocks()
  })

  it('should call handleNoSearchTerms when searchTerms is not provided', () => {
    // Arrange
    const lang = 'en'
    handleNoSearchTerms.mockReturnValue({
      locationType: 'uk-location',
      userLocation: 'London'
    })

    // Act
    const result = handleErrorInputAndRedirect(
      mockRequest,
      mockH,
      lang,
      mockPayload,
      null
    )

    // Assert
    expect(handleNoSearchTerms).toHaveBeenCalledWith(
      mockRequest,
      mockH,
      lang,
      mockPayload
    )
    expect(handleSearchTerms).not.toHaveBeenCalled()
    expect(result).toEqual({
      locationType: 'uk-location',
      userLocation: 'London'
    })
  })

  it('should call handleSearchTerms when searchTerms is provided', () => {
    // Arrange
    const lang = 'en'
    const searchTerms = 'London'
    handleSearchTerms.mockReturnValue({
      locationType: 'uk-location',
      userLocation: 'London'
    })

    // Act
    const result = handleErrorInputAndRedirect(
      mockRequest,
      mockH,
      lang,
      mockPayload,
      searchTerms
    )

    // Assert
    expect(handleSearchTerms).toHaveBeenCalledWith(searchTerms)
    expect(handleNoSearchTerms).not.toHaveBeenCalled()
    expect(result).toEqual({
      locationType: 'uk-location',
      userLocation: 'London'
    })
  })
})
