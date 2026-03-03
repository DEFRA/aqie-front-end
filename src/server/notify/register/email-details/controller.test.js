import { describe, it, expect, vi } from 'vitest'
import {
  handleEmailDetailsRequest,
  handleEmailDetailsPost
} from './controller.js'
import { config } from '../../../../config/index.js'

// '' Mock notify service so unit tests never make real HTTP calls
vi.mock('../../../common/services/notify.js', () => ({
  generateEmailLink: vi.fn().mockResolvedValue(undefined)
}))

// '' Mock subscription service to avoid real HTTP calls
vi.mock('../../../common/services/subscription.js', () => ({
  recordEmailCapture: vi.fn().mockResolvedValue({ ok: true })
}))

// Simple harness mocks ''
const mockH = () => {
  const h = {}
  h.view = (tpl, vm) => ({ tpl, vm })
  h.redirect = (loc) => ({ redirect: loc })
  return h
}

const mockRequest = (payload = {}, session = {}) => {
  return {
    payload,
    query: {},
    yar: {
      get: (k) => session[k],
      set: (k, v) => {
        session[k] = v
      },
      clear: (k) => {
        delete session[k]
      }
    }
  }
}

describe('email-details controller', () => {
  it('renders GET page with defaults', () => {
    const req = mockRequest()
    const h = mockH()
    const res = handleEmailDetailsRequest(req, h)
    expect(res.tpl).toBe('notify/register/email-details/index')
    expect(res.vm.heading).toContain('email address')
  })

  it('POST validation error when empty', async () => {
    const req = mockRequest({ notifyByEmail: '' })
    const h = mockH()
    const res = await handleEmailDetailsPost(req, h)
    expect(res.tpl).toBe('notify/register/email-details/index')
    expect(res.vm.error).toBeTruthy()
  })

  it('POST success stores email and redirects', async () => {
    const session = {}
    const req = mockRequest({ notifyByEmail: 'user@example.com' }, session)
    const h = mockH()
    const res = await handleEmailDetailsPost(req, h)
    expect(res.redirect).toBe(config.get('notify.emailVerifyEmailPath'))
    expect(session.emailAddress).toBe('user@example.com')
  })

  it('GET shows max-alerts error when session flag is set', () => {
    const session = {
      maxAlertsEmailError: true,
      maxAlertsEmail: 'test@example.com'
    }
    const req = mockRequest({}, session)
    const h = mockH()
    const res = handleEmailDetailsRequest(req, h)
    expect(res.tpl).toBe('notify/register/email-details/index')
    // '' Error flag should be cleared from session after reading
    expect(session.maxAlertsEmailError).toBeUndefined()
    expect(session.maxAlertsEmail).toBeUndefined()
    // '' Summary message should contain the email address
    expect(res.vm.maxAlertsError).toBeTruthy()
    expect(res.vm.maxAlertsError.summary).toContain('test@example.com')
    expect(res.vm.maxAlertsError.field).toBeTruthy()
    // '' Page title should include Error: prefix
    expect(res.vm.pageTitle).toContain('Error:')
  })

  it('GET shows no max-alerts error when session flag is absent', () => {
    const req = mockRequest()
    const h = mockH()
    const res = handleEmailDetailsRequest(req, h)
    expect(res.vm.maxAlertsError).toBeFalsy()
    expect(res.vm.pageTitle).not.toContain('Error:')
  })
})
