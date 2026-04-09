import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  handleUnsubscribeEmailLinkRequest,
  handleUnsubscribeEmailLinkPost
} from './controller.js'

vi.mock('../../../common/services/notify.js', () => ({
  unsubscribeEmailAlert: vi.fn()
}))

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

vi.mock('../../register/helpers/resolve-notify-language.js', () => ({
  resolveNotifyLanguage: vi.fn(() => 'en')
}))

const { unsubscribeEmailAlert } = await import(
  '../../../common/services/notify.js'
)

const mockH = () => ({
  view: vi.fn((tpl, vm) => ({ tpl, vm })),
  redirect: vi.fn((location) => ({ redirect: location }))
})

const mockRequest = ({ query = {}, session = {} } = {}) => ({
  query,
  path: '/notify/unsubscribe-email-link',
  yar: {
    get: vi.fn((key) => session[key]),
    set: vi.fn((key, value) => {
      session[key] = value
    })
  }
})

const VIEW_PATH = 'notify/unsubscribe/unsubscribe-email-link/index'

describe('unsubscribe-email-link/controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleUnsubscribeEmailLinkRequest (GET)', () => {
    it('renders the page with email from query string', () => {
      const h = mockH()
      const session = {}
      const request = mockRequest({
        query: { email: 'user@example.com' },
        session
      })

      const response = handleUnsubscribeEmailLinkRequest(request, h)

      expect(response.tpl).toBe(VIEW_PATH)
      expect(response.vm.email).toBe('user@example.com')
    })

    it('stores email from query string in session', () => {
      const session = {}
      const request = mockRequest({
        query: { email: 'user@example.com' },
        session
      })

      handleUnsubscribeEmailLinkRequest(request, mockH())

      expect(session.unsubscribeEmail).toBe('user@example.com')
    })

    it('falls back to session email when no query param', () => {
      const h = mockH()
      const session = { unsubscribeEmail: 'session@example.com' }
      const request = mockRequest({ query: {}, session })

      const response = handleUnsubscribeEmailLinkRequest(request, h)

      expect(response.tpl).toBe(VIEW_PATH)
      expect(response.vm.email).toBe('session@example.com')
    })

    it('renders with empty email when neither query nor session has one', () => {
      const h = mockH()
      const request = mockRequest({ query: {}, session: {} })

      const response = handleUnsubscribeEmailLinkRequest(request, h)

      expect(response.tpl).toBe(VIEW_PATH)
      expect(response.vm.email).toBe('')
    })

    it('renders page with correct content keys', () => {
      const h = mockH()
      const request = mockRequest({
        query: { email: 'user@example.com' },
        session: {}
      })

      const response = handleUnsubscribeEmailLinkRequest(request, h)

      expect(response.vm.content.heading).toBe(
        'Confirm you want to unsubscribe'
      )
      expect(response.vm.content.confirmButton).toBe('Yes, unsubscribe')
      expect(response.vm.content.cancelLink).toBe('No, keep email alerts')
    })

    it('includes metaSiteUrl and currentPath in view model', () => {
      const h = mockH()
      const request = mockRequest({ query: {}, session: {} })

      const response = handleUnsubscribeEmailLinkRequest(request, h)

      expect(response.vm.metaSiteUrl).toBe('https://example.test')
      expect(response.vm.currentPath).toBe('/notify/unsubscribe-email-link')
    })
  })

  describe('handleUnsubscribeEmailLinkPost (POST)', () => {
    beforeEach(() => {
      unsubscribeEmailAlert.mockResolvedValue({ ok: true })
    })

    it('calls unsubscribeEmailAlert with email from session', async () => {
      const session = { unsubscribeEmail: 'user@example.com' }
      const request = mockRequest({ session })

      await handleUnsubscribeEmailLinkPost(request, mockH())

      expect(unsubscribeEmailAlert).toHaveBeenCalledWith(
        'user@example.com',
        request
      )
    })

    it('redirects to unsubscribe success page on backend success', async () => {
      const h = mockH()
      const session = { unsubscribeEmail: 'user@example.com' }
      const request = mockRequest({ session })

      const response = await handleUnsubscribeEmailLinkPost(request, h)

      expect(response.redirect).toBe('/notify/unsubscribe-success')
    })

    it('redirects to success even when backend DELETE fails', async () => {
      unsubscribeEmailAlert.mockResolvedValue({ ok: false, status: 500 })
      const h = mockH()
      const session = { unsubscribeEmail: 'user@example.com' }
      const request = mockRequest({ session })

      const response = await handleUnsubscribeEmailLinkPost(request, h)

      expect(response.redirect).toBe('/notify/unsubscribe-success')
    })

    it('redirects to success when session email is missing', async () => {
      const h = mockH()
      const request = mockRequest({ session: {} })

      const response = await handleUnsubscribeEmailLinkPost(request, h)

      expect(response.redirect).toBe('/notify/unsubscribe-success')
    })
  })
})
