import { describe, test, expect, vi } from 'vitest'
import { sendSmsCode } from '../../../common/services/notify.js'
import {
  handleSendActivationRequest,
  handleSendActivationPost
} from './controller.js'

vi.mock('../../../common/services/notify.js', () => ({
  sendSmsCode: vi.fn()
}))

describe('SMS Send Activation Controller', () => {
  test('handleSendActivationRequest returns correct view data when mobile number exists', () => {
    const mockRequest = {
      yar: {
        get: vi.fn().mockReturnValue('07123456789')
      }
    }

    const mockH = {
      view: vi.fn(),
      redirect: vi.fn()
    }

    handleSendActivationRequest(mockRequest, mockH)

    expect(mockRequest.yar.get).toHaveBeenCalledWith('mobileNumber')
    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/sms-send-activation/index',
      expect.objectContaining({
        mobileNumber: '07123456789'
      })
    )
    expect(mockH.redirect).not.toHaveBeenCalled()
  })

  test('handleSendActivationRequest redirects when no mobile number in session', () => {
    const mockRequest = {
      yar: {
        get: vi.fn().mockReturnValue('')
      }
    }

    const mockH = {
      view: vi.fn(),
      redirect: vi.fn()
    }

    handleSendActivationRequest(mockRequest, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith(
      '/notify/register/sms-mobile-number'
    )
    expect(mockH.view).not.toHaveBeenCalled()
  })

  test('handleSendActivationPost processes valid request and redirects', async () => {
    sendSmsCode.mockResolvedValue({ ok: true })

    const mockRequest = {
      yar: {
        get: vi.fn((key) => {
          if (key === 'mobileNumber') {
            return '07123456789'
          }
          return ''
        }),
        set: vi.fn()
      }
    }

    const mockH = {
      redirect: vi.fn()
    }

    await handleSendActivationPost(mockRequest, mockH)

    expect(mockRequest.yar.get).toHaveBeenCalledWith('mobileNumber')
    expect(sendSmsCode).toHaveBeenCalledWith('07123456789', mockRequest)
    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'activationSent',
      expect.any(Number)
    )
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/notify/register/sms-verify-code'
    )
  })

  test('handleSendActivationPost redirects when no mobile number in session', async () => {
    const mockRequest = {
      yar: {
        get: vi.fn().mockReturnValue(null),
        set: vi.fn()
      }
    }

    const mockH = {
      redirect: vi.fn()
    }

    await handleSendActivationPost(mockRequest, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith(
      '/notify/register/sms-mobile-number'
    )
    expect(mockRequest.yar.set).not.toHaveBeenCalled()
  })

  test('handleSendActivationPost renders error view when SMS send fails', async () => {
    sendSmsCode.mockResolvedValue({ ok: false, status: 403 })

    const mockRequest = {
      path: '/notify/register/sms-send-activation',
      yar: {
        get: vi.fn((key) => {
          if (key === 'mobileNumber') {
            return '07123456789'
          }
          return ''
        }),
        set: vi.fn()
      }
    }

    const mockH = {
      redirect: vi.fn(),
      view: vi.fn()
    }

    await handleSendActivationPost(mockRequest, mockH)

    expect(mockH.redirect).not.toHaveBeenCalled()
    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/sms-send-activation/index',
      expect.objectContaining({
        error: {
          message: expect.stringContaining(
            'could not send your activation code'
          )
        }
      })
    )
  })

  test('handleSendActivationRequest renders empty body text when template bodyText is missing', () => {
    const mockRequest = {
      path: '/notify/register/sms-send-activation',
      yar: {
        get: vi.fn((key) => {
          if (key === 'mobileNumber') {
            return '07123456789'
          }
          return ''
        })
      }
    }

    const mockH = {
      view: vi.fn(),
      redirect: vi.fn()
    }

    const contentWithoutBodyText = {
      footerTxt: {},
      phaseBanner: {},
      cookieBanner: {},
      common: { serviceName: 'Check air quality' },
      smsSendActivation: {
        pageTitle: 'Send activation code',
        heading: 'Send activation code'
      }
    }

    handleSendActivationRequest(mockRequest, mockH, contentWithoutBodyText)

    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/sms-send-activation/index',
      expect.objectContaining({
        bodyText: ''
      })
    )
  })

  test('handleSendActivationPost renders generic error for non-403 backend failure', async () => {
    sendSmsCode.mockResolvedValue({ ok: false, status: 500 })

    const mockRequest = {
      path: '/notify/register/sms-send-activation',
      yar: {
        get: vi.fn((key) => {
          if (key === 'mobileNumber') {
            return '07123456789'
          }
          return ''
        }),
        set: vi.fn()
      }
    }

    const mockH = {
      redirect: vi.fn(),
      view: vi.fn()
    }

    await handleSendActivationPost(mockRequest, mockH)

    expect(mockH.redirect).not.toHaveBeenCalled()
    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/sms-send-activation/index',
      expect.objectContaining({
        error: {
          message: expect.stringContaining(
            'could not send your activation code'
          )
        }
      })
    )
  })

  test('handleSendActivationPost renders error when sendSmsCode is skipped', async () => {
    sendSmsCode.mockResolvedValue({ skipped: true })

    const mockRequest = {
      path: '/notify/register/sms-send-activation',
      yar: {
        get: vi.fn((key) => {
          if (key === 'mobileNumber') {
            return '07123456789'
          }
          return ''
        }),
        set: vi.fn()
      }
    }

    const mockH = {
      redirect: vi.fn(),
      view: vi.fn()
    }

    await handleSendActivationPost(mockRequest, mockH)

    expect(mockH.redirect).not.toHaveBeenCalled()
    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/sms-send-activation/index',
      expect.objectContaining({
        pageTitle: expect.stringContaining('Error:')
      })
    )
  })

  test('handleSendActivationPost redirects when mock OTP mode succeeds', async () => {
    sendSmsCode.mockResolvedValue({
      ok: true,
      mock: true,
      data: { mockOtpCode: '12345' }
    })

    const mockRequest = {
      path: '/notify/register/sms-send-activation',
      yar: {
        get: vi.fn((key) => {
          if (key === 'mobileNumber') {
            return '07123456789'
          }
          return ''
        }),
        set: vi.fn()
      }
    }

    const mockH = {
      redirect: vi.fn(),
      view: vi.fn()
    }

    await handleSendActivationPost(mockRequest, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith(
      '/notify/register/sms-verify-code'
    )
    expect(mockH.view).not.toHaveBeenCalled()
  })

  test('handleSendActivationPost renders error when sendSmsCode throws', async () => {
    sendSmsCode.mockRejectedValue(new Error('network down'))

    const mockRequest = {
      path: '/notify/register/sms-send-activation',
      yar: {
        get: vi.fn((key) => {
          if (key === 'mobileNumber') {
            return '07123456789'
          }
          return ''
        }),
        set: vi.fn()
      }
    }

    const mockH = {
      redirect: vi.fn(),
      view: vi.fn()
    }

    await handleSendActivationPost(mockRequest, mockH)

    expect(mockH.redirect).not.toHaveBeenCalled()
    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/sms-send-activation/index',
      expect.objectContaining({
        pageTitle: expect.stringContaining('Error:')
      })
    )
  })
})
