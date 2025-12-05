import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPollutantHandler } from '../../../../src/server/common/helpers/pollutant-controller-helper.js'
import { LANG_EN, LANG_CY, SEARCH_LOCATION_ROUTE_EN } from '../../../../src/server/data/constants.js'

// Test-specific constants
const QUERY_LOCATION_ID = 'locationId'
const QUERY_LOCATION_NAME = 'locationName'
const QUERY_SEARCH_TERMS = 'searchTerms'
const QUERY_LANG = 'lang'

const TEST_LOC_123 = 'LOC123'
const TEST_LOC_303 = 'LOC303'
const TEST_LOC_404 = 'LOC404'
const TEST_LOC_505 = 'LOC505'
const TEST_LOC_606 = 'LOC606'
const TEST_LOC_707 = 'LOC707'

const CITY_CARDIFF = 'Cardiff'
const CITY_SWANSEA = 'Swansea'
const CITY_BRISTOL = 'Bristol'
const CITY_NEWCASTLE = 'Newcastle'

const POLLUTANT_NITROGEN_DIOXIDE = 'nitrogenDioxide'
const POLLUTANT_OZONE = 'ozone'
const POLLUTANT_UNKNOWN = 'unknownPollutant'

const VIEW_NITROGEN_DIOXIDE = 'nitrogen-dioxide/index'

const SEARCH_TERMS_SWANSEA = 'Swansea Wales'

const ERROR_UNKNOWN_POLLUTANT = 'Unknown pollutant type: unknownPollutant'

const TEST_HOST = 'localhost:3000'
const TEST_PROTO = 'http'

// Helper function to create mock request and response objects
function createMocks() {
  const mockRequest = {
    info: {
      host: TEST_HOST
    },
    headers: {
      'x-forwarded-proto': TEST_PROTO
    }
  }

  const mockH = {
    view: vi.fn((template, context) => ({ template, context })),
    redirect: vi.fn((url) => ({
      code: vi.fn((statusCode) => ({ url, statusCode }))
    }))
  }

  return { mockRequest, mockH }
}

describe('pollutant-controller-helper - Core Functionality', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    const mocks = createMocks()
    mockRequest = mocks.mockRequest
    mockH = mocks.mockH
  })

  describe('basic functionality', () => {
    it('should render nitrogen dioxide view with all required data', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_123,
        [QUERY_LOCATION_NAME]: CITY_CARDIFF,
        [QUERY_SEARCH_TERMS]: CITY_CARDIFF,
        [QUERY_LANG]: LANG_EN
      }

      createPollutantHandler(POLLUTANT_NITROGEN_DIOXIDE, mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        VIEW_NITROGEN_DIOXIDE,
        expect.objectContaining({
          pageTitle: expect.any(String),
          description: expect.any(String),
          page: 'nitrogen dioxide',
          currentPath: '/pollutants/nitrogen-dioxide',
          [QUERY_LOCATION_ID]: TEST_LOC_123,
          [QUERY_LOCATION_NAME]: CITY_CARDIFF,
          [QUERY_SEARCH_TERMS]: CITY_CARDIFF,
          [QUERY_LANG]: LANG_EN
        })
      )
    })

    it('should redirect to Welsh version when lang is cy', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_123,
        [QUERY_LOCATION_NAME]: CITY_CARDIFF,
        [QUERY_SEARCH_TERMS]: CITY_CARDIFF,
        [QUERY_LANG]: LANG_CY
      }

      createPollutantHandler(POLLUTANT_NITROGEN_DIOXIDE, mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/llygryddion/nitrogen-deuocsid/cy?')
      )
    })

    it('should redirect to search when no locationId', () => {
      mockRequest.query = {}

      createPollutantHandler(POLLUTANT_NITROGEN_DIOXIDE, mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(SEARCH_LOCATION_ROUTE_EN)
    })

    it('should set searchTerms to null when undefined', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_123,
        [QUERY_LOCATION_NAME]: CITY_CARDIFF
      }

      createPollutantHandler(POLLUTANT_NITROGEN_DIOXIDE, mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        VIEW_NITROGEN_DIOXIDE,
        expect.objectContaining({
          [QUERY_SEARCH_TERMS]: null
        })
      )
    })
  })

  describe('Welsh redirects with all query params', () => {
    it('should preserve locationId, locationName, and searchTerms in Welsh redirect', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_303,
        [QUERY_LOCATION_NAME]: CITY_SWANSEA,
        [QUERY_SEARCH_TERMS]: SEARCH_TERMS_SWANSEA,
        [QUERY_LANG]: LANG_CY
      }

      createPollutantHandler(POLLUTANT_NITROGEN_DIOXIDE, mockRequest, mockH)

      const redirectCall = mockH.redirect.mock.calls[0][0]
      expect(redirectCall).toContain(`lang=${LANG_CY}`)
      expect(redirectCall).toContain(`locationId=${TEST_LOC_303}`)
      expect(redirectCall).toContain(`locationName=${CITY_SWANSEA}`)
      expect(redirectCall).toContain(`searchTerms=${CITY_SWANSEA}`)
    })

    it('should handle Welsh redirect with only locationId', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_404,
        [QUERY_LANG]: LANG_CY
      }

      createPollutantHandler(POLLUTANT_OZONE, mockRequest, mockH)

      const redirectCall = mockH.redirect.mock.calls[0][0]
      expect(redirectCall).toContain(`lang=${LANG_CY}`)
      expect(redirectCall).toContain(`locationId=${TEST_LOC_404}`)
      expect(redirectCall).not.toContain(QUERY_LOCATION_NAME)
      expect(redirectCall).not.toContain(QUERY_SEARCH_TERMS)
    })
  })

  describe('error handling', () => {
    it('should throw error for unknown pollutant type', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_505
      }

      expect(() => {
        createPollutantHandler(POLLUTANT_UNKNOWN, mockRequest, mockH)
      }).toThrow(ERROR_UNKNOWN_POLLUTANT)
    })
  })

  describe('view context data', () => {
    it('should include all required context properties', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_606,
        [QUERY_LOCATION_NAME]: CITY_BRISTOL,
        [QUERY_SEARCH_TERMS]: CITY_BRISTOL,
        [QUERY_LANG]: LANG_EN
      }

      createPollutantHandler(POLLUTANT_NITROGEN_DIOXIDE, mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]

      expect(viewContext).toHaveProperty('pageTitle')
      expect(viewContext).toHaveProperty('description')
      expect(viewContext).toHaveProperty('metaSiteUrl')
      expect(viewContext).toHaveProperty(POLLUTANT_NITROGEN_DIOXIDE)
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
      expect(viewContext).toHaveProperty(QUERY_LOCATION_ID)
      expect(viewContext).toHaveProperty(QUERY_LOCATION_NAME)
      expect(viewContext).toHaveProperty(QUERY_SEARCH_TERMS)
      expect(viewContext).toHaveProperty(QUERY_LANG)
    })

    it('should default lang to en when not specified', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_707,
        [QUERY_LOCATION_NAME]: CITY_NEWCASTLE
      }

      createPollutantHandler(POLLUTANT_OZONE, mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext.lang).toBe(LANG_EN)
    })
  })
})
