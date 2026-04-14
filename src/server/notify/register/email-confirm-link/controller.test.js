import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleEmailConfirmLinkRequest } from './controller.js'

import {
  validateEmailLink,
  setupEmailAlert
} from '../../../common/services/notify.js'

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

vi.mock('../../../common/services/notify.js', () => ({
  validateEmailLink: vi.fn(),
  setupEmailAlert: vi.fn()
}))

vi.mock('../../../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'notify.alertsSuccessPath') {
        return '/notify/register/alerts-success'
      }
      if (key === 'notify.emailDuplicatePath') {
        return '/notify/register/email-duplicate'
      }
      if (key === 'notify.emailDetailsPath') {
        return '/notify/register/email-details'
      }
      return undefined
    })
  }
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

const mockRequest = ({
  query = {},
  path = '/notify/register/email-confirm-link',
  session = {}
} = {}) => ({
  query,
  path,
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

describe('email-confirm-link/controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders error view when token is missing', async () => {
    const h = mockH()
    const request = mockRequest({ query: {} })

    const response = await handleEmailConfirmLinkRequest(request, h)

    expect(response.tpl).toBe('notify/register/email-confirm-link/index')
    expect(response.vm.errorMessage).toBeTruthy()
    expect(response.vm.content.errorExpiredBody).toBeTruthy()
    expect(response.vm.content.errorSearchLinkText).toBeTruthy()
    expect(response.vm.content.errorSearchLinkSuffix).toBeTruthy()
    expect(validateEmailLink).not.toHaveBeenCalled()
  })

  it('renders invalid token error when validateEmailLink is not ok', async () => {
    validateEmailLink.mockResolvedValueOnce({ ok: false, status: 400 })
    const h = mockH()
    const request = mockRequest({ query: { token: 'abc123' } })

    const response = await handleEmailConfirmLinkRequest(request, h)

    expect(response.tpl).toBe('notify/register/email-confirm-link/index')
    expect(response.vm.errorMessage).toContain('invalid')
  })

  it('redirects to success when setupEmailAlert succeeds', async () => {
    validateEmailLink.mockResolvedValueOnce({
      ok: true,
      data: {
        emailAddress: 'user@example.com',
        location: 'Leeds',
        lat: 53.8,
        long: -1.5
      }
    })
    setupEmailAlert.mockResolvedValueOnce({ ok: true, status: 201 })

    const h = mockH()
    const session = { locationId: 'loc-1' }
    const request = mockRequest({ query: { token: 'abc123' }, session })

    const response = await handleEmailConfirmLinkRequest(request, h)

    expect(response.redirect).toBe('/notify/register/alerts-success')
    expect(session.notificationFlow).toBe('email')
    expect(session.emailAddress).toBe('user@example.com')
  })

  it('uses session fallback values when token payload is partial', async () => {
    validateEmailLink.mockResolvedValueOnce({
      ok: true,
      data: {}
    })
    setupEmailAlert.mockResolvedValueOnce({ ok: true, status: 201 })

    const session = {
      emailAddress: 'session@example.com',
      location: 'York',
      locationId: 'loc-2',
      latitude: 53.95,
      longitude: -1.08
    }
    const request = mockRequest({ query: { token: 'abc123' }, session })
    const response = await handleEmailConfirmLinkRequest(request, mockH())

    expect(setupEmailAlert).toHaveBeenCalledWith(
      'session@example.com',
      'York',
      'loc-2',
      53.95,
      -1.08,
      'en',
      request
    )
    expect(response.redirect).toBe('/notify/register/alerts-success')
  })

  it('renders setup alert error when email missing from token and session', async () => {
    validateEmailLink.mockResolvedValueOnce({ ok: true, data: {} })

    const request = mockRequest({ query: { token: 'abc123' }, session: {} })
    const response = await handleEmailConfirmLinkRequest(request, mockH())

    expect(response.tpl).toBe('notify/register/email-confirm-link/index')
    expect(response.vm.errorMessage).toContain('finish setting up your alert')
  })

  it('redirects to duplicate page on setupEmailAlert 409', async () => {
    validateEmailLink.mockResolvedValueOnce({
      ok: true,
      data: { emailAddress: 'user@example.com', location: 'Leeds' }
    })
    setupEmailAlert.mockResolvedValueOnce({ ok: false, status: 409, body: {} })

    const request = mockRequest({ query: { token: 'abc123' }, session: {} })
    const response = await handleEmailConfirmLinkRequest(request, mockH())

    expect(response.redirect).toBe('/notify/register/email-duplicate')
  })

  it('redirects back to email details with max alert flags on non-409 setup failure', async () => {
    validateEmailLink.mockResolvedValueOnce({
      ok: true,
      data: { emailAddress: 'user@example.com', location: 'Leeds' }
    })
    setupEmailAlert.mockResolvedValueOnce({ ok: false, status: 500, body: {} })

    const session = {}
    const request = mockRequest({ query: { token: 'abc123' }, session })
    const response = await handleEmailConfirmLinkRequest(request, mockH())

    expect(response.redirect).toBe('/notify/register/email-details')
    expect(session.maxAlertsEmailError).toBe(true)
    expect(session.maxAlertsEmail).toBe('user@example.com')
  })

  it('redirects to success when setupEmailAlert is skipped', async () => {
    validateEmailLink.mockResolvedValueOnce({
      ok: true,
      data: { emailAddress: 'user@example.com', location: 'Leeds' }
    })
    setupEmailAlert.mockResolvedValueOnce({ skipped: true })

    const session = {}
    const request = mockRequest({ query: { token: 'abc123' }, session })
    const response = await handleEmailConfirmLinkRequest(request, mockH())

    expect(response.redirect).toBe('/notify/register/alerts-success')
    expect(session.notificationFlow).toBe('email')
  })

  it('restores session from expired token body so request-new-link uses correct location', async () => {
    validateEmailLink.mockResolvedValueOnce({
      ok: false,
      status: 410,
      body: {
        emailAddress: 'user@example.com',
        location: 'Gloucester, Gloucester',
        lat: 51.8668,
        long: -2.2446
      }
    })

    const session = {
      emailAddress: 'other@example.com',
      location: 'Bristol',
      latitude: 51.4545,
      longitude: -2.5879
    }
    const request = mockRequest({
      query: { token: 'expired-gloucester-token' },
      session
    })
    const response = await handleEmailConfirmLinkRequest(request, mockH())

    expect(response.tpl).toBe('notify/register/email-confirm-link/index')
    expect(session.emailAddress).toBe('user@example.com')
    expect(session.location).toBe('Gloucester, Gloucester')
    expect(session.latitude).toBe(51.8668)
    expect(session.longitude).toBe(-2.2446)
  })

  it('renders invalid token error when validateEmailLink throws invalid_token error', async () => {
    validateEmailLink.mockImplementationOnce(() => {
      const err = new Error('bad token')
      err.code = 'invalid_token'
      throw err
    })

    const response = await handleEmailConfirmLinkRequest(
      mockRequest({ query: { token: 'abc123' } }),
      mockH()
    )

    expect(response.tpl).toBe('notify/register/email-confirm-link/index')
    expect(response.vm.errorMessage).toContain('invalid')
  })
})
