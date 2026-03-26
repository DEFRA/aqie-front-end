import { describe, it, expect, vi } from 'vitest'
import {
  handleEmailDetailsRequest,
  handleEmailDetailsPost
} from './controller.js'
import { config } from '../../../../config/index.js'
import { generateEmailLink } from '../../../common/services/notify.js'
import { recordEmailCapture } from '../../../common/services/subscription.js'

// '' Mock notify service so unit tests never make real HTTP calls
vi.mock('../../../common/services/notify.js', () => ({
  generateEmailLink: vi.fn().mockResolvedValue({ ok: true })
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
    generateEmailLink.mockResolvedValueOnce({ ok: true })
    const res = await handleEmailDetailsPost(req, h)
    expect(res.redirect).toBe(config.get('notify.emailVerifyEmailPath'))
    expect(session.emailAddress).toBe('user@example.com')
  })

  it('POST shows error when email send is skipped/failed', async () => {
    const session = {}
    const req = mockRequest({ notifyByEmail: 'user@example.com' }, session)
    const h = mockH()
    generateEmailLink.mockResolvedValueOnce({ skipped: true })

    const res = await handleEmailDetailsPost(req, h)

    expect(res.tpl).toBe('notify/register/email-details/index')
    expect(res.vm.error).toBeTruthy()
    expect(res.vm.error.message).toContain('could not send the email')
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

  it('GET persists query location, coordinates and locationId in session', () => {
    const session = {}
    const req = mockRequest({}, session)
    req.query = {
      location: 'Air Quality in Leeds',
      lat: '53.800755',
      long: '-1.549077',
      locationId: 'E08000035'
    }
    const h = mockH()

    handleEmailDetailsRequest(req, h)

    expect(session.location).toBe('Leeds')
    expect(session.latitude).toBe(53.800755)
    expect(session.longitude).toBe(-1.549077)
    expect(session.locationId).toBe('E08000035')
  })

  it('GET falls back to english email-enter copy when custom content is incomplete', () => {
    const req = mockRequest()
    const h = mockH()
    const partialContent = {
      emailDetails: {
        heading: 'Custom heading'
      }
    }

    const res = handleEmailDetailsRequest(req, h, partialContent)

    expect(res.tpl).toBe('notify/register/email-details/index')
    expect(res.vm.heading).toBe('What is your email address?')
    expect(res.vm.pageTitle).toContain('What is your email address?')
    expect(res.vm.error).toBeUndefined()
  })

  it('POST continues when capture is skipped or fails', async () => {
    const session = {}
    const req = mockRequest({ notifyByEmail: 'user@example.com' }, session)
    const h = mockH()

    recordEmailCapture.mockResolvedValueOnce({ skipped: true })
    generateEmailLink.mockResolvedValueOnce({ ok: true })

    const res = await handleEmailDetailsPost(req, h)
    expect(res.redirect).toBe(config.get('notify.emailVerifyEmailPath'))

    recordEmailCapture.mockResolvedValueOnce({ status: 500 })
    generateEmailLink.mockResolvedValueOnce({ ok: true })

    const res2 = await handleEmailDetailsPost(req, h)
    expect(res2.redirect).toBe(config.get('notify.emailVerifyEmailPath'))
  })

  it('POST shows send failure when notify send throws', async () => {
    const session = {}
    const req = mockRequest({ notifyByEmail: 'user@example.com' }, session)
    const h = mockH()

    generateEmailLink.mockRejectedValueOnce(new Error('notify down'))

    const res = await handleEmailDetailsPost(req, h)

    expect(res.tpl).toBe('notify/register/email-details/index')
    expect(res.vm.error).toBeTruthy()
    expect(res.vm.error.message).toContain('could not send the email')
  })

  it('GET returns generic error page when session get throws', () => {
    const req = {
      payload: {},
      query: {},
      yar: {
        get: () => {
          throw new Error('session read failed')
        },
        set: () => {},
        clear: () => {}
      }
    }
    const h = mockH()

    const res = handleEmailDetailsRequest(req, h)

    expect(res.tpl).toBe('notify/register/email-details/index')
    expect(res.vm.error).toBeTruthy()
    expect(res.vm.error.message).toContain('problem loading the page')
  })

  it('POST returns validation error when payload value is invalid type', async () => {
    const req = mockRequest({ notifyByEmail: {} })
    const h = mockH()

    const res = await handleEmailDetailsPost(req, h)

    expect(res.tpl).toBe('notify/register/email-details/index')
    expect(res.vm.error).toBeTruthy()
    expect(res.vm.error.message).toContain(
      'Enter an email address in the correct format'
    )
  })
})
