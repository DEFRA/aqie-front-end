import { describe, it, expect, vi, beforeEach } from 'vitest'
import handleSearchTermsRedirection from './handleSearchTermsRedirection.js'
import { compareLastElements } from '../../locations/helpers/convert-string.js'
import { getSearchTermsFromUrl } from '../../locations/helpers/get-search-terms-from-url.js'

// '' Mock the dependencies
vi.mock('../../locations/helpers/convert-string.js', () => ({
  compareLastElements: vi.fn()
}))

vi.mock('../../locations/helpers/get-search-terms-from-url.js', () => ({
  getSearchTermsFromUrl: vi.fn()
}))

describe('handleSearchTermsRedirection', () => {
  const mockCompareLastElements = vi.mocked(compareLastElements)
  const mockGetSearchTermsFromUrl = vi.mocked(getSearchTermsFromUrl)

  let mockRequest, mockH, mockRedirect, mockTakeover

  beforeEach(() => {
    mockTakeover = vi.fn().mockReturnValue('takeover-result')
    mockRedirect = vi.fn().mockReturnValue({ takeover: mockTakeover })
    mockH = { redirect: mockRedirect }
    mockRequest = {
      yar: {
        clear: vi.fn()
      }
    }

    mockCompareLastElements.mockClear()
    mockGetSearchTermsFromUrl.mockClear()
    mockRedirect.mockClear()
    mockTakeover.mockClear()
    mockRequest.yar.clear.mockClear()
  })

  it('should redirect when previousUrl is undefined and searchTermsSaved is false', () => {
    const previousUrl = undefined
    const currentUrl = '/location/12345'
    const searchTermsSaved = false

    mockGetSearchTermsFromUrl.mockReturnValue({
      searchTerms: 'cardiff',
      secondSearchTerm: 'wales',
      searchTermsLocationType: 'UK'
    })

    const result = handleSearchTermsRedirection(
      previousUrl,
      currentUrl,
      searchTermsSaved,
      mockRequest,
      mockH
    )

    expect(mockRequest.yar.clear).toHaveBeenCalledWith('locationData')
    expect(mockGetSearchTermsFromUrl).toHaveBeenCalledWith(currentUrl)
    expect(mockRedirect).toHaveBeenCalledWith(
      '/location?lang=en&searchTerms=cardiff&secondSearchTerm=wales&searchTermsLocationType=UK'
    )
    expect(mockTakeover).toHaveBeenCalled()
    expect(result).toBe('takeover-result')
  })

  it('should redirect when URLs are equal and searchTermsSaved is false', () => {
    const previousUrl = '/location/12345'
    const currentUrl = '/location/12345'
    const searchTermsSaved = false

    mockCompareLastElements.mockReturnValue(true)
    mockGetSearchTermsFromUrl.mockReturnValue({
      searchTerms: 'london',
      secondSearchTerm: 'england',
      searchTermsLocationType: 'UK'
    })

    const result = handleSearchTermsRedirection(
      previousUrl,
      currentUrl,
      searchTermsSaved,
      mockRequest,
      mockH
    )

    expect(mockCompareLastElements).toHaveBeenCalledWith(
      previousUrl,
      currentUrl
    )
    expect(mockRequest.yar.clear).toHaveBeenCalledWith('locationData')
    expect(mockGetSearchTermsFromUrl).toHaveBeenCalledWith(currentUrl)
    expect(mockRedirect).toHaveBeenCalledWith(
      '/location?lang=en&searchTerms=london&secondSearchTerm=england&searchTermsLocationType=UK'
    )
    expect(result).toBe('takeover-result')
  })

  it('should return null when previousUrl exists and searchTermsSaved is true', () => {
    const previousUrl = '/location/54321'
    const currentUrl = '/location/12345'
    const searchTermsSaved = true

    mockCompareLastElements.mockReturnValue(false)

    const result = handleSearchTermsRedirection(
      previousUrl,
      currentUrl,
      searchTermsSaved,
      mockRequest,
      mockH
    )

    expect(mockCompareLastElements).toHaveBeenCalledWith(
      previousUrl,
      currentUrl
    )
    expect(mockRequest.yar.clear).not.toHaveBeenCalled()
    expect(mockGetSearchTermsFromUrl).not.toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('should return null when URLs are different and searchTermsSaved is false', () => {
    const previousUrl = '/location/54321'
    const currentUrl = '/location/12345'
    const searchTermsSaved = false

    mockCompareLastElements.mockReturnValue(false)

    const result = handleSearchTermsRedirection(
      previousUrl,
      currentUrl,
      searchTermsSaved,
      mockRequest,
      mockH
    )

    expect(mockCompareLastElements).toHaveBeenCalledWith(
      previousUrl,
      currentUrl
    )
    expect(mockRequest.yar.clear).not.toHaveBeenCalled()
    expect(mockGetSearchTermsFromUrl).not.toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('should handle special characters in search terms by encoding them', () => {
    const previousUrl = undefined
    const currentUrl = '/location/special'
    const searchTermsSaved = false

    mockGetSearchTermsFromUrl.mockReturnValue({
      searchTerms: 'new york',
      secondSearchTerm: 'united states',
      searchTermsLocationType: 'US'
    })

    const result = handleSearchTermsRedirection(
      previousUrl,
      currentUrl,
      searchTermsSaved,
      mockRequest,
      mockH
    )

    expect(mockRedirect).toHaveBeenCalledWith(
      '/location?lang=en&searchTerms=new%20york&secondSearchTerm=united%20states&searchTermsLocationType=US'
    )
    expect(result).toBe('takeover-result')
  })
})
