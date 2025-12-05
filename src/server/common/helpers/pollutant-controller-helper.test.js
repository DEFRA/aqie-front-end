import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPollutantHandler } from './pollutant-controller-helper.js'

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

      const result = createPollutantHandler(
        'nitrogenDioxide',
        mockRequest,
        mockH
      )

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

      const result = createPollutantHandler(
        'nitrogenDioxide',
        mockRequest,
        mockH
      )

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
      expect(viewContext).toHaveProperty('backLink')
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

      const result = createPollutantHandler(
        'particulateMatter10',
        mockRequest,
        mockH
      )

      expect(result.code).toHaveBeenCalledWith(301)
    })

    it('should use correct redirect status code for search location', () => {
      mockRequest.query = {}

      const result = createPollutantHandler(
        'sulphurDioxide',
        mockRequest,
        mockH
      )

      expect(result.code).toHaveBeenCalledWith(301)
    })
  })
})
