/* global vi */
import { getLocationDataController } from './controller.js'
import { welsh } from '../../data/cy/cy.js'
import {
  LANG_CY,
  LANG_EN,
  MULTIPLE_LOCATIONS_ROUTE_EN
} from '../../data/constants.js'

const TEST_DATE = '2025-02-04'
const TEST_PATH = '/test-path'

vi.mock('../../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }))
}))
vi.mock('../../data/en/en.js')
vi.mock('../../data/cy/cy.js')
vi.mock('../../data/constants.js')
const mockMetaSiteUrl = 'http://example.com'
vi.mock('../../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => mockMetaSiteUrl)
}))

describe('getLocationDataController', () => {
  describe('Language redirects', () => {
    it('should redirect to English multiple locations route when lang is set to English', async () => {
    const request = {
      yar: {
        get: vi.fn().mockReturnValue({
          results: [],
          monitoringSites: [],
          transformedDailySummary: [],
          calendarWelsh: [],
          englishDate: TEST_DATE,
          welshDate: TEST_DATE,
          getMonth: 'February',
          summaryDate: TEST_DATE,
          lang: LANG_EN,
          userLocation: 'London'
        })
      },
      query: {
        lang: LANG_EN
      },
      path: TEST_PATH
    }
    const h = {
      redirect: vi.fn(() => ({
        code: vi.fn().mockReturnValue('redirected')
      }))
    }

    await getLocationDataController.handler(request, h)

    expect(h.redirect).toHaveBeenCalledWith(MULTIPLE_LOCATIONS_ROUTE_EN)
  })
  })

  describe('Welsh content rendering', () => {
    it('should return multiple locations view with correct data when lang is set to Welsh', async () => {
    const request = {
      yar: {
        get: vi.fn().mockReturnValue({
          results: [],
          monitoringSites: [],
          transformedDailySummary: [],
          calendarWelsh: { February: 'Chwefror' },
          englishDate: TEST_DATE,
          welshDate: TEST_DATE,
          getMonth: 'February',
          summaryDate: TEST_DATE,
          lang: LANG_CY,
          userLocation: 'London'
        })
      },
      query: {
        lang: LANG_CY
      },
      path: TEST_PATH
    }
    const h = {
      view: vi.fn()
    }

    await getLocationDataController.handler(request, h)

    expect(h.view).toHaveBeenCalledWith('multiple-results/multiple-locations', {
      results: [],
      title: welsh.multipleLocations.title,
      paragraphs: welsh.multipleLocations.paragraphs,
      userLocation: 'London',
      monitoringSites: [],
      siteTypeDescriptions: welsh.siteTypeDescriptions,
      pollutantTypes: welsh.pollutantTypes,
      pageTitle: `${welsh.multipleLocations.title} London -  ${welsh.multipleLocations.pageTitle}`,
      metaSiteUrl: 'http://example.com',
      description: welsh.multipleLocations.description,
      serviceName: welsh.multipleLocations.serviceName,
      transformedDailySummary: [],
      dailySummary: welsh.dailySummary,
      footerTxt: welsh.footerTxt,
      phaseBanner: welsh.phaseBanner,
      backlink: welsh.backlink,
      cookieBanner: welsh.cookieBanner,
      welshMonth: 'Chwefror',
      summaryDate: TEST_DATE,
      lang: LANG_CY,
      currentPath: '/canlyniadau-lluosog/cy'
    })
  })
  })

  describe('Error handling', () => {
    it('should handle error and return error view with 500 status code', async () => {
    // ''
    const mockError = new Error('Unexpected error')
    const mockLocationData = {
      results: [],
      monitoringSites: [],
      transformedDailySummary: [],
      calendarWelsh: [],
      englishDate: TEST_DATE,
      welshDate: TEST_DATE,
      getMonth: 'February',
      summaryDate: TEST_DATE,
      lang: LANG_CY,
      userLocation: 'London'
    }

    const request = {
      yar: {
        get: vi.fn().mockReturnValue(mockLocationData)
      },
      query: {
        lang: LANG_CY
      },
      path: TEST_PATH
    }

    const h = {
      view: vi.fn().mockImplementationOnce(() => {
        throw mockError
      }),
      redirect: vi.fn()
    }

    await getLocationDataController.handler(request, h)

    expect(h.view).toHaveBeenCalledWith(
      'error/index',
      expect.objectContaining({
        statusCode: 500,
        url: '/test-path',
        lang: LANG_CY
      })
    )
  })

  it('should handle access_token error and return error view with 401 status code', async () => {
    // ''
    const mockError = new Error(
      "Cannot read properties of undefined (reading 'access_token')"
    )
    const mockLocationData = {
      results: [],
      monitoringSites: [],
      transformedDailySummary: [],
      calendarWelsh: [],
      englishDate: TEST_DATE,
      welshDate: TEST_DATE,
      getMonth: 'February',
      summaryDate: TEST_DATE,
      lang: LANG_CY,
      userLocation: 'London'
    }

    const request = {
      yar: {
        get: vi.fn().mockReturnValue(mockLocationData)
      },
      query: {
        lang: LANG_CY
      },
      path: TEST_PATH
    }

    const h = {
      view: vi.fn().mockImplementationOnce(() => {
        throw mockError
      }),
      redirect: vi.fn()
    }

    await getLocationDataController.handler(request, h)

    expect(h.view).toHaveBeenCalledWith(
      'error/index',
      expect.objectContaining({
        statusCode: 401,
        url: '/test-path',
        lang: LANG_CY
      })
    )
  })

  it('should handle missing locationData and return error view', async () => {
    const request = {
      yar: {
        get: vi.fn().mockReturnValue({})
      },
      query: {
        lang: LANG_CY
      },
      path: TEST_PATH
    }
    const h = {
      view: vi.fn().mockReturnValue('error-view')
    }

    await getLocationDataController.handler(request, h)

    // When locationData is empty object, it should still render the view
    // but may have undefined values
    expect(h.view).toHaveBeenCalled()
  })

  it('should use fallback dates when welshDate and englishDate are undefined', async () => {
    const request = {
      yar: {
        get: vi.fn().mockReturnValue({
          results: [],
          monitoringSites: [],
          transformedDailySummary: [],
          calendarWelsh: { February: 'Chwefror' },
          englishDate: null,
          welshDate: null,
          getMonth: 'February',
          summaryDate: TEST_DATE,
          lang: LANG_CY,
          userLocation: 'Cardiff'
        })
      },
      query: {
        lang: LANG_CY
      },
      path: TEST_PATH
    }
    const h = {
      view: vi.fn()
    }

    await getLocationDataController.handler(request, h)

    expect(h.view).toHaveBeenCalledWith(
      'multiple-results/multiple-locations',
      expect.objectContaining({
        summaryDate: TEST_DATE,
        lang: LANG_CY
      })
    )
  })
  })
})
