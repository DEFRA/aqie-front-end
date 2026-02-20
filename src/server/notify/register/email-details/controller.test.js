import { describe, it, expect } from 'vitest'
import {
  handleEmailDetailsRequest,
  handleEmailDetailsPost
} from './controller.js'
import { config } from '../../../../config/index.js'

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
    yar: {
      get: (k) => session[k],
      set: (k, v) => {
        session[k] = v
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
})
