import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleEmailDuplicateRequest } from './controller.js'

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

const mockH = () => ({
  view: vi.fn((tpl, vm) => ({ tpl, vm }))
})

const mockRequest = (session = {}) => ({
  path: '/notify/register/email-duplicate',
  yar: {
    get: vi.fn((key) => session[key]),
    set: vi.fn((key, value) => {
      session[key] = value
    })
  }
})

describe('email-duplicate/controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets notificationFlow to email when missing', () => {
    const session = { location: 'Leeds', emailAddress: 'user@example.com' }
    const response = handleEmailDuplicateRequest(mockRequest(session), mockH())

    expect(session.notificationFlow).toBe('email')
    expect(response.tpl).toBe('notify/register/email-duplicate/index')
  })

  it('renders duplicate page with fallback values when session data missing', () => {
    const response = handleEmailDuplicateRequest(mockRequest({}), mockH())

    expect(response.tpl).toBe('notify/register/email-duplicate/index')
    expect(response.vm.location).toBe('this location')
    expect(response.vm.emailAddress).toBe('your email address')
  })

  it('wraps location and email address in bold tags in the description', () => {
    const session = { location: 'Leeds', emailAddress: 'user@example.com' }
    const response = handleEmailDuplicateRequest(mockRequest(session), mockH())

    expect(response.vm.content.description).toContain('<b>Leeds</b>')
    expect(response.vm.content.description).toContain('<b>user@example.com</b>')
  })

  it('shows a back button with javascript:history.back()', () => {
    const session = { location: 'Leeds', emailAddress: 'user@example.com' }
    const response = handleEmailDuplicateRequest(mockRequest(session), mockH())

    expect(response.vm.displayBacklink).toBe(true)
    expect(response.vm.customBackLink).toBe(true)
    expect(response.vm.backLinkUrl).toBe('javascript:history.back()')
    expect(response.vm.backLinkText).toBe('Back')
  })
})
