import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  getAlertSetupSessionData,
  logAlertSetupSessionData,
  logMissingAlertSetupSessionData,
  handleSetupAlertFailure
} from './controller-post-helpers.js'

vi.mock('../../../common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  })
}))

vi.mock('../../../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'notify.smsMobileNumberPath') {
        return '/notify/register/sms-mobile-number'
      }
      if (key === 'notify.duplicateSubscriptionPath') {
        return '/notify/register/sms-duplicate'
      }
      return undefined
    })
  }
}))

const createRequest = (session = {}) => ({
  yar: {
    get: vi.fn((key) => session[key]),
    set: vi.fn((key, value) => {
      session[key] = value
    }),
    clear: vi.fn((key) => {
      delete session[key]
    })
  }
})

describe('sms-confirm-details/controller-post-helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reads session values used for setup alert', () => {
    const request = createRequest({
      mobileNumber: '07123456789',
      location: 'Leeds',
      locationId: 'loc-1',
      latitude: 53.8,
      longitude: -1.5
    })

    const result = getAlertSetupSessionData(request)

    expect(result.phoneNumber).toBe('07123456789')
    expect(result.location).toBe('Leeds')
    expect(result.locationId).toBe('loc-1')
    expect(result.lat).toBe(53.8)
    expect(result.long).toBe(-1.5)
  })

  it('handles 400 from setup-alert by setting max-alerts flags and redirecting', () => {
    const session = { mobileNumber: '07123456789', location: 'Leeds' }
    const request = createRequest(session)
    const h = { redirect: vi.fn((to) => ({ redirect: to })) }

    const response = handleSetupAlertFailure({
      request,
      h,
      result: { status: 400, body: { message: 'max reached' } },
      phoneNumber: '07123456789',
      location: 'Leeds'
    })

    expect(request.yar.set).toHaveBeenCalledWith('maxAlertsError', true)
    expect(request.yar.set).toHaveBeenCalledWith(
      'maskedPhoneNumber',
      '07123456789'
    )
    expect(request.yar.clear).toHaveBeenCalledWith('mobileNumber')
    expect(response.redirect).toBe('/notify/register/sms-mobile-number')
  })

  it('handles 409 from setup-alert by redirecting to duplicate route', () => {
    const request = createRequest({
      mobileNumber: '07123456789',
      location: 'Leeds'
    })
    const h = { redirect: vi.fn((to) => ({ redirect: to })) }

    const response = handleSetupAlertFailure({
      request,
      h,
      result: { status: 409, body: { message: 'duplicate' } },
      phoneNumber: '07123456789',
      location: 'Leeds'
    })

    expect(response.redirect).toBe('/notify/register/sms-duplicate')
  })

  it('handles unknown setup-alert errors with fallback mobile-number redirect', () => {
    const request = createRequest({
      mobileNumber: '07123456789',
      location: 'Leeds'
    })
    const h = { redirect: vi.fn((to) => ({ redirect: to })) }

    const response = handleSetupAlertFailure({
      request,
      h,
      result: {
        status: 500,
        body: { error: 'down' },
        error: new Error('down')
      },
      phoneNumber: '07123456789',
      location: 'Leeds'
    })

    expect(request.yar.set).toHaveBeenCalledWith('setupAlertError', true)
    expect(request.yar.clear).toHaveBeenCalledWith('mobileNumber')
    expect(response.redirect).toBe('/notify/register/sms-mobile-number')
  })

  it('logging helper functions execute without throwing', () => {
    expect(() =>
      logAlertSetupSessionData({
        phoneNumber: '07123456789',
        location: 'Air quality in Leeds',
        locationId: 'loc-1',
        lat: 53.8,
        long: -1.5
      })
    ).not.toThrow()

    expect(() =>
      logMissingAlertSetupSessionData({
        phoneNumber: null,
        location: null,
        lat: null,
        long: null
      })
    ).not.toThrow()
  })
})
