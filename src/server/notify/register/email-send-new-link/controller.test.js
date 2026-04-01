// Tests for Email send new link controller ''
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  handleEmailSendNewLinkRequest,
  handleEmailSendNewLinkPost
} from './controller.js'
import { generateEmailLink } from '../../../common/services/notify.js'

const VIEW_PATH = 'notify/register/email-send-new-link/index'

vi.mock('../../../common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  })
}))

vi.mock('../../../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => 'http://localhost:3000')
}))

vi.mock('../../../common/services/notify.js', () => ({
  generateEmailLink: vi.fn(() => Promise.resolve({ ok: true }))
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
      if (key === 'notify.emailVerifyEmailPath') {
        return '/notify/register/email-verify-email'
      }
      return undefined
    })
  }
}))

const mockH = () => ({
  view: vi.fn((tpl, vm) => ({ tpl, vm })),
  redirect: vi.fn((location) => ({ redirect: location }))
})

const mockRequest = (session = {}, payload = {}) => ({
  path: '/notify/register/email-send-new-link',
  payload,
  yar: {
    get: vi.fn((key) => session[key] ?? null),
    set: vi.fn(),
    clear: vi.fn()
  }
})

describe('email-send-new-link/controller - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to email-details when no email in session', () => {
    const response = handleEmailSendNewLinkRequest(mockRequest({}), mockH())
    expect(response.redirect).toBe('/notify/register/email-details')
  })

  it('renders the page when email is in session', () => {
    const request = mockRequest({ emailAddress: 'user@example.com' })
    const response = handleEmailSendNewLinkRequest(request, mockH())
    expect(response.tpl).toBe(VIEW_PATH)
    expect(response.vm.content.heading).toBe('Request a new activation link')
    expect(response.vm.bulletSameEmail).toContain('user@example.com')
  })

  it('includes back link to email-verify-email', () => {
    const request = mockRequest({ emailAddress: 'user@example.com' })
    const response = handleEmailSendNewLinkRequest(request, mockH())
    expect(response.vm.backLinkUrl).toBe('/notify/register/email-verify-email')
  })
})

describe('email-send-new-link/controller - POST', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to email-details when no email in session or payload', async () => {
    const request = mockRequest({}, { emailNew: '' })
    const response = await handleEmailSendNewLinkPost(request, mockH())
    expect(response.redirect).toBe('/notify/register/email-details')
  })

  it('sends link using session email and redirects to verify-email', async () => {
    const request = mockRequest(
      { emailAddress: 'user@example.com', location: 'Bristol' },
      { emailNew: '' }
    )
    const response = await handleEmailSendNewLinkPost(request, mockH())
    expect(generateEmailLink).toHaveBeenCalledWith(
      'user@example.com',
      'Bristol',
      null,
      null,
      request
    )
    expect(response.redirect).toBe('/notify/register/email-verify-email')
  })

  it('validates and uses new email from payload', async () => {
    const request = mockRequest(
      { emailAddress: 'old@example.com', location: 'Leeds' },
      { emailNew: 'new@example.com' }
    )
    const response = await handleEmailSendNewLinkPost(request, mockH())
    expect(request.yar.set).toHaveBeenCalledWith(
      'emailAddress',
      'new@example.com'
    )
    expect(generateEmailLink).toHaveBeenCalledWith(
      'new@example.com',
      'Leeds',
      null,
      null,
      request
    )
    expect(response.redirect).toBe('/notify/register/email-verify-email')
  })

  it('renders error when invalid email submitted', async () => {
    const request = mockRequest(
      { emailAddress: 'user@example.com' },
      { emailNew: 'not-an-email' }
    )
    const response = await handleEmailSendNewLinkPost(request, mockH())
    expect(response.tpl).toBe(VIEW_PATH)
    expect(response.vm.error).toBeDefined()
    expect(response.vm.error.field).toBe('emailNew')
  })

  it('still redirects when generateEmailLink throws', async () => {
    generateEmailLink.mockRejectedValueOnce(new Error('network error'))
    const request = mockRequest(
      { emailAddress: 'user@example.com' },
      { emailNew: '' }
    )
    const response = await handleEmailSendNewLinkPost(request, mockH())
    expect(response.redirect).toBe('/notify/register/email-verify-email')
  })
})
