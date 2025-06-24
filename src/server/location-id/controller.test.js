import { getLocationDetailsController } from './controller.js'
import redirectToWelshLocation from './helpers/redirectToWelshLocation.js'
import handleSearchTermsRedirection from './helpers/handleSearchTermsRedirection.js'
import determineLocationType from './helpers/determineLocationType.js'
import renderLocationDetailsView from './helpers/renderLocationDetailsView.js'
import renderLocationNotFoundView from './helpers/renderLocationNotFoundView.js'
import determineNearestLocation from './helpers/determineNearestLocation.js'
import matchLocationId from './helpers/matchLocationId.js'

jest.mock('./helpers/redirectToWelshLocation.js')
jest.mock('./helpers/handleSearchTermsRedirection.js')
jest.mock('./helpers/determineLocationType.js')
jest.mock('./helpers/renderLocationDetailsView.js')
jest.mock('./helpers/renderLocationNotFoundView.js')
jest.mock('./helpers/determineNearestLocation.js')
jest.mock('./helpers/matchLocationId.js')

const mockRequest = {
  query: {},
  params: { id: 'test-location-id' },
  yar: { get: jest.fn(), clear: jest.fn() },
  url: { href: 'http://example.com/current' },
  headers: { referer: 'http://example.com/previous' }
}
const mockResponseToolkit = {
  response: jest.fn(() => {
    const responseObject = {
      code: jest.fn(() => responseObject),
      takeover: jest.fn(() => responseObject)
    }
    return responseObject
  }),
  view: jest.fn().mockReturnValue('view rendered'),
  redirect: jest.fn(() => {
    const redirectObject = {
      takeover: jest.fn(() => redirectObject)
    }
    return redirectObject
  })
}

describe('getLocationDetailsController', () => {
  it('should handle Welsh language redirection', async () => {
    const mockRedirectResponse = { takeover: jest.fn() }
    mockResponseToolkit.redirect = jest
      .fn()
      .mockReturnValue(mockRedirectResponse)
    redirectToWelshLocation.mockImplementation(() =>
      mockResponseToolkit.redirect('/welsh-location')
    )

    const result = await getLocationDetailsController.handler(
      mockRequest,
      mockResponseToolkit
    )

    expect(mockResponseToolkit.redirect).toHaveBeenCalledWith('/welsh-location')
    expect(result).toEqual(mockRedirectResponse)
    expect(redirectToWelshLocation).toHaveBeenCalledWith(
      mockRequest.query,
      mockRequest.params.id,
      mockResponseToolkit
    )
  })

  it('should handle search terms redirection', async () => {
    const mockSearchTermsRedirectResponse = { takeover: jest.fn() }
    mockResponseToolkit.redirect = jest
      .fn()
      .mockReturnValue(mockSearchTermsRedirectResponse)
    redirectToWelshLocation.mockReturnValue(null) // Ensure Welsh redirection does not interfere
    handleSearchTermsRedirection.mockImplementation(() =>
      mockResponseToolkit.redirect('/search-terms-redirect')
    )

    const result = await getLocationDetailsController.handler(
      mockRequest,
      mockResponseToolkit
    )

    expect(mockResponseToolkit.redirect).toHaveBeenCalledWith(
      '/search-terms-redirect'
    )
    expect(result).toEqual(mockSearchTermsRedirectResponse)
    expect(handleSearchTermsRedirection).toHaveBeenCalledWith(
      mockRequest.headers.referer,
      mockRequest.url.href,
      mockRequest.yar.get('searchTermsSaved'),
      mockRequest,
      mockResponseToolkit
    )
  })

  it('should handle rendering location details view', async () => {
    const mockRenderLocationDetailsResponse = { takeover: jest.fn() }
    mockResponseToolkit.view.mockReturnValue('view rendered')
    redirectToWelshLocation.mockReturnValue(null) // Ensure Welsh redirection does not interfere
    handleSearchTermsRedirection.mockReturnValue(null) // Ensure search terms redirection does not interfere

    matchLocationId.mockReturnValue({
      locationDetails: { id: 'test-location-id', name: 'Test Location' }
    })
    determineLocationType.mockReturnValue('test-location-type')
    determineNearestLocation.mockReturnValue({
      forecastNum: 1,
      nearestLocationsRange: []
    })

    renderLocationDetailsView.mockImplementation(
      () => mockRenderLocationDetailsResponse
    )

    mockRequest.yar.get.mockReturnValue({
      locationType: 'test-location-type',
      getForecasts: jest.fn(),
      getMeasurements: jest.fn()
    })

    const result = await getLocationDetailsController.handler(
      mockRequest,
      mockResponseToolkit
    )

    expect(renderLocationDetailsView).toHaveBeenCalledWith(
      { id: 'test-location-id', name: 'Test Location' },
      expect.objectContaining({
        english: expect.any(Object),
        multipleLocations: expect.any(Object),
        daqi: expect.any(Object),
        calendarWelsh: expect.any(Object),
        getMonth: expect.any(Number),
        forecastNum: expect.any(Number),
        nearestLocationsRange: expect.any(Array),
        locationData: expect.any(Object),
        lang: expect.any(String),
        metaSiteUrl: expect.any(String)
      }),
      mockResponseToolkit
    )
    expect(result).toEqual(mockRenderLocationDetailsResponse)
  })

  it('should handle rendering location not found view', async () => {
    const mockRenderLocationNotFoundResponse = { takeover: jest.fn() }
    mockResponseToolkit.view.mockReturnValue('view rendered')
    redirectToWelshLocation.mockReturnValue(null) // Ensure Welsh redirection does not interfere
    handleSearchTermsRedirection.mockReturnValue(null) // Ensure search terms redirection does not interfere
    matchLocationId.mockReturnValue({ locationDetails: null })

    renderLocationNotFoundView.mockImplementation(
      () => mockRenderLocationNotFoundResponse
    )

    const result = await getLocationDetailsController.handler(
      mockRequest,
      mockResponseToolkit
    )

    expect(renderLocationNotFoundView).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.any(String),
      mockResponseToolkit
    )
    expect(result).toEqual(mockRenderLocationNotFoundResponse)
  })
})
