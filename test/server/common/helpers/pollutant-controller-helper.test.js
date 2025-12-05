import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPollutantHandler } from '../../../../src/server/common/helpers/pollutant-controller-helper.js'

describe('pollutant-controller-helper', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = {
      info: {
        host: 'localhost:3000'
      },
      headers: {
        'x-forwarded-proto': 'http'
      }
    }

    mockH = {
      view: vi.fn((template, context) => ({ template, context })),
      redirect: vi.fn((url) => ({
        code: vi.fn((statusCode) => ({ url, statusCode }))
      }))
    }
  })

  describe('nitrogen dioxide pollutant', () => {
    it('should render nitrogen dioxide view with all required data', () => {
      mockRequest.query = {
        locationId: 'LOC123',
        locationName: 'Cardiff',
        searchTerms: 'Cardiff',
        lang: 'en'
      }

      createPollutantHandler('nitrogenDioxide', mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'nitrogen-dioxide/index',
        expect.objectContaining({
          pageTitle: expect.any(String),
          description: expect.any(String),
          page: 'nitrogen dioxide',
          currentPath: '/pollutants/nitrogen-dioxide',
          locationId: 'LOC123',
          locationName: 'Cardiff',
          searchTerms: 'Cardiff',
          lang: 'en'
        })
      )
    })

    it('should redirect to Welsh version when lang is cy', () => {
      mockRequest.query = {
        locationId: 'LOC123',
        locationName: 'Cardiff',
        searchTerms: 'Cardiff',
        lang: 'cy'
      }

      createPollutantHandler('nitrogenDioxide', mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/llygryddion/nitrogen-deuocsid/cy?')
      )
    })

    it('should redirect to search when no locationId', () => {
      mockRequest.query = {}

      createPollutantHandler('nitrogenDioxide', mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith('/search-location?lang=en')
    })

    it('should set searchTerms to null when undefined', () => {
      mockRequest.query = {
        locationId: 'LOC123',
        locationName: 'Cardiff'
      }

      createPollutantHandler('nitrogenDioxide', mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'nitrogen-dioxide/index',
        expect.objectContaining({
          searchTerms: null
        })
      )
    })
  })

  describe('ozone pollutant', () => {
    it('should render ozone view with correct paths', () => {
      mockRequest.query = {
        locationId: 'LOC456',
        locationName: 'London'
      }

      createPollutantHandler('ozone', mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'ozone/index',
        expect.objectContaining({
          page: 'ozone',
          currentPath: '/pollutants/ozone'
        })
      )
    })

    it('should redirect to Welsh ozone page', () => {
      mockRequest.query = {
        locationId: 'LOC456',
        lang: 'cy'
      }

      createPollutantHandler('ozone', mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/llygryddion/oson/cy?')
      )
    })
  })

  describe('particulate matter 10 pollutant', () => {
    it('should render PM10 view with correct data', () => {
      mockRequest.query = {
        locationId: 'LOC789',
        locationName: 'Manchester'
      }

      createPollutantHandler('particulateMatter10', mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'particulate-matter-10/index',
        expect.objectContaining({
          page: 'particulate matter 10',
          currentPath: '/pollutants/particulate-matter-10'
        })
      )
    })

    it('should redirect to Welsh PM10 page', () => {
      mockRequest.query = {
        locationId: 'LOC789',
        lang: 'cy'
      }

      createPollutantHandler('particulateMatter10', mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/llygryddion/mater-gronynnol-10/cy?')
      )
    })
  })

  describe('particulate matter 25 pollutant', () => {
    it('should render PM25 view with correct data', () => {
      mockRequest.query = {
        locationId: 'LOC101',
        locationName: 'Birmingham'
      }

      createPollutantHandler('particulateMatter25', mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'particulate-matter-25/index',
        expect.objectContaining({
          page: 'particulate matter 25',
          currentPath: '/pollutants/particulate-matter-25'
        })
      )
    })

    it('should redirect to Welsh PM25 page', () => {
      mockRequest.query = {
        locationId: 'LOC101',
        lang: 'cy'
      }

      createPollutantHandler('particulateMatter25', mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/llygryddion/mater-gronynnol-25/cy?')
      )
    })
  })

  describe('sulphur dioxide pollutant', () => {
    it('should render sulphur dioxide view with correct data', () => {
      mockRequest.query = {
        locationId: 'LOC202',
        locationName: 'Leeds'
      }

      createPollutantHandler('sulphurDioxide', mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'sulphur-dioxide/index',
        expect.objectContaining({
          page: 'sulphur dioxide',
          currentPath: '/pollutants/sulphur-dioxide'
        })
      )
    })

    it('should redirect to Welsh sulphur dioxide page', () => {
      mockRequest.query = {
        locationId: 'LOC202',
        lang: 'cy'
      }

      createPollutantHandler('sulphurDioxide', mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/llygryddion/sylffwr-deuocsid/cy?')
      )
    })
  })

  describe('Welsh redirects with all query params', () => {
    it('should preserve locationId, locationName, and searchTerms in Welsh redirect', () => {
      mockRequest.query = {
        locationId: 'LOC303',
        locationName: 'Swansea',
        searchTerms: 'Swansea Wales',
        lang: 'cy'
      }

      createPollutantHandler('nitrogenDioxide', mockRequest, mockH)

      const redirectCall = mockH.redirect.mock.calls[0][0]
      expect(redirectCall).toContain('lang=cy')
      expect(redirectCall).toContain('locationId=LOC303')
      expect(redirectCall).toContain('locationName=Swansea')
      expect(redirectCall).toContain('searchTerms=Swansea')
    })

    it('should handle Welsh redirect with only locationId', () => {
      mockRequest.query = {
        locationId: 'LOC404',
        lang: 'cy'
      }

      createPollutantHandler('ozone', mockRequest, mockH)

      const redirectCall = mockH.redirect.mock.calls[0][0]
      expect(redirectCall).toContain('lang=cy')
      expect(redirectCall).toContain('locationId=LOC404')
      expect(redirectCall).not.toContain('locationName')
      expect(redirectCall).not.toContain('searchTerms')
    })
  })

  describe('error handling', () => {
    it('should throw error for unknown pollutant type', () => {
      mockRequest.query = {
        locationId: 'LOC505'
      }

      expect(() => {
        createPollutantHandler('unknownPollutant', mockRequest, mockH)
      }).toThrow('Unknown pollutant type: unknownPollutant')
    })
  })

  describe('view context data', () => {
    it('should include all required context properties', () => {
      mockRequest.query = {
        locationId: 'LOC606',
        locationName: 'Bristol',
        searchTerms: 'Bristol',
        lang: 'en'
      }

      createPollutantHandler('nitrogenDioxide', mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]

      expect(viewContext).toHaveProperty('pageTitle')
      expect(viewContext).toHaveProperty('description')
      expect(viewContext).toHaveProperty('metaSiteUrl')
      expect(viewContext).toHaveProperty('nitrogenDioxide')
      expect(viewContext).toHaveProperty('page')
      expect(viewContext).toHaveProperty('displayBacklink')
      expect(viewContext).toHaveProperty('backLinkText')
      expect(viewContext).toHaveProperty('backLinkUrl')
      expect(viewContext).toHaveProperty('phaseBanner')
      expect(viewContext).toHaveProperty('footerTxt')
      expect(viewContext).toHaveProperty('cookieBanner')
      expect(viewContext).toHaveProperty('serviceName')
      expect(viewContext).toHaveProperty('currentPath')
      expect(viewContext).toHaveProperty('queryParams')
      expect(viewContext).toHaveProperty('locationId')
      expect(viewContext).toHaveProperty('locationName')
      expect(viewContext).toHaveProperty('searchTerms')
      expect(viewContext).toHaveProperty('lang')
    })

    it('should default lang to en when not specified', () => {
      mockRequest.query = {
        locationId: 'LOC707',
        locationName: 'Newcastle'
      }

      createPollutantHandler('ozone', mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext.lang).toBe('en')
    })
  })

  describe('redirect status codes', () => {
    it('should use correct redirect status code for Welsh redirect', () => {
      mockRequest.query = {
        locationId: 'LOC808',
        lang: 'cy'
      }

      createPollutantHandler('particulateMatter10', mockRequest, mockH)

      const redirectResult = mockH.redirect.mock.results[0].value
      expect(redirectResult.code).toHaveBeenCalledWith(301)
    })

    it('should use correct redirect status code for search location', () => {
      mockRequest.query = {}

      createPollutantHandler('sulphurDioxide', mockRequest, mockH)

      const redirectResult = mockH.redirect.mock.results[0].value
      expect(redirectResult.code).toHaveBeenCalledWith(301)
    })
  })

  describe('query parameter edge cases', () => {
    it('should handle Welsh redirect with locationName but no searchTerms', () => {
      mockRequest.query = {
        locationId: 'LOC909',
        locationName: 'Caerphilly',
        lang: 'cy'
      }

      createPollutantHandler('nitrogenDioxide', mockRequest, mockH)

      const redirectCall = mockH.redirect.mock.calls[0][0]
      expect(redirectCall).toContain('lang=cy')
      expect(redirectCall).toContain('locationId=LOC909')
      expect(redirectCall).toContain('locationName=Caerphilly')
      expect(redirectCall).not.toContain('searchTerms')
    })

    it('should handle Welsh redirect with searchTerms but no locationName', () => {
      mockRequest.query = {
        locationId: 'LOC1010',
        searchTerms: 'Wales',
        lang: 'cy'
      }

      createPollutantHandler('ozone', mockRequest, mockH)

      const redirectCall = mockH.redirect.mock.calls[0][0]
      expect(redirectCall).toContain('lang=cy')
      expect(redirectCall).toContain('locationId=LOC1010')
      expect(redirectCall).toContain('searchTerms=Wales')
      expect(redirectCall).not.toContain('locationName')
    })

    it('should handle request with null query object', () => {
      mockRequest.query = null

      createPollutantHandler('particulateMatter25', mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith('/search-location?lang=en')
    })

    it('should handle request with undefined query object', () => {
      mockRequest.query = undefined

      createPollutantHandler('sulphurDioxide', mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith('/search-location?lang=en')
    })

    it('should handle query with lang parameter other than cy or en', () => {
      mockRequest.query = {
        locationId: 'LOC1111',
        locationName: 'Oxford',
        lang: 'fr'
      }

      createPollutantHandler('nitrogenDioxide', mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext.lang).toBe('fr')
      expect(mockH.redirect).not.toHaveBeenCalled()
    })

    it('should include complete queryParams in view context', () => {
      mockRequest.query = {
        locationId: 'LOC1212',
        locationName: 'Plymouth',
        searchTerms: 'Devon',
        lang: 'en',
        extraParam: 'value'
      }

      createPollutantHandler('ozone', mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext.queryParams).toEqual(mockRequest.query)
    })
  })

  describe('pollutant data validation', () => {
    it('should include correct pollutant data key for nitrogen dioxide', () => {
      mockRequest.query = {
        locationId: 'LOC1313',
        locationName: 'York'
      }

      createPollutantHandler('nitrogenDioxide', mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext).toHaveProperty('nitrogenDioxide')
      expect(viewContext.nitrogenDioxide).toBeDefined()
    })

    it('should include correct pollutant data key for ozone', () => {
      mockRequest.query = {
        locationId: 'LOC1414'
      }

      createPollutantHandler('ozone', mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext).toHaveProperty('ozone')
      expect(viewContext.ozone).toBeDefined()
    })

    it('should include correct pollutant data key for PM10', () => {
      mockRequest.query = {
        locationId: 'LOC1515'
      }

      createPollutantHandler('particulateMatter10', mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext).toHaveProperty('particulateMatter10')
      expect(viewContext.particulateMatter10).toBeDefined()
    })

    it('should include correct pollutant data key for PM25', () => {
      mockRequest.query = {
        locationId: 'LOC1616'
      }

      createPollutantHandler('particulateMatter25', mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext).toHaveProperty('particulateMatter25')
      expect(viewContext.particulateMatter25).toBeDefined()
    })

    it('should include correct pollutant data key for sulphur dioxide', () => {
      mockRequest.query = {
        locationId: 'LOC1717'
      }

      createPollutantHandler('sulphurDioxide', mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext).toHaveProperty('sulphurDioxide')
      expect(viewContext.sulphurDioxide).toBeDefined()
    })
  })

  describe('back link generation', () => {
    it('should create back link with locationId only', () => {
      mockRequest.query = {
        locationId: 'LOC1818'
      }

      createPollutantHandler('nitrogenDioxide', mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext.displayBacklink).toBeDefined()
      expect(viewContext.backLinkUrl).toBeDefined()
      expect(viewContext.backLinkUrl).toContain('LOC1818')
    })

    it('should create back link with locationId and locationName', () => {
      mockRequest.query = {
        locationId: 'LOC1919',
        locationName: 'Southampton'
      }

      createPollutantHandler('ozone', mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext.displayBacklink).toBeDefined()
      expect(viewContext.backLinkUrl).toBeDefined()
    })

    it('should create back link with all parameters', () => {
      mockRequest.query = {
        locationId: 'LOC2020',
        locationName: 'Coventry',
        searchTerms: 'West Midlands'
      }

      createPollutantHandler('particulateMatter10', mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext.displayBacklink).toBeDefined()
      expect(viewContext.backLinkUrl).toBeDefined()
    })
  })
})
