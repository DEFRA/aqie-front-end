import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleEmailVerifyRequest } from './controller.js'

const MOCK_VERIFICATION_HEADER = 'x-aqie-email-verification-token'
const MOCK_ENDPOINT_HEADER = 'x-aqie-email-generate-link-endpoint'
const MOCK_VERIFICATION_TOKEN = 'mock-token-123'
const CDP_TEST_HOST = 'aqie-front-end.test.cdp-int.defra.cloud'
const EMAIL_DETAILS_PATH = '/notify/register/email-details'
const EMAIL_SEND_NEW_LINK_PATH = '/notify/register/email-send-new-link'
const SMS_MOBILE_NUMBER_PATH = '/notify/register/sms-mobile-number'
const EMAIL_GENERATE_LINK_PATH = '/subscribe/generate-link'
const EMAIL_VERIFY_VIEW = 'notify/register/email-verify-email/index'
const DEFAULT_EMAIL = 'user@example.com'
const DEFAULT_LOCATION = 'Leeds'

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
      if (key === 'notify.emailDetailsPath') {
        return EMAIL_DETAILS_PATH
      }
      if (key === 'notify.emailSendNewLinkPath') {
        return EMAIL_SEND_NEW_LINK_PATH
      }
      if (key === 'notify.smsMobileNumberPath') {
        return SMS_MOBILE_NUMBER_PATH
      }
      if (key === 'notify.baseUrl') {
        return 'https://aqie-notify-service.dev.cdp-int.defra.cloud'
      }
      if (key === 'notify.emailGenerateLinkPath') {
        return EMAIL_GENERATE_LINK_PATH
      }
      return undefined
    })
  }
}))

const mockH = () => {
  const response = { header: vi.fn() }

  return {
    view: vi.fn((tpl, vm) => {
      response.tpl = tpl
      response.vm = vm
      return response
    }),
    redirect: vi.fn((location) => ({ redirect: location }))
  }
}

const mockRequest = (session = {}, headers = {}) => ({
  path: '/notify/register/email-verify-email',
  headers,
  yar: {
    get: vi.fn((key) => session[key]),
    set: vi.fn()
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('email-verify-email/controller rendering', () => {
  it('redirects to email details when session email is missing', () => {
    const response = handleEmailVerifyRequest(mockRequest({}), mockH())

    expect(response.redirect).toBe(EMAIL_DETAILS_PATH)
  })

  it('renders verify-email page with session email and location', () => {
    const request = mockRequest({
      emailAddress: DEFAULT_EMAIL,
      location: DEFAULT_LOCATION
    })

    const response = handleEmailVerifyRequest(request, mockH())

    expect(response.tpl).toBe(EMAIL_VERIFY_VIEW)
    expect(response.vm.emailAddress).toBe(DEFAULT_EMAIL)
    expect(response.vm.sentLinkText).toContain(DEFAULT_EMAIL)
    expect(response.vm.confirmLinkText).toContain(DEFAULT_LOCATION)
    expect(response.vm.backLinkUrl).toBe(EMAIL_DETAILS_PATH)
    expect(response.vm.emailDetailsPath).toBe(EMAIL_DETAILS_PATH)
    expect(response.vm.emailSendNewLinkPath).toBe(EMAIL_SEND_NEW_LINK_PATH)
  })

  it('renders verify-email page with empty location fallback', () => {
    const request = mockRequest({
      emailAddress: DEFAULT_EMAIL
    })

    const response = handleEmailVerifyRequest(request, mockH())

    expect(response.tpl).toBe(EMAIL_VERIFY_VIEW)
    expect(response.vm.confirmLinkText).toContain('<strong></strong>')
  })
})

describe('email-verify-email/controller headers', () => {
  it('adds mock verification headers when token exists in session', () => {
    const request = mockRequest({
      emailAddress: DEFAULT_EMAIL,
      location: DEFAULT_LOCATION,
      mockEmailVerificationToken: MOCK_VERIFICATION_TOKEN
    })

    const response = handleEmailVerifyRequest(request, mockH())

    expect(response.header).toHaveBeenCalledWith(
      MOCK_VERIFICATION_HEADER,
      MOCK_VERIFICATION_TOKEN
    )

    const endpointHeaderCall = response.header.mock.calls.find(
      ([name]) => name === MOCK_ENDPOINT_HEADER
    )
    expect(endpointHeaderCall).toBeTruthy()
    expect(endpointHeaderCall[1]).toContain(EMAIL_GENERATE_LINK_PATH)
  })

  it('does not add mock verification headers when token is missing', () => {
    const request = mockRequest({
      emailAddress: DEFAULT_EMAIL,
      location: DEFAULT_LOCATION
    })

    const response = handleEmailVerifyRequest(request, mockH())

    expect(response.header).not.toHaveBeenCalled()
  })

  it('does not emit mock headers in production for non-CDP host', () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    try {
      const request = mockRequest(
        {
          emailAddress: DEFAULT_EMAIL,
          mockEmailVerificationToken: MOCK_VERIFICATION_TOKEN
        },
        { host: 'www.example.com' }
      )

      const response = handleEmailVerifyRequest(request, mockH())
      expect(response.header).not.toHaveBeenCalled()
    } finally {
      process.env.NODE_ENV = originalNodeEnv
    }
  })

  it('emits mock headers in production for CDP test host', () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    try {
      const request = mockRequest(
        {
          emailAddress: DEFAULT_EMAIL,
          mockEmailVerificationToken: MOCK_VERIFICATION_TOKEN
        },
        { host: CDP_TEST_HOST }
      )

      const response = handleEmailVerifyRequest(request, mockH())

      expect(response.header).toHaveBeenCalledWith(
        MOCK_VERIFICATION_HEADER,
        MOCK_VERIFICATION_TOKEN
      )
    } finally {
      process.env.NODE_ENV = originalNodeEnv
    }
  })
})
