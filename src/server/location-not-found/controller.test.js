import { locationNotFoundController } from '~/src/server/location-not-found/controller.js'
import { english } from '~/src/server/data/en/en.js'
import { LOCATION_NOT_FOUND } from '~/src/server/data/constants.js'

describe('locationNotFoundController - english', () => {
  let mockRequest
  let mockH
  const mockContent = english

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '',
      yar: {
        get: jest.fn().mockReturnValue({
          locationNameOrPostcode: '',
          lang: 'en'
        })
      }
    }
    mockH = {
      redirect: jest.fn().mockReturnValue('redirected'),
      view: jest.fn().mockReturnValue('view rendered')
    }
  })

  test('should render the location not found view with empty location data', () => {
    // const mrequest = {
    //   yar: {
    //     get: jest.fn().mockReturnValue({
    //       locationNameOrPostcode: 'Test Location',
    //       lang: 'en'
    //     })
    //   }
    // }
    // const locationData = { locationNameOrPostcode: '', lang: 'en' }
    const result = locationNotFoundController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith(LOCATION_NOT_FOUND, {
      userLocation: '',
      serviceName: mockContent.notFoundLocation.heading,
      paragraph: mockContent.notFoundLocation.paragraphs,
      pageTitle: `${mockContent.notFoundLocation.paragraphs.a}  - ${mockContent.home.pageTitle}`,
      footerTxt: mockContent.footerTxt,
      phaseBanner: mockContent.phaseBanner,
      backlink: mockContent.backlink,
      cookieBanner: mockContent.cookieBanner,
      lang: 'en'
    })
  })

  test.skip('should render the location not found page when invalid empty location data', () => {
    // const mrequest = {
    //   yar: {
    //     get: jest.fn().mockReturnValue({
    //       locationNameOrPostcode: 'dkjfhe',
    //       lang: 'en'
    //     })
    //   }
    // }
    const locationData = { locationNameOrPostcode: 'dkjfhe', lang: 'en' }
    const result = locationNotFoundController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith(LOCATION_NOT_FOUND, {
      userLocation: locationData.locationNameOrPostcode,
      serviceName: mockContent.notFoundLocation.heading,
      paragraph: mockContent.notFoundLocation.paragraphs,
      pageTitle: `${mockContent.notFoundLocation.paragraphs.a} ${locationData.locationNameOrPostcode} - ${mockContent.home.pageTitle}`,
      footerTxt: mockContent.footerTxt,
      phaseBanner: mockContent.phaseBanner,
      backlink: mockContent.backlink,
      cookieBanner: mockContent.cookieBanner,
      lang: 'en'
    })
  })
})
