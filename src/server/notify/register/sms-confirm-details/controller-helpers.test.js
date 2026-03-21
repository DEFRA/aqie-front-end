import { describe, it, expect, vi, beforeEach } from 'vitest'

import { resolveNotifyLanguage } from '../helpers/resolve-notify-language.js'
import {
  getConfirmDetailsContext,
  consumeDuplicateAlertState,
  getConfirmDetailsSessionData,
  redirectForMissingLocation,
  buildConfirmDetailsViewModel,
  logConfirmDetailsRenderError,
  logConfirmDetailsSessionData
} from './controller-helpers.js'

vi.mock('../../../common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  })
}))

vi.mock('../../../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => 'https://example.test')
}))

vi.mock('../helpers/resolve-notify-language.js', () => ({
  resolveNotifyLanguage: vi.fn(() => 'en')
}))

vi.mock('../../../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'notify.smsMobileNumberPath') {
        return '/notify/register/sms-mobile-number'
      }
      if (key === 'notify.smsVerifyCodePath') {
        return '/notify/register/sms-verify-code'
      }
      return undefined
    })
  }
}))

const createRequest = (session = {}) => ({
  path: '/notify/register/sms-confirm-details',
  yar: {
    id: 'session-1',
    get: vi.fn((key) => session[key]),
    set: vi.fn((key, value) => {
      session[key] = value
    }),
    clear: vi.fn((key) => {
      delete session[key]
    })
  }
})

describe('sms-confirm-details/controller-helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveNotifyLanguage.mockReturnValue('en')
  })

  it('returns context for english language by default', () => {
    const request = createRequest()
    const context = getConfirmDetailsContext(request)

    expect(context.lang).toBe('en')
    expect(context.smsConfirmDetails).toBeTruthy()
    expect(context.common).toBeTruthy()
    expect(context.metaSiteUrl).toBe('https://example.test')
  })

  it('returns welsh context when language resolver returns cy', () => {
    resolveNotifyLanguage.mockReturnValue('cy')
    const request = createRequest()

    const context = getConfirmDetailsContext(request)

    expect(context.lang).toBe('cy')
    expect(context.smsConfirmDetails).toBeTruthy()
  })

  it('consumes duplicate alert state and clears flags from session', () => {
    const session = {
      duplicateAlertError: true,
      duplicateAlertLocation: 'Leeds'
    }
    const request = createRequest(session)

    const state = consumeDuplicateAlertState(request)

    expect(state.duplicateAlertError).toBe(true)
    expect(state.duplicateAlertLocation).toBe('Leeds')
    expect(request.yar.clear).toHaveBeenCalledWith('duplicateAlertError')
    expect(request.yar.clear).toHaveBeenCalledWith('duplicateAlertLocation')
  })

  it('returns session data object with notify keys', () => {
    const session = {
      mobileNumber: '07123456789',
      location: 'Leeds',
      locationId: 'loc-1',
      latitude: 53.8,
      longitude: -1.5,
      locationData: { id: 'loc-1' },
      notificationFlow: 'sms',
      searchTermsSaved: 'Leeds'
    }
    const request = createRequest(session)

    const result = getConfirmDetailsSessionData(request)

    expect(result.mobileNumber).toBe('07123456789')
    expect(result.location).toBe('Leeds')
    expect(result.locationId).toBe('loc-1')
    expect(result.lat).toBe(53.8)
    expect(result.long).toBe(-1.5)
  })

  it('redirects to search flow when location missing and locationId present', () => {
    const request = createRequest({ locationId: 'loc-1' })
    const h = { redirect: vi.fn((to) => ({ redirect: to })) }

    const response = redirectForMissingLocation({
      request,
      h,
      location: null,
      locationId: 'loc-1'
    })

    expect(request.yar.set).toHaveBeenCalledWith('notificationFlow', 'sms')
    expect(response.redirect).toBe('/search-location?fromSmsFlow=true')
  })

  it('redirects to search flow when both location and locationId are missing', () => {
    const request = createRequest({})
    const h = { redirect: vi.fn((to) => ({ redirect: to })) }

    const response = redirectForMissingLocation({
      request,
      h,
      location: null,
      locationId: null
    })

    expect(response.redirect).toBe('/search-location?fromSmsFlow=true')
  })

  it('returns null when location is present', () => {
    const request = createRequest({ location: 'Leeds' })
    const h = { redirect: vi.fn() }

    const response = redirectForMissingLocation({
      request,
      h,
      location: 'Leeds',
      locationId: null
    })

    expect(response).toBeNull()
    expect(h.redirect).not.toHaveBeenCalled()
  })

  it('builds view model with duplicate alert error and query string values', () => {
    const session = { formData: { from: 'test' } }
    const request = createRequest(session)

    const vm = buildConfirmDetailsViewModel({
      request,
      lang: 'en',
      languageContent: {
        footerTxt: {},
        phaseBanner: {},
        cookieBanner: {}
      },
      smsConfirmDetails: {
        pageTitle: 'Confirm your details',
        heading: 'Confirm alerts for {location}',
        alertTypes: {
          forecast: 'Forecast for {location}',
          monitoring: 'Monitoring for {location}'
        },
        errors: {
          duplicateAlert: {
            summary: 'Alert already exists for {location}',
            field: 'Duplicate alert'
          }
        }
      },
      common: {
        serviceName: 'Check air quality',
        backLinkText: 'Back'
      },
      metaSiteUrl: 'https://example.test',
      safeLocation: 'Leeds',
      locationId: 'loc-1',
      lat: 53.8,
      long: -1.5,
      mobileNumber: '07123456789',
      duplicateAlertError: true,
      duplicateAlertLocation: 'Leeds'
    })

    expect(vm.pageTitle.startsWith('Error:')).toBe(true)
    expect(vm.changeMobileNumberUrl).toContain(
      '/notify/register/sms-mobile-number?'
    )
    expect(vm.changeMobileNumberUrl).toContain('location=Leeds')
    expect(vm.duplicateAlertError.summary).toContain('Leeds')
    expect(vm.backLinkUrl).toBe('/notify/register/sms-verify-code')
  })

  it('builds normal view model when duplicate flag is not set', () => {
    const request = createRequest({})

    const vm = buildConfirmDetailsViewModel({
      request,
      lang: 'en',
      languageContent: {
        footerTxt: {},
        phaseBanner: {},
        cookieBanner: {}
      },
      smsConfirmDetails: {
        pageTitle: 'Confirm your details',
        heading: 'Confirm alerts for {location}',
        alertTypes: {
          forecast: 'Forecast for {location}',
          monitoring: 'Monitoring for {location}'
        },
        errors: {
          duplicateAlert: {
            summary: 'Alert already exists for {location}',
            field: 'Duplicate alert'
          }
        }
      },
      common: {
        serviceName: 'Check air quality'
      },
      metaSiteUrl: 'https://example.test',
      safeLocation: 'Leeds',
      locationId: null,
      lat: null,
      long: null,
      mobileNumber: '07123456789',
      duplicateAlertError: false,
      duplicateAlertLocation: null
    })

    expect(vm.pageTitle.startsWith('Error:')).toBe(false)
    expect(vm.duplicateAlertError).toBeNull()
  })

  it('logging helpers execute without throwing', () => {
    const request = createRequest({
      location: 'Leeds',
      locationId: 'loc-1',
      mobileNumber: '07123456789'
    })

    expect(() =>
      logConfirmDetailsRenderError(request, new Error('boom'))
    ).not.toThrow()
    expect(() =>
      logConfirmDetailsSessionData(request, {
        mobileNumber: '07123456789',
        location: 'Leeds',
        locationId: 'loc-1',
        lat: 53.8,
        long: -1.5,
        locationData: { id: 'loc-1' },
        notificationFlow: 'sms',
        searchTermsSaved: 'Leeds'
      })
    ).not.toThrow()
  })
})
