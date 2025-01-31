import { locationNotFoundController } from '~/src/server/location-not-found/cy/controller'
import { welsh } from '~/src/server/data/cy/cy.js'
import { LOCATION_NOT_FOUND } from '~/src/server/data/constants'

describe('locationNotFoundController - welsh', () => {
  let mockRequest
  let mockH
  const mockContent = welsh

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '/lleoliad-heb-ei-ganfod/cy',
      yar: {
        get: jest.fn().mockReturnValue({
          locationNameOrPostcode: '',
          lang: 'cy'
        })
      }
    }
    mockH = {
      redirect: jest.fn().mockReturnValue('redirected'),
      view: jest.fn().mockReturnValue('view rendered')
    }
  })

  test('should render the location not found view with empty location data', () => {
    mockRequest.query.lang = 'cy'
    const result = locationNotFoundController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith(LOCATION_NOT_FOUND, {
      userLocation: '',
      serviceName: mockContent.notFoundLocation.heading,
      paragraph: mockContent.notFoundLocation.paragraphs,
      pageTitle: `${mockContent.notFoundLocation.paragraphs.a}  - ${mockContent.home.pageTitle}`,
      description: mockContent.multipleLocations.description,
      footerTxt: mockContent.footerTxt,
      phaseBanner: mockContent.phaseBanner,
      backlink: mockContent.backlink,
      cookieBanner: mockContent.cookieBanner,
      lang: 'cy'
    })
  })
})
