import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPollutantHandler } from '../../../../src/server/common/helpers/pollutant-controller-helper.js'
import { LANG_EN, LANG_CY } from '../../../../src/server/data/constants.js'

// Test-specific constants
const QUERY_LOCATION_ID = 'locationId'
const QUERY_LOCATION_NAME = 'locationName'
const QUERY_LANG = 'lang'

const TEST_LOC_123 = 'LOC123'
const TEST_LOC_456 = 'LOC456'
const TEST_LOC_789 = 'LOC789'
const TEST_LOC_101 = 'LOC101'
const TEST_LOC_202 = 'LOC202'

const CITY_CARDIFF = 'Cardiff'
const CITY_LONDON = 'London'
const CITY_MANCHESTER = 'Manchester'
const CITY_BIRMINGHAM = 'Birmingham'
const CITY_LEEDS = 'Leeds'

const POLLUTANT_NITROGEN_DIOXIDE = 'nitrogenDioxide'
const POLLUTANT_OZONE = 'ozone'
const POLLUTANT_PM10 = 'particulateMatter10'
const POLLUTANT_PM25 = 'particulateMatter25'
const POLLUTANT_SULPHUR_DIOXIDE = 'sulphurDioxide'

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

describe('pollutant-controller-helper - Individual Pollutants', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    const mocks = createMocks()
    mockRequest = mocks.mockRequest
    mockH = mocks.mockH
  })

  describe('nitrogen dioxide pollutant', () => {
    it('should render nitrogen dioxide view with correct paths', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_123,
        [QUERY_LOCATION_NAME]: CITY_CARDIFF
      }

      createPollutantHandler(POLLUTANT_NITROGEN_DIOXIDE, mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        VIEW_NITROGEN_DIOXIDE,
        expect.objectContaining({
          page: PAGE_LABEL_NITROGEN_DIOXIDE,
          currentPath: PATH_NITROGEN_DIOXIDE
        })
      )
    })

    it('should redirect to Welsh nitrogen dioxide page', () => {
      mockRequest.query = {
        [QUERY_LOCATION_ID]: TEST_LOC_123,
        [QUERY_LANG]: LANG_CY
      }

      createPollutantHandler(POLLUTANT_NITROGEN_DIOXIDE, mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        expect.stringContaining(WELSH_PATH_NITROGEN_DIOXIDE)
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
})
