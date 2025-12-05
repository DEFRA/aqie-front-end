import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPollutantHandler } from '../../../../src/server/common/helpers/pollutant-controller-helper.js'
import { LANG_EN, LANG_CY, SEARCH_LOCATION_ROUTE_EN } from '../../../../src/server/data/constants.js'

// Test-specific constants
const QUERY_LOCATION_ID = 'locationId'
const QUERY_LOCATION_NAME = 'locationName'
const QUERY_SEARCH_TERMS = 'searchTerms'
const QUERY_LANG = 'lang'

const TEST_LOC_123 = 'LOC123'
const TEST_LOC_456 = 'LOC456'
const TEST_LOC_789 = 'LOC789'
const TEST_LOC_101 = 'LOC101'
const TEST_LOC_202 = 'LOC202'
const TEST_LOC_303 = 'LOC303'
const TEST_LOC_404 = 'LOC404'
const TEST_LOC_505 = 'LOC505'
const TEST_LOC_606 = 'LOC606'
const TEST_LOC_707 = 'LOC707'
const TEST_LOC_1313 = 'LOC1313'
const TEST_LOC_1414 = 'LOC1414'
const TEST_LOC_1515 = 'LOC1515'
const TEST_LOC_1616 = 'LOC1616'
const TEST_LOC_1717 = 'LOC1717'
const TEST_LOC_1818 = 'LOC1818'
const TEST_LOC_1919 = 'LOC1919'
const TEST_LOC_2020 = 'LOC2020'

const CITY_CARDIFF = 'Cardiff'
const CITY_LONDON = 'London'
const CITY_MANCHESTER = 'Manchester'
const CITY_BIRMINGHAM = 'Birmingham'
const CITY_LEEDS = 'Leeds'
const CITY_SWANSEA = 'Swansea'
const CITY_BRISTOL = 'Bristol'
const CITY_NEWCASTLE = 'Newcastle'
const CITY_YORK = 'York'
const CITY_SOUTHAMPTON = 'Southampton'
const CITY_COVENTRY = 'Coventry'

const POLLUTANT_NITROGEN_DIOXIDE = 'nitrogenDioxide'
const POLLUTANT_OZONE = 'ozone'
const POLLUTANT_PM10 = 'particulateMatter10'
const POLLUTANT_PM25 = 'particulateMatter25'
const POLLUTANT_SULPHUR_DIOXIDE = 'sulphurDioxide'
const POLLUTANT_UNKNOWN = 'unknownPollutant'

const VIEW_NITROGEN_DIOXIDE = 'nitrogen-dioxide/index'
const VIEW_OZONE = 'ozone/index'
const VIEW_PM10 = 'particulate-matter-10/index'
const VIEW_PM25 = 'particulate-matter-25/index'
const VIEW_SULPHUR_DIOXIDE = 'sulphur-dioxide/index'

const PATH_NITROGEN_DIOXIDE = '/pollutants/nitrogen-dioxide'
const PATH_OZONE = '/pollutants/ozone'
const PATH_PM10 = '/pollutants/particulate-matter-10'
const PATH_PM25 = '/pollutants/particulate-matter-25'
const PATH_SULPHUR_DIOXIDE = '/pollutants/sulphur-dioxide'

const WELSH_PATH_NITROGEN_DIOXIDE = '/llygryddion/nitrogen-deuocsid/cy?'
const WELSH_PATH_OZONE = '/llygryddion/oson/cy?'
const WELSH_PATH_PM10 = '/llygryddion/mater-gronynnol-10/cy?'
const WELSH_PATH_PM25 = '/llygryddion/mater-gronynnol-25/cy?'
const WELSH_PATH_SULPHUR_DIOXIDE = '/llygryddion/sylffwr-deuocsid/cy?'

const PAGE_LABEL_NITROGEN_DIOXIDE = 'nitrogen dioxide'
const PAGE_LABEL_OZONE = 'ozone'
const PAGE_LABEL_PM10 = 'particulate matter 10'
const PAGE_LABEL_PM25 = 'particulate matter 25'
const PAGE_LABEL_SULPHUR_DIOXIDE = 'sulphur dioxide'

const SEARCH_TERMS_SWANSEA = 'Swansea Wales'
const SEARCH_TERMS_WEST_MIDLANDS = 'West Midlands'

const ERROR_UNKNOWN_POLLUTANT = 'Unknown pollutant type: unknownPollutant'

const TEST_HOST = 'localhost:3000'
const TEST_PROTO = 'http'

describe('pollutant-controller-helper', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = {
      info: {
        host: TEST_HOST
      },
      headers: {
        'x-forwarded-proto': TEST_PROTO
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
          page: PAGE_LABEL_NITROGEN_DIOXIDE,
          currentPath: PATH_NITROGEN_DIOXIDE,
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
        expect.stringContaining(WELSH_PATH_NITROGEN_DIOXIDE)
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

  describe('ozone pollutant', () => {
    it('should render ozone view with correct paths', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_456,
        [QUERY_LOCATION_NAME]: CITY_LONDON
      }

      createPollutantHandler(POLLUTANT_OZONE, mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        VIEW_OZONE,
        expect.objectContaining({
          page: PAGE_LABEL_OZONE,
          currentPath: PATH_OZONE
        })
      )
    })

    it('should redirect to Welsh ozone page', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_456,
        [QUERY_LANG]: LANG_CY
      }

      createPollutantHandler(POLLUTANT_OZONE, mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        expect.stringContaining(WELSH_PATH_OZONE)
      )
    })
  })

  describe('particulate matter 10 pollutant', () => {
    it('should render PM10 view with correct data', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_789,
        [QUERY_LOCATION_NAME]: CITY_MANCHESTER
      }

      createPollutantHandler(POLLUTANT_PM10, mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        VIEW_PM10,
        expect.objectContaining({
          page: PAGE_LABEL_PM10,
          currentPath: PATH_PM10
        })
      )
    })

    it('should redirect to Welsh PM10 page', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_789,
        [QUERY_LANG]: LANG_CY
      }

      createPollutantHandler(POLLUTANT_PM10, mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        expect.stringContaining(WELSH_PATH_PM10)
      )
    })
  })

  describe('particulate matter 25 pollutant', () => {
    it('should render PM25 view with correct data', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_101,
        [QUERY_LOCATION_NAME]: CITY_BIRMINGHAM
      }

      createPollutantHandler(POLLUTANT_PM25, mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        VIEW_PM25,
        expect.objectContaining({
          page: PAGE_LABEL_PM25,
          currentPath: PATH_PM25
        })
      )
    })

    it('should redirect to Welsh PM25 page', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_101,
        [QUERY_LANG]: LANG_CY
      }

      createPollutantHandler(POLLUTANT_PM25, mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        expect.stringContaining(WELSH_PATH_PM25)
      )
    })
  })

  describe('sulphur dioxide pollutant', () => {
    it('should render sulphur dioxide view with correct data', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_202,
        [QUERY_LOCATION_NAME]: CITY_LEEDS
      }

      createPollutantHandler(POLLUTANT_SULPHUR_DIOXIDE, mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        VIEW_SULPHUR_DIOXIDE,
        expect.objectContaining({
          page: PAGE_LABEL_SULPHUR_DIOXIDE,
          currentPath: PATH_SULPHUR_DIOXIDE
        })
      )
    })

    it('should redirect to Welsh sulphur dioxide page', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_202,
        [QUERY_LANG]: LANG_CY
      }

      createPollutantHandler(POLLUTANT_SULPHUR_DIOXIDE, mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        expect.stringContaining(WELSH_PATH_SULPHUR_DIOXIDE)
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

  describe('pollutant data validation', () => {
    it('should include correct pollutant data key for nitrogen dioxide', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_1313,
        [QUERY_LOCATION_NAME]: CITY_YORK
      }

      createPollutantHandler(POLLUTANT_NITROGEN_DIOXIDE, mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext).toHaveProperty(POLLUTANT_NITROGEN_DIOXIDE)
      expect(viewContext.nitrogenDioxide).toBeDefined()
    })

    it('should include correct pollutant data key for ozone', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_1414
      }

      createPollutantHandler(POLLUTANT_OZONE, mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext).toHaveProperty(POLLUTANT_OZONE)
      expect(viewContext.ozone).toBeDefined()
    })

    it('should include correct pollutant data key for PM10', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_1515
      }

      createPollutantHandler(POLLUTANT_PM10, mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext).toHaveProperty(POLLUTANT_PM10)
      expect(viewContext.particulateMatter10).toBeDefined()
    })

    it('should include correct pollutant data key for PM25', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_1616
      }

      createPollutantHandler(POLLUTANT_PM25, mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext).toHaveProperty(POLLUTANT_PM25)
      expect(viewContext.particulateMatter25).toBeDefined()
    })

    it('should include correct pollutant data key for sulphur dioxide', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_1717
      }

      createPollutantHandler(POLLUTANT_SULPHUR_DIOXIDE, mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext).toHaveProperty(POLLUTANT_SULPHUR_DIOXIDE)
      expect(viewContext.sulphurDioxide).toBeDefined()
    })
  })

  describe('back link generation', () => {
    it('should create back link with locationId only', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_1818
      }

      createPollutantHandler(POLLUTANT_NITROGEN_DIOXIDE, mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext.displayBacklink).toBeDefined()
      expect(viewContext.backLinkUrl).toBeDefined()
      expect(viewContext.backLinkUrl).toContain(TEST_LOC_1818)
    })

    it('should create back link with locationId and locationName', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_1919,
        [QUERY_LOCATION_NAME]: CITY_SOUTHAMPTON
      }

      createPollutantHandler(POLLUTANT_OZONE, mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext.displayBacklink).toBeDefined()
      expect(viewContext.backLinkUrl).toBeDefined()
    })

    it('should create back link with all parameters', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_2020,
        [QUERY_LOCATION_NAME]: CITY_COVENTRY,
        [QUERY_SEARCH_TERMS]: SEARCH_TERMS_WEST_MIDLANDS
      }

      createPollutantHandler(POLLUTANT_PM10, mockRequest, mockH)

      const viewContext = mockH.view.mock.calls[0][1]
      expect(viewContext.displayBacklink).toBeDefined()
      expect(viewContext.backLinkUrl).toBeDefined()
    })
  })
})
