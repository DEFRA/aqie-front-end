import { describe, test, expect, vi } from 'vitest'
import {
  handleEmailSendActivationRequest,
  handleEmailSendActivationPost
} from './controller.js'
import { config } from '../../../../config/index.js'
import { generateEmailLink } from '../../../common/services/notify.js'

vi.mock('../../../common/services/notify.js', () => ({
  generateEmailLink: vi.fn()
}))

describe('Email Send Activation Controller', () => {
  test('handleEmailSendActivationRequest redirects when email exists', async () => {
    const mockRequest = {
      yar: {
        get: vi.fn(
          (key) =>
            ({
              emailAddress: 'user@example.com',
              location: 'Test Location',
              latitude: 51.5,
              longitude: -0.12
            })[key]
        ),
        set: vi.fn()
      }
    }

    const mockH = {
      view: vi.fn(),
      redirect: vi.fn()
    }

    generateEmailLink.mockResolvedValue({ ok: true })
    await handleEmailSendActivationRequest(mockRequest, mockH)

    expect(mockRequest.yar.get).toHaveBeenCalledWith('emailAddress')
    expect(generateEmailLink).toHaveBeenCalledWith(
      'user@example.com',
      'Test Location',
      51.5,
      -0.12,
      mockRequest
    )
    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'emailActivationSent',
      expect.any(Number)
    )
    expect(mockH.redirect).toHaveBeenCalledWith(
      config.get('notify.emailVerifyEmailPath')
    )
  })

  test('handleEmailSendActivationRequest redirects when no email in session', async () => {
    const mockRequest = {
      yar: {
        get: vi.fn().mockReturnValue('')
      }
    }

    const mockH = {
      view: vi.fn(),
      redirect: vi.fn()
    }

    await handleEmailSendActivationRequest(mockRequest, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith(
      config.get('notify.emailDetailsPath')
    )
    expect(mockH.view).not.toHaveBeenCalled()
  })

  test('handleEmailSendActivationPost processes valid request and redirects', async () => {
    const mockRequest = {
      yar: {
        get: vi.fn().mockReturnValue('user@example.com'),
        set: vi.fn()
      }
    }

    const mockH = {
      redirect: vi.fn()
    }

    generateEmailLink.mockResolvedValue({ ok: true })
    await handleEmailSendActivationPost(mockRequest, mockH)

    expect(mockRequest.yar.get).toHaveBeenCalledWith('emailAddress')
    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'emailActivationSent',
      expect.any(Number)
    )
    expect(mockH.redirect).toHaveBeenCalledWith(
      config.get('notify.emailVerifyEmailPath')
    )
  })

  test('handleEmailSendActivationPost redirects when no email in session', async () => {
    const mockRequest = {
      yar: {
        get: vi.fn().mockReturnValue(null),
        set: vi.fn()
      }
    }

    const mockH = {
      redirect: vi.fn()
    }

    await handleEmailSendActivationPost(mockRequest, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith(
      config.get('notify.emailDetailsPath')
    )
    expect(mockRequest.yar.set).not.toHaveBeenCalled()
  })
})
