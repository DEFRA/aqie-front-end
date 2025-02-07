import { getLocationDataController } from '~/src/server/multiple-results/cy/controller'
// import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { welsh } from '~/src/server/data/cy/cy.js'
import {
  LANG_CY,
  LANG_EN,
  MULTIPLE_LOCATIONS_ROUTE_EN
} from '~/src/server/data/constants'
// import { getAirQualitySiteUrl } from '~/src/server/common/helpers/get-site-url'

jest.mock('~/src/server/common/helpers/logging/logger')
jest.mock('~/src/server/data/en/en.js')
jest.mock('~/src/server/data/cy/cy.js')
jest.mock('~/src/server/data/constants')
jest.mock('~/src/server/common/helpers/get-site-url')

// const logger = createLogger()

jest.mock('~/src/server/common/helpers/logging/logger', () => ({
  createLogger: () => ({
    error: jest.fn()
  })
}))

jest.mock('~/src/server/common/helpers/get-site-url', () => ({
  getAirQualitySiteUrl: jest.fn().mockReturnValue('http://example.com')
}))

describe('getLocationDataController', () => {
  it('should redirect to English multiple locations route when lang is set to English', async () => {
    const request = {
      yar: {
        get: jest.fn().mockReturnValue({
          results: [],
          monitoringSites: [],
          transformedDailySummary: [],
          calendarWelsh: [],
          englishDate: '2025-02-04',
          welshDate: '2025-02-04',
          getMonth: 'February',
          summaryDate: '2025-02-04',
          lang: LANG_EN,
          userLocation: 'London'
        })
      },
      query: {
        lang: LANG_EN
      },
      path: '/test-path'
    }
    const h = {
      redirect: jest.fn()
    }

    await getLocationDataController.handler(request, h)

    expect(h.redirect).toHaveBeenCalledWith(MULTIPLE_LOCATIONS_ROUTE_EN)
  })

  it('should return multiple locations view with correct data when lang is set to Welsh', async () => {
    const request = {
      yar: {
        get: jest.fn().mockReturnValue({
          results: [],
          monitoringSites: [],
          transformedDailySummary: [],
          calendarWelsh: { February: 'Chwefror' },
          englishDate: '2025-02-04',
          welshDate: '2025-02-04',
          getMonth: 'February',
          summaryDate: '2025-02-04',
          lang: LANG_CY,
          userLocation: 'London'
        })
      },
      query: {
        lang: LANG_CY
      },
      path: '/test-path'
    }
    const h = {
      view: jest.fn()
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
      summaryDate: '2025-02-04',
      lang: LANG_CY
    })
  })
})
