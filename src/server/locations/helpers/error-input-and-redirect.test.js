import { handleErrorInputAndRedirect } from './error-input-and-redirect.js'
import { handleNoSearchTerms, handleSearchTerms } from './handle-error-helpers'

// Mock dependencies
vi.mock('./handle-error-helpers.js', () => ({
  handleNoSearchTerms: vi.fn(),
  handleSearchTerms: vi.fn()
}))

vi.mock('../../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    error: vi.fn()
  }))
}))

describe('handleErrorInputAndRedirect', () => {
  let mockRequest, mockH, mockPayload // Declare mockRequest and other variables

  beforeEach(() => {
    // Initialize mockRequest and other variables
    mockRequest = {
      path: '/test-path',
      yar: {
        get: vi.fn(),
        set: vi.fn()
      },
      headers: {} // Initialize headers object
    }

    mockH = {
      redirect: vi.fn(() => ({ code: vi.fn() })),
      view: vi.fn().mockReturnValue('view rendered')
    }

    mockPayload = {
      locationType: 'uk-location',
      engScoWal: 'London',
      ni: '',
      aq: 'good'
    }

    // Reset all mocks
    vi.clearAllMocks()
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
