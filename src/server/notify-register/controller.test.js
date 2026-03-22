import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getConfirmAlertController,
  postConfirmAlertController,
  getSuccessController,
  getTextAlertsController,
  postTextAlertsController,
  getEmailAlertsController
} from './controller.js'
import { notifyService } from '../../helpers/notify-service.js'
import { REDIRECT_STATUS_CODE } from '../data/constants.js'

vi.mock('../../helpers/notify-service.js', () => ({
  notifyService: {
    registerForAlerts: vi.fn()
  }
}))

vi.mock('../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => 'https://example.test')
}))

const createResponse = (payload) => ({
  ...payload,
  code(statusCode) {
    this.statusCode = statusCode
    return this
  }
})

const mockH = () => ({
  view: vi.fn((tpl, vm) => createResponse({ tpl, vm })),
  redirect: vi.fn((location) => createResponse({ redirect: location }))
})

const mockRequest = (session = {}) => ({
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

describe('notify-register/controller', () => {
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NODE_ENV = 'test'
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  it('renders confirm alert view', async () => {
    const h = mockH()
    const response = await getConfirmAlertController.handler(mockRequest(), h)

    expect(response.tpl).toBe('notify-register/confirm-alert')
    expect(response.vm.heading).toContain('Confirm your air quality alert')
  })

  it('redirects back to text alerts when phone is not verified', async () => {
    const h = mockH()
    const response = await postConfirmAlertController.handler(mockRequest(), h)

    expect(response.redirect).toBe('/notify/text-alerts')
    expect(response.statusCode).toBe(REDIRECT_STATUS_CODE)
  })

  it('returns 400 error view when location details are missing', async () => {
    const h = mockH()
    const session = {
      phoneVerified: true,
      mobileNumber: '07111111111'
    }

    const response = await postConfirmAlertController.handler(
      mockRequest(session),
      h
    )

    expect(response.tpl).toBe('notify-register/error')
    expect(response.statusCode).toBe(400)
    expect(response.vm.pageTitle).toContain('Location not found')
  })

  it('registers user and redirects to success when API succeeds', async () => {
    const h = mockH()
    const session = {
      phoneVerified: true,
      alertType: 'text',
      mobileNumber: '07999999999',
      locationData: {
        locationDetails: {
          id: 'loc-1',
          name: 'Leeds',
          area: 'West Yorkshire'
        }
      },
      activationCode: '12345',
      activationCodeTimestamp: Date.now()
    }

    notifyService.registerForAlerts.mockResolvedValueOnce({
      success: true,
      registrationId: 'reg-123'
    })

    const response = await postConfirmAlertController.handler(
      mockRequest(session),
      h
    )

    expect(notifyService.registerForAlerts).toHaveBeenCalledTimes(1)
    expect(response.redirect).toBe('/notify/success')
    expect(response.statusCode).toBe(REDIRECT_STATUS_CODE)
    expect(session.registrationId).toBe('reg-123')
    expect(session.registrationComplete).toBe(true)
    expect(session.activationCode).toBeUndefined()
  })

  it('falls back to success in development when register call fails', async () => {
    process.env.NODE_ENV = 'development'
    const h = mockH()
    const session = {
      phoneVerified: true,
      mobileNumber: '07999999999',
      locationData: {
        locationDetails: {
          id: 'loc-2',
          title: 'Bristol',
          region: 'South West'
        }
      }
    }

    notifyService.registerForAlerts.mockResolvedValueOnce({ success: false })

    const response = await postConfirmAlertController.handler(
      mockRequest(session),
      h
    )

    expect(response.redirect).toBe('/notify/success')
    expect(response.statusCode).toBe(REDIRECT_STATUS_CODE)
    expect(session.registrationComplete).toBe(true)
    expect(session.apiError).toBe(true)
  })

  it('returns 500 error view in production when register call throws', async () => {
    process.env.NODE_ENV = 'production'
    const h = mockH()
    const session = {
      phoneVerified: true,
      mobileNumber: '07999999999',
      locationData: {
        locationDetails: {
          id: 'loc-3',
          name: 'London'
        }
      }
    }

    notifyService.registerForAlerts.mockRejectedValueOnce(new Error('boom'))

    const response = await postConfirmAlertController.handler(
      mockRequest(session),
      h
    )

    expect(response.tpl).toBe('notify-register/error')
    expect(response.statusCode).toBe(500)
  })

  it('renders success with development API fallback hint', async () => {
    process.env.NODE_ENV = 'development'
    const h = mockH()
    const session = {
      apiError: true,
      mobileNumber: '07000000000'
    }

    const response = await getSuccessController.handler(mockRequest(session), h)

    expect(response.tpl).toBe('notify-register/success')
    expect(response.vm.developmentInfo).toContain('API fallback')
  })

  it('renders success with registration id in development', async () => {
    process.env.NODE_ENV = 'development'
    const h = mockH()
    const session = {
      registrationId: 'reg-dev-1',
      mobileNumber: '07000000000'
    }

    const response = await getSuccessController.handler(mockRequest(session), h)

    expect(response.vm.developmentInfo).toContain('reg-dev-1')
  })

  it('renders text alerts and stores alert type in session', async () => {
    const h = mockH()
    const session = {}

    const response = await getTextAlertsController.handler(
      mockRequest(session),
      h
    )

    expect(response.tpl).toBe('notify-register/text-alerts')
    expect(session.alertType).toBe('text')
  })

  it('renders email alerts and stores alert type in session', async () => {
    const h = mockH()
    const session = {}

    const response = await getEmailAlertsController.handler(
      mockRequest(session),
      h
    )

    expect(response.tpl).toBe('notify-register/email-alerts')
    expect(session.alertType).toBe('email')
  })

  it('redirects POST text alerts to confirm mobile', async () => {
    const h = mockH()
    const response = await postTextAlertsController.handler(mockRequest(), h)

    expect(response.redirect).toBe('/notify/confirm-mobile')
    expect(response.statusCode).toBe(REDIRECT_STATUS_CODE)
  })
})
