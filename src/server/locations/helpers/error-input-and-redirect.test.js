// '' Mock dependencies before importing the module under test
var mockLogger = {
  error: vi.fn()
}

vi.mock('./handle-error-helpers.js', () => ({
  handleNoSearchTerms: vi.fn(),
  handleSearchTerms: vi.fn()
}))

import { handleErrorInputAndRedirect } from './error-input-and-redirect.js'
import { handleNoSearchTerms, handleSearchTerms } from './handle-error-helpers'

describe('handleErrorInputAndRedirect', () => {
  let mockRequest, mockH, mockPayload

  beforeEach(() => {
    // '' Reset all mocks before each test
    vi.clearAllMocks()
    handleNoSearchTerms.mockReset()
    handleSearchTerms.mockReset()
    mockLogger.error.mockReset()

    mockRequest = {
      path: '/test-path',
      yar: {
        get: vi.fn(),
        set: vi.fn()
      },
      headers: {}
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
  })

  it('should call handleNoSearchTerms when searchTerms is not provided', () => {
    // ''
    const lang = 'en'
    handleNoSearchTerms.mockReturnValue({
      locationType: 'uk-location',
      userLocation: 'London'
    })

    const result = handleErrorInputAndRedirect(
      mockRequest,
      mockH,
      lang,
      mockPayload,
      null,
      mockLogger // '' Pass mockLogger for testability
    )

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
    // ''
    const lang = 'en'
    const searchTerms = 'London'
    handleSearchTerms.mockReturnValue({
      locationType: 'uk-location',
      userLocation: 'London'
    })

    const result = handleErrorInputAndRedirect(
      mockRequest,
      mockH,
      lang,
      mockPayload,
      searchTerms,
      mockLogger // '' Pass mockLogger for testability
    )

    expect(handleSearchTerms).toHaveBeenCalledWith(searchTerms)
    expect(handleNoSearchTerms).not.toHaveBeenCalled()
    expect(result).toEqual({
      locationType: 'uk-location',
      userLocation: 'London'
    })
  })

  it("'' returns error view and logs when handleNoSearchTerms throws", () => {
    // ''
    const lang = 'en'
    handleNoSearchTerms.mockImplementation(() => {
      throw new Error('fail no search')
    })

    const result = handleErrorInputAndRedirect(
      mockRequest,
      mockH,
      lang,
      mockPayload,
      null,
      mockLogger // '' Pass mockLogger for testability
    )

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error in handleErrorInputAndRedirect: fail no search')
    )
    expect(mockH.view).toHaveBeenCalledWith(
      'error/index',
      expect.objectContaining({
        pageTitle: expect.any(String),
        statusCode: expect.any(Number),
        lang
      })
    )
    expect(result).toBe('view rendered')
  })

  it("'' returns error view and logs when handleSearchTerms throws", () => {
    // ''
    const lang = 'en'
    handleSearchTerms.mockImplementation(() => {
      throw new Error('fail search')
    })

    const result = handleErrorInputAndRedirect(
      mockRequest,
      mockH,
      lang,
      mockPayload,
      'London',
      mockLogger // '' Pass mockLogger for testability
    )

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error in handleErrorInputAndRedirect: fail search')
    )
    expect(mockH.view).toHaveBeenCalledWith(
      'error/index',
      expect.objectContaining({
        pageTitle: expect.any(String),
        statusCode: expect.any(Number),
        lang
      })
    )
    expect(result).toBe('view rendered')
  })

  it("'' returns unauthorized status when error message contains access_token", () => {
    // ''
    const lang = 'en'
    handleNoSearchTerms.mockImplementation(() => {
      throw new Error('missing access_token')
    })

    const result = handleErrorInputAndRedirect(
      mockRequest,
      mockH,
      lang,
      mockPayload,
      null,
      mockLogger // '' Pass mockLogger for testability
    )

    const viewArgs = mockH.view.mock.calls[0][1]
    expect(viewArgs.statusCode).toBe(401) // STATUS_UNAUTHORIZED
    expect(result).toBe('view rendered')
  })

  it("'' handles missing searchTerms and missing payload gracefully", () => {
    // ''
    handleNoSearchTerms.mockReturnValue({ result: 'ok' })
    const result = handleErrorInputAndRedirect(
      mockRequest,
      mockH,
      'en',
      undefined,
      undefined,
      mockLogger // '' Pass mockLogger for testability
    )
    expect(handleNoSearchTerms).toHaveBeenCalledWith(
      mockRequest,
      mockH,
      'en',
      undefined
    )
    expect(result).toEqual({ result: 'ok' })
  })

  it("'' handles missing lang parameter", () => {
    // ''
    handleNoSearchTerms.mockReturnValue({ result: 'ok' })
    const result = handleErrorInputAndRedirect(
      mockRequest,
      mockH,
      undefined,
      mockPayload,
      null,
      mockLogger // '' Pass mockLogger for testability
    )
    expect(result).toEqual({ result: 'ok' })
  })

  it("'' handles error with no message property", () => {
    // ''
    handleNoSearchTerms.mockImplementation(() => {
      // '' Throw an error without a message property
      throw { }
    })
    const result = handleErrorInputAndRedirect(
      mockRequest,
      mockH,
      'en',
      mockPayload,
      null,
      mockLogger // '' Pass mockLogger for testability
    )
    expect(mockLogger.error).toHaveBeenCalled()
    expect(mockH.view).toHaveBeenCalledWith(
      'error/index',
      expect.objectContaining({
        statusCode: 500 // STATUS_INTERNAL_SERVER_ERROR
      })
    )
    expect(result).toBe('view rendered')
  })

  it("'' sets all error view context fields", () => {
    // ''
    handleNoSearchTerms.mockImplementation(() => {
      throw new Error('fail')
    })
    const result = handleErrorInputAndRedirect(
      mockRequest,
      mockH,
      'en',
      mockPayload,
      null,
      mockLogger // '' Pass mockLogger for testability
    )
    const context = mockH.view.mock.calls[0][1]
    expect(context.pageTitle).toBeDefined()
    expect(context.footerTxt).toBeDefined()
    expect(context.url).toBe('/test-path')
    expect(context.phaseBanner).toBeDefined()
    expect(context.cookieBanner).toBeDefined()
    expect(context.serviceName).toBeDefined()
    expect(context.notFoundUrl).toBeDefined()
    expect(context.lang).toBe('en')
    expect(result).toBe('view rendered')
  })
})