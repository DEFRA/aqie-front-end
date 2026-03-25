import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleEmailVerifyRequest } from './controller.js'

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
        return '/notify/register/email-details'
      }
      if (key === 'notify.smsMobileNumberPath') {
        return '/notify/register/sms-mobile-number'
      }
      return undefined
    })
  }
}))

const mockH = () => ({
  view: vi.fn((tpl, vm) => ({ tpl, vm })),
  redirect: vi.fn((location) => ({ redirect: location }))
})

const mockRequest = (session = {}) => ({
  path: '/notify/register/email-verify-email',
  yar: {
    get: vi.fn((key) => session[key]),
    set: vi.fn()
  }
})

describe('email-verify-email/controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to email details when session email is missing', () => {
    const response = handleEmailVerifyRequest(mockRequest({}), mockH())

    expect(response.redirect).toBe('/notify/register/email-details')
  })

  it('renders verify-email page with session email and location', () => {
    const request = mockRequest({
      emailAddress: 'user@example.com',
      location: 'Leeds'
    })

    const response = handleEmailVerifyRequest(request, mockH())

    expect(response.tpl).toBe('notify/register/email-verify-email/index')
    expect(response.vm.emailAddress).toBe('user@example.com')
    expect(response.vm.sentLinkText).toContain('user@example.com')
    expect(response.vm.confirmLinkText).toContain('Leeds')
    expect(response.vm.backLinkUrl).toBe('/notify/register/email-details')
    expect(response.vm.emailDetailsPath).toBe('/notify/register/email-details')
  })

  it('renders verify-email page with empty location fallback', () => {
    const request = mockRequest({
      emailAddress: 'user@example.com'
    })

    const response = handleEmailVerifyRequest(request, mockH())

    expect(response.tpl).toBe('notify/register/email-verify-email/index')
    expect(response.vm.confirmLinkText).toContain('<strong></strong>')
  })
})
