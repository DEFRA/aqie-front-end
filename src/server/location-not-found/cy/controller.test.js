import { locationNotFoundController } from './controller.js'
import { welsh } from '../../data/cy/cy.js'
import {
  LOCATION_NOT_FOUND,
  LOCATION_NOT_FOUND_ROUTE_EN
} from '../../data/constants.js'
import { vi } from 'vitest'

describe('locationNotFoundController - welsh', () => {
  let mockRequest
  let mockH
  const mockContent = welsh

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '/lleoliad-heb-ei-ganfod/cy',
      yar: {
        get: vi.fn().mockReturnValue({
          locationNameOrPostcode: '',
          lang: 'cy'
        })
      }
    }
    mockH = {
      redirect: vi.fn(() => ({
        code: vi.fn(() => ({
          takeover: vi.fn(() => 'redirected')
        }))
      })),
      view: vi.fn(() => 'view rendered')
    }
  })

  it('should render the location not found view with empty location data', () => {
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

  it('should redirect to the English version if the language is "en"', () => {
    mockRequest.query.lang = 'en'
    const result = locationNotFoundController.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith(LOCATION_NOT_FOUND_ROUTE_EN)
  })
})
