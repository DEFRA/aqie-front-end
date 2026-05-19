import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleEmailConfirmLinkRequest } from './controller.js'

import {
  generateEmailLink,
  validateEmailLink,
  setupEmailAlert
} from '../../../common/services/notify.js'

const ALERTS_SUCCESS_PATH = '/notify/register/alerts-success'
const EMAIL_DUPLICATE_PATH = '/notify/register/email-duplicate'
const EMAIL_DETAILS_PATH = '/notify/register/email-details'
const EMAIL_CONFIRM_VIEW = 'notify/register/email-confirm-link/index'
const CDP_TEST_HOST = 'aqie-front-end.test.cdp-int.defra.cloud'
const CDP_PERF_TEST_HOST = 'aqie-front-end.perf-test.cdp-int.defra.cloud'
const DEFAULT_TOKEN = 'abc123'
const DEFAULT_EMAIL = 'user@example.com'
const MOCK_VERIFICATION_TOKEN = 'mock-verify-123'
const DEFAULT_LOCATION = 'Leeds'
const DEFAULT_LAT = 53.8
const DEFAULT_LONG = -1.5
const YORK_LAT = 53.95
const YORK_LONG = -1.08
const GLOUCESTER_LAT = 51.8668
const GLOUCESTER_LONG = -2.2446

const buildValidTokenData = (overrides = {}) => ({
  emailAddress: DEFAULT_EMAIL,
  location: DEFAULT_LOCATION,
  lat: DEFAULT_LAT,
  long: DEFAULT_LONG,
  ...overrides
})

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
  generateEmailLink: vi.fn(),
  validateEmailLink: vi.fn(),
  setupEmailAlert: vi.fn()
}))

vi.mock('../../../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'notify.alertsSuccessPath') {
        return ALERTS_SUCCESS_PATH
      }
      if (key === 'notify.emailDuplicatePath') {
        return EMAIL_DUPLICATE_PATH
      }
      if (key === 'notify.emailDetailsPath') {
        return EMAIL_DETAILS_PATH
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
  session = {},
  headers = {}
} = {}) => ({
  query,
  path,
  headers,
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

const resetNotifyMocks = () => {
  vi.clearAllMocks()
  generateEmailLink.mockResolvedValue({ ok: true, data: {} })
}

describe('email-confirm-link/controller errors', () => {
  beforeEach(() => {
    resetNotifyMocks()
  })

  it('renders error view when token is missing', async () => {
    const h = mockH()
    const request = mockRequest({ query: {} })

    const response = await handleEmailConfirmLinkRequest(request, h)

    expect(response.tpl).toBe(EMAIL_CONFIRM_VIEW)
    expect(response.vm.errorMessage).toBeTruthy()
    expect(response.vm.content.errorExpiredBody).toBeTruthy()
    expect(response.vm.content.errorSearchLinkText).toBeTruthy()
    expect(response.vm.content.errorSearchLinkSuffix).toBeTruthy()
    expect(validateEmailLink).not.toHaveBeenCalled()
  })

  it('renders invalid token error when validateEmailLink is not ok', async () => {
    validateEmailLink.mockResolvedValueOnce({ ok: false, status: 400 })
    const h = mockH()
    const request = mockRequest({ query: { token: DEFAULT_TOKEN } })

    const response = await handleEmailConfirmLinkRequest(request, h)

    expect(response.tpl).toBe(EMAIL_CONFIRM_VIEW)
    expect(response.vm.errorMessage).toContain('invalid')
  })

  it('renders setup alert error when email missing from token and session', async () => {
    validateEmailLink.mockResolvedValueOnce({ ok: true, data: {} })

    const request = mockRequest({
      query: { token: DEFAULT_TOKEN },
      session: {}
    })
    const response = await handleEmailConfirmLinkRequest(request, mockH())

    expect(response.tpl).toBe(EMAIL_CONFIRM_VIEW)
    expect(response.vm.errorMessage).toContain('finish setting up your alert')
  })

  it('renders invalid token error when validateEmailLink throws invalid_token error', async () => {
    validateEmailLink.mockImplementationOnce(() => {
      const err = new Error('bad token')
      err.code = 'invalid_token'
      throw err
    })

    const response = await handleEmailConfirmLinkRequest(
      mockRequest({ query: { token: DEFAULT_TOKEN } }),
      mockH()
    )

    expect(response.tpl).toBe(EMAIL_CONFIRM_VIEW)
    expect(response.vm.errorMessage).toContain('invalid')
  })
})

describe('email-confirm-link/controller production host override', () => {
  beforeEach(() => {
    resetNotifyMocks()
  })

  it('captures mock token in production for CDP test host', async () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    try {
      validateEmailLink.mockResolvedValueOnce({
        ok: true,
        data: buildValidTokenData()
      })
      setupEmailAlert.mockResolvedValueOnce({ ok: true, status: 201 })
      generateEmailLink.mockResolvedValueOnce({
        ok: true,
        data: { verificationToken: MOCK_VERIFICATION_TOKEN }
      })

      const session = { locationId: 'loc-1' }
      const request = mockRequest({
        query: { token: DEFAULT_TOKEN },
        session,
        headers: { host: CDP_TEST_HOST }
      })

      const response = await handleEmailConfirmLinkRequest(request, mockH())

      expect(response.redirect).toBe(ALERTS_SUCCESS_PATH)
      expect(session.mockEmailVerificationToken).toBe(MOCK_VERIFICATION_TOKEN)
    } finally {
      process.env.NODE_ENV = originalNodeEnv
    }
  })

  it('captures mock token in production for CDP perf-test host', async () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    try {
      validateEmailLink.mockResolvedValueOnce({
        ok: true,
        data: buildValidTokenData()
      })
      setupEmailAlert.mockResolvedValueOnce({ ok: true, status: 201 })
      generateEmailLink.mockResolvedValueOnce({
        ok: true,
        data: { verificationToken: MOCK_VERIFICATION_TOKEN }
      })

      const session = { locationId: 'loc-1' }
      const request = mockRequest({
        query: { token: DEFAULT_TOKEN },
        session,
        headers: { host: CDP_PERF_TEST_HOST }
      })

      const response = await handleEmailConfirmLinkRequest(request, mockH())

      expect(response.redirect).toBe(ALERTS_SUCCESS_PATH)
      expect(session.mockEmailVerificationToken).toBe(MOCK_VERIFICATION_TOKEN)
    } finally {
      process.env.NODE_ENV = originalNodeEnv
    }
  })
})

describe('email-confirm-link/controller success redirect flow', () => {
  beforeEach(() => {
    resetNotifyMocks()
  })

  it('redirects to success when setupEmailAlert succeeds', async () => {
    validateEmailLink.mockResolvedValueOnce({
      ok: true,
      data: buildValidTokenData()
    })
    setupEmailAlert.mockResolvedValueOnce({ ok: true, status: 201 })
    generateEmailLink.mockResolvedValueOnce({
      ok: true,
      data: { verificationToken: MOCK_VERIFICATION_TOKEN }
    })

    const h = mockH()
    const session = { locationId: 'loc-1' }
    const request = mockRequest({ query: { token: DEFAULT_TOKEN }, session })

    const response = await handleEmailConfirmLinkRequest(request, h)

    expect(response.redirect).toBe(ALERTS_SUCCESS_PATH)
    expect(session.notificationFlow).toBe('email')
    expect(session.emailAddress).toBe(DEFAULT_EMAIL)
    expect(session.emailLinkToken).toBe(DEFAULT_TOKEN)
    expect(session.emailVerificationToken).toBeUndefined()
    expect(session.mockEmailVerificationToken).toBe(MOCK_VERIFICATION_TOKEN)
    expect(generateEmailLink).toHaveBeenCalledWith(
      DEFAULT_EMAIL,
      DEFAULT_LOCATION,
      DEFAULT_LAT,
      DEFAULT_LONG,
      request
    )
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
      latitude: YORK_LAT,
      longitude: YORK_LONG
    }
    const request = mockRequest({ query: { token: DEFAULT_TOKEN }, session })
    const response = await handleEmailConfirmLinkRequest(request, mockH())

    expect(setupEmailAlert).toHaveBeenCalledWith(
      'session@example.com',
      'York',
      'loc-2',
      YORK_LAT,
      YORK_LONG,
      'en',
      request
    )
    expect(response.redirect).toBe(ALERTS_SUCCESS_PATH)
  })

  it('keeps mock verification token optional when generate-link response has no token', async () => {
    validateEmailLink.mockResolvedValueOnce({
      ok: true,
      data: buildValidTokenData()
    })
    setupEmailAlert.mockResolvedValueOnce({ ok: true, status: 201 })
    generateEmailLink.mockResolvedValueOnce({ ok: true, data: {} })

    const session = { mockEmailVerificationToken: 'stale-token' }
    const request = mockRequest({ query: { token: DEFAULT_TOKEN }, session })

    const response = await handleEmailConfirmLinkRequest(request, mockH())

    expect(response.redirect).toBe(ALERTS_SUCCESS_PATH)
    expect(session.mockEmailVerificationToken).toBeUndefined()
  })
})

describe('email-confirm-link/controller setup result branches', () => {
  beforeEach(() => {
    resetNotifyMocks()
  })

  it('redirects to duplicate page on setupEmailAlert 409', async () => {
    validateEmailLink.mockResolvedValueOnce({
      ok: true,
      data: buildValidTokenData({ lat: null, long: null })
    })
    setupEmailAlert.mockResolvedValueOnce({ ok: false, status: 409, body: {} })

    const request = mockRequest({
      query: { token: DEFAULT_TOKEN },
      session: {}
    })
    const response = await handleEmailConfirmLinkRequest(request, mockH())

    expect(response.redirect).toBe(EMAIL_DUPLICATE_PATH)
  })

  it('redirects back to email details with max alert flags on non-409 setup failure', async () => {
    validateEmailLink.mockResolvedValueOnce({
      ok: true,
      data: buildValidTokenData({ lat: null, long: null })
    })
    setupEmailAlert.mockResolvedValueOnce({ ok: false, status: 500, body: {} })

    const session = {}
    const request = mockRequest({ query: { token: DEFAULT_TOKEN }, session })
    const response = await handleEmailConfirmLinkRequest(request, mockH())

    expect(response.redirect).toBe(EMAIL_DETAILS_PATH)
    expect(session.maxAlertsEmailError).toBe(true)
    expect(session.maxAlertsEmail).toBe(DEFAULT_EMAIL)
  })

  it('redirects to success when setupEmailAlert is skipped', async () => {
    validateEmailLink.mockResolvedValueOnce({
      ok: true,
      data: buildValidTokenData({ lat: null, long: null })
    })
    setupEmailAlert.mockResolvedValueOnce({ skipped: true })

    const session = {}
    const request = mockRequest({ query: { token: DEFAULT_TOKEN }, session })
    const response = await handleEmailConfirmLinkRequest(request, mockH())

    expect(response.redirect).toBe(ALERTS_SUCCESS_PATH)
    expect(session.notificationFlow).toBe('email')
    expect(generateEmailLink).toHaveBeenCalled()
  })

  it('restores session from expired token body so request-new-link uses correct location', async () => {
    validateEmailLink.mockResolvedValueOnce({
      ok: false,
      status: 410,
      body: {
        emailAddress: DEFAULT_EMAIL,
        location: 'Gloucester, Gloucester',
        lat: GLOUCESTER_LAT,
        long: GLOUCESTER_LONG
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

    expect(response.tpl).toBe(EMAIL_CONFIRM_VIEW)
    expect(session.emailAddress).toBe(DEFAULT_EMAIL)
    expect(session.location).toBe('Gloucester, Gloucester')
    expect(session.latitude).toBe(GLOUCESTER_LAT)
    expect(session.longitude).toBe(GLOUCESTER_LONG)
  })
})
