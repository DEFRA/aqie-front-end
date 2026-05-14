import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  airPollutionBreachesController,
  airPollutionBreachesCyController
} from './controller.js'
import { fetchBreaches } from './fetch-breaches.js'

vi.mock('./fetch-breaches.js', () => ({
  fetchBreaches: vi.fn()
}))

vi.mock('../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi
    .fn()
    .mockReturnValue('https://check-air-quality.service.gov.uk')
}))

vi.mock('../data/en/en.js', () => ({
  english: {
    phaseBanner: { paragraphs: { a: 'beta', b: '', c: '', d: '' } },
    footerTxt: {
      privacy: 'Privacy',
      cookies: 'Cookies',
      accessibility: 'Accessibility'
    },
    cookieBanner: {},
    multipleLocations: { serviceName: 'Check air quality' },
    backlink: { text: 'Change location' }
  }
}))

vi.mock('./content.js', () => ({
  breachesContentEn: {
    pageTitle: 'Air pollution breaches',
    heading: 'Air pollution breaches',
    intro: {
      legal: 'Legal text',
      actions: 'Actions text',
      measured: 'Measured'
    },
    active: {
      heading: 'Active breaches',
      countMessage:
        'There is currently <b>{count}</b> active air pollution breach',
      timingMessage: 'Timing message',
      labels: {
        monitoringLocation: 'Monitoring location',
        pollutant: 'Pollutant',
        alertStarted: 'Alert started'
      },
      whatCausesPrefix: 'What causes high ',
      whatCausesSuffix: ' levels?'
    },
    past: {
      heading: 'Past breaches',
      subheading: 'Recorded in the last 12 months',
      showText: 'Show',
      hideText: 'Hide',
      labels: {
        alertRegion: 'Alert region',
        monitoringArea: 'Monitoring area',
        pollutant: 'Pollutant',
        dataSource: 'Data source',
        alertPeriod: 'Alert period'
      },
      fromPrefix: 'From',
      toPrefix: 'To'
    }
  }
}))

const EN_PATH = '/air-pollution-breaches'

const createMockH = () => ({
  redirect: vi.fn().mockReturnValue('redirected'),
  view: vi.fn().mockReturnValue('view rendered')
})

const mockActiveBreach = {
  region: 'London',
  monitoringLocation: 'London Marylebone Road',
  pollutantName: 'Ozone',
  pollutantLink: '/pollutants/ozone?lang=en',
  alertStartedText: 'About 2 hours ago (10:00am, 10 January 2024)'
}

const mockPastBreach = {
  title: 'Leeds Centre, Yorkshire (15 June 2023)',
  alertRegion: 'Yorkshire',
  monitoringArea: 'Leeds Centre',
  pollutantName: 'Nitrogen dioxide',
  pollutantLink: '/pollutants/nitrogen-dioxide?lang=en',
  dataSource: 'Automatic Urban and Rural Network (AURN)',
  alertPeriodFrom: '8:00am, 15 June 2023',
  alertPeriodTo: '8:00am, 16 June 2023'
}

describe('airPollutionBreachesController', () => {
  let mockH

  beforeEach(() => {
    vi.clearAllMocks()
    mockH = createMockH()
    fetchBreaches.mockResolvedValue({ activeBreaches: [], pastBreaches: [] })
  })

  it('should redirect to EN_PATH when lang query param is cy', async () => {
    const request = { query: { lang: 'cy' } }
    await airPollutionBreachesController.handler(request, mockH)
    expect(mockH.redirect).toHaveBeenCalledWith(EN_PATH)
    expect(mockH.view).not.toHaveBeenCalled()
  })

  it('should render the view when lang is en', async () => {
    const request = { query: { lang: 'en' } }
    await airPollutionBreachesController.handler(request, mockH)
    expect(mockH.view).toHaveBeenCalledWith(
      'air-pollution-breaches/index',
      expect.objectContaining({ lang: 'en', page: 'air pollution breaches' })
    )
  })

  it('should pass hideLanguageToggle: true to the view', async () => {
    const request = { query: { lang: 'en' } }
    await airPollutionBreachesController.handler(request, mockH)
    expect(mockH.view).toHaveBeenCalledWith(
      'air-pollution-breaches/index',
      expect.objectContaining({ hideLanguageToggle: true })
    )
  })

  it('should pass displayBacklink: true and customBackLink: true to the view when locationId is present', async () => {
    const request = { query: { lang: 'en', locationId: 'bristol-city' } }
    await airPollutionBreachesController.handler(request, mockH)
    expect(mockH.view).toHaveBeenCalledWith(
      'air-pollution-breaches/index',
      expect.objectContaining({ displayBacklink: true, customBackLink: true })
    )
  })

  it('should build backLinkUrl to location page when locationId is present', async () => {
    const request = {
      query: {
        lang: 'en',
        locationId: 'bristol-city',
        locationName: 'Bristol, City of Bristol'
      }
    }
    await airPollutionBreachesController.handler(request, mockH)
    const viewArgs = mockH.view.mock.calls[0][1]
    expect(viewArgs.backLinkUrl).toBe('/location/bristol-city?lang=en')
  })

  it('should set backLinkText to "Air pollution in {locationName}" when locationName is present', async () => {
    const request = {
      query: {
        lang: 'en',
        locationId: 'bristol-city',
        locationName: 'Bristol, City of Bristol'
      }
    }
    await airPollutionBreachesController.handler(request, mockH)
    const viewArgs = mockH.view.mock.calls[0][1]
    expect(viewArgs.backLinkText).toBe(
      'Air pollution in Bristol, City of Bristol'
    )
  })

  it('should not show back button when no locationId is present', async () => {
    const request = { query: { lang: 'en' } }
    await airPollutionBreachesController.handler(request, mockH)
    const viewArgs = mockH.view.mock.calls[0][1]
    expect(viewArgs.displayBacklink).toBe(false)
  })

  it('should fall back to search-location backLinkUrl when no locationId is present', async () => {
    const request = { query: { lang: 'en' } }
    await airPollutionBreachesController.handler(request, mockH)
    const viewArgs = mockH.view.mock.calls[0][1]
    expect(viewArgs.backLinkUrl).toBe('/search-location?lang=en')
  })

  it('should fetch breaches in English', async () => {
    const request = { query: { lang: 'en' } }
    await airPollutionBreachesController.handler(request, mockH)
    expect(fetchBreaches).toHaveBeenCalledWith('en', request)
  })

  it('should include active and past breaches in the view model', async () => {
    fetchBreaches.mockResolvedValue({
      activeBreaches: [mockActiveBreach],
      pastBreaches: [mockPastBreach]
    })
    const request = { query: { lang: 'en' } }
    await airPollutionBreachesController.handler(request, mockH)
    const viewArgs = mockH.view.mock.calls[0][1]
    expect(viewArgs.activeBreaches).toHaveLength(1)
    expect(viewArgs.pastBreaches).toHaveLength(1)
  })

  it('should replace {count} in countHtml with the active breach count', async () => {
    fetchBreaches.mockResolvedValue({
      activeBreaches: [mockActiveBreach, mockActiveBreach],
      pastBreaches: []
    })
    const request = { query: { lang: 'en' } }
    await airPollutionBreachesController.handler(request, mockH)
    const viewArgs = mockH.view.mock.calls[0][1]
    expect(viewArgs.active.countHtml).toContain('2')
  })

  it('should add pollutantLinkText to each active breach', async () => {
    fetchBreaches.mockResolvedValue({
      activeBreaches: [mockActiveBreach],
      pastBreaches: []
    })
    const request = { query: { lang: 'en' } }
    await airPollutionBreachesController.handler(request, mockH)
    const viewArgs = mockH.view.mock.calls[0][1]
    expect(viewArgs.activeBreaches[0].pollutantLinkText).toBe(
      'What causes high Ozone levels?'
    )
  })
})

describe('airPollutionBreachesCyController', () => {
  it('should always redirect to EN_PATH', () => {
    const mockH = createMockH()
    airPollutionBreachesCyController.handler(null, mockH)
    expect(mockH.redirect).toHaveBeenCalledWith(EN_PATH)
  })

  it('should not render a view', () => {
    const mockH = createMockH()
    airPollutionBreachesCyController.handler(null, mockH)
    expect(mockH.view).not.toHaveBeenCalled()
  })
})
