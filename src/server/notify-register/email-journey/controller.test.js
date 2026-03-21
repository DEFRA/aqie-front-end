import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getEnterEmailController,
  postEnterEmailController
} from './controller.js'
import { validateEmail } from '../../common/helpers/validate-email.js'
import { REDIRECT_STATUS_CODE } from '../../data/constants.js'

vi.mock('../../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => 'https://example.test')
}))

vi.mock('../../common/helpers/validate-email.js', () => ({
  validateEmail: vi.fn()
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

const mockRequest = (payload = {}, session = {}) => ({
  payload,
  yar: {
    get: vi.fn((key) => session[key]),
    set: vi.fn((key, value) => {
      session[key] = value
    })
  }
})

describe('notify-register/email-journey/controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders enter email page', async () => {
    const response = await getEnterEmailController.handler(
      mockRequest(),
      mockH()
    )

    expect(response.tpl).toBe('notify-register/email-journey/enter-email')
    expect(response.vm.heading).toBeTruthy()
  })

  it('re-renders with validation error for invalid email', async () => {
    validateEmail.mockReturnValueOnce({
      isValid: false,
      error: 'Enter an email address in the correct format'
    })

    const response = await postEnterEmailController.handler(
      mockRequest({ notifyByEmail: 'bad-email' }),
      mockH()
    )

    expect(response.tpl).toBe('notify-register/email-journey/enter-email')
    expect(response.vm.pageTitle).toContain('Error:')
    expect(response.vm.error.text).toContain('correct format')
  })

  it('stores formatted email and redirects when valid', async () => {
    const session = {}
    validateEmail.mockReturnValueOnce({
      isValid: true,
      formatted: 'user@example.com'
    })

    const response = await postEnterEmailController.handler(
      mockRequest({ notifyByEmail: 'USER@EXAMPLE.COM' }, session),
      mockH()
    )

    expect(session.emailAddress).toBe('user@example.com')
    expect(response.redirect).toBe('/notify/confirm-email')
    expect(response.statusCode).toBe(REDIRECT_STATUS_CODE)
  })
})
