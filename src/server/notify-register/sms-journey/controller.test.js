import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getMobilePhoneController,
  postMobilePhoneController,
  getConfirmMobileController,
  postConfirmMobileController,
  getActivationCodeController,
  postActivationCodeController
} from './controller.js'
import { notifyService } from '../../../helpers/notify-service.js'
import { REDIRECT_STATUS_CODE } from '../../data/constants.js'

vi.mock('../../../helpers/notify-service.js', () => ({
  notifyService: {
    generateActivationCode: vi.fn(() => '12345'),
    sendActivationCode: vi.fn()
  }
}))

vi.mock('../../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => 'https://example.test')
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

const mockRequest = ({ payload = {}, query = {}, session = {} } = {}) => ({
  payload,
  query,
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

describe('notify-register/sms-journey/controller', () => {
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NODE_ENV = 'test'
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  it('renders mobile phone page', async () => {
    const response = await getMobilePhoneController.handler(
      mockRequest(),
      mockH()
    )
    expect(response.tpl).toBe('notify-register/mobile-phone')
  })

  it('redirects POST mobile phone to confirm mobile', async () => {
    const response = await postMobilePhoneController.handler(
      mockRequest(),
      mockH()
    )
    expect(response.redirect).toBe('/notify/confirm-mobile')
    expect(response.statusCode).toBe(REDIRECT_STATUS_CODE)
  })

  it('renders confirm mobile page', async () => {
    const response = await getConfirmMobileController.handler(
      mockRequest(),
      mockH()
    )
    expect(response.tpl).toBe('notify-register/confirm-mobile')
    expect(response.vm.mobilePhone).toBe('07123456789')
  })

  it('sends activation code and redirects to activation page', async () => {
    const session = {}
    const request = mockRequest({
      payload: { mobilePhone: '07712345678' },
      session
    })
    notifyService.sendActivationCode.mockResolvedValueOnce({
      success: true,
      notificationId: 'notif-1'
    })

    const response = await postConfirmMobileController.handler(request, mockH())

    expect(notifyService.sendActivationCode).toHaveBeenCalledWith(
      '07712345678',
      '12345'
    )
    expect(response.redirect).toBe('/notify/activation-code')
    expect(response.statusCode).toBe(REDIRECT_STATUS_CODE)
    expect(session.notificationId).toBe('notif-1')
  })

  it('uses development fallback when send fails in development', async () => {
    process.env.NODE_ENV = 'development'
    const session = {}
    const request = mockRequest({
      payload: { mobilePhone: '07712345678' },
      session
    })
    notifyService.sendActivationCode.mockResolvedValueOnce({ success: false })

    const response = await postConfirmMobileController.handler(request, mockH())

    expect(response.redirect).toBe('/notify/activation-code')
    expect(response.statusCode).toBe(REDIRECT_STATUS_CODE)
    expect(session.isDevelopmentFallback).toBe(true)
    expect(session.activationCode).toBe('12345')
  })

  it('returns error page when send fails in production', async () => {
    process.env.NODE_ENV = 'production'
    const request = mockRequest({ payload: { mobilePhone: '07712345678' } })
    notifyService.sendActivationCode.mockRejectedValueOnce(new Error('down'))

    const response = await postConfirmMobileController.handler(request, mockH())

    expect(response.tpl).toBe('notify-register/error')
    expect(response.statusCode).toBe(500)
  })

  it('renders activation code page with development hint', async () => {
    process.env.NODE_ENV = 'development'
    const request = mockRequest({ session: { activationCode: '22222' } })

    const response = await getActivationCodeController.handler(request, mockH())

    expect(response.tpl).toBe('notify-register/activation-code')
    expect(response.vm.developmentHint).toContain('22222')
  })

  it('renders activation code page with fallback hint', async () => {
    const request = mockRequest({
      session: { isDevelopmentFallback: true, activationCode: '33333' }
    })

    const response = await getActivationCodeController.handler(request, mockH())

    expect(response.vm.developmentHint).toContain(
      'API Error - Development fallback'
    )
  })

  it('shows error when activation code is blank', async () => {
    const request = mockRequest({ payload: { activationCode: '   ' } })

    const response = await postActivationCodeController.handler(
      request,
      mockH()
    )

    expect(response.tpl).toBe('notify-register/activation-code')
    expect(response.vm.error.text).toBeTruthy()
  })

  it('shows expiry error when activation code is too old', async () => {
    const request = mockRequest({
      payload: { activationCode: '12345' },
      session: {
        activationCode: '12345',
        activationCodeTimestamp: Date.now() - 1000 * 60 * 20
      }
    })

    const response = await postActivationCodeController.handler(
      request,
      mockH()
    )

    expect(response.tpl).toBe('notify-register/activation-code')
    expect(response.vm.error.text).toContain('expired')
  })

  it('shows incorrect code error for mismatch', async () => {
    const request = mockRequest({
      payload: { activationCode: '00000' },
      session: {
        activationCode: '12345',
        activationCodeTimestamp: Date.now()
      }
    })

    const response = await postActivationCodeController.handler(
      request,
      mockH()
    )

    expect(response.tpl).toBe('notify-register/activation-code')
    expect(response.vm.error.text).toContain('correct activation code')
  })

  it('marks phone as verified and redirects on valid code', async () => {
    const session = {
      activationCode: '12345',
      activationCodeTimestamp: Date.now(),
      mobileNumber: '07712345678'
    }
    const request = mockRequest({
      payload: { activationCode: '12345' },
      session
    })

    const response = await postActivationCodeController.handler(
      request,
      mockH()
    )

    expect(session.phoneVerified).toBe(true)
    expect(response.redirect).toBe('/notify/confirm-alert')
    expect(response.statusCode).toBe(REDIRECT_STATUS_CODE)
  })

  it('redirects back to activation code when exception occurs', async () => {
    const request = mockRequest({
      payload: {
        activationCode: {
          trim() {
            throw new Error('bad payload')
          }
        }
      }
    })

    const response = await postActivationCodeController.handler(
      request,
      mockH()
    )

    expect(response.redirect).toBe('/notify/activation-code')
    expect(response.statusCode).toBe(REDIRECT_STATUS_CODE)
  })
})
