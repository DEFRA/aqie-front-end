import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPollutantHandler } from '../../../../src/server/common/helpers/pollutant-controller-helper.js'

// Test-specific constants
const QUERY_LOCATION_ID = 'locationId'
const QUERY_LOCATION_NAME = 'locationName'
const QUERY_SEARCH_TERMS = 'searchTerms'

const TEST_LOC_1313 = 'LOC1313'
const TEST_LOC_1414 = 'LOC1414'
const TEST_LOC_1515 = 'LOC1515'
const TEST_LOC_1616 = 'LOC1616'
const TEST_LOC_1717 = 'LOC1717'
const TEST_LOC_1818 = 'LOC1818'
const TEST_LOC_1919 = 'LOC1919'
const TEST_LOC_2020 = 'LOC2020'

const CITY_YORK = 'York'
const CITY_SOUTHAMPTON = 'Southampton'
const CITY_COVENTRY = 'Coventry'

const POLLUTANT_NITROGEN_DIOXIDE = 'nitrogenDioxide'
const POLLUTANT_OZONE = 'ozone'
const POLLUTANT_PM10 = 'particulateMatter10'
const POLLUTANT_PM25 = 'particulateMatter25'
const POLLUTANT_SULPHUR_DIOXIDE = 'sulphurDioxide'

const SEARCH_TERMS_WEST_MIDLANDS = 'West Midlands'

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

describe('pollutant-controller-helper - Validation and Back Links', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    const mocks = createMocks()
    mockRequest = mocks.mockRequest
    mockH = mocks.mockH
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
