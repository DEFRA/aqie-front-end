import { describe, test, expect, vi } from 'vitest'
import {
  handleEmailSendActivationRequest,
  handleEmailSendActivationPost
} from './controller.js'

describe('Email Send Activation Controller', () => {
  test('handleEmailSendActivationRequest returns correct view data when email exists', () => {
    const mockRequest = {
      yar: {
        get: vi.fn().mockReturnValue('user@example.com')
      }
    }

    const mockH = {
      view: vi.fn(),
      redirect: vi.fn()
    }

    handleEmailSendActivationRequest(mockRequest, mockH)

    expect(mockRequest.yar.get).toHaveBeenCalledWith('emailAddress')
    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/email-send-activation/index',
      expect.objectContaining({
        emailAddress: 'user@example.com'
      })
    )
    expect(mockH.redirect).not.toHaveBeenCalled()
  })

  test('handleEmailSendActivationRequest redirects when no email in session', () => {
    const mockRequest = {
      yar: {
        get: vi.fn().mockReturnValue('')
      }
    }

    const mockH = {
      view: vi.fn(),
      redirect: vi.fn()
    }

    handleEmailSendActivationRequest(mockRequest, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith(
      '/notify/register/email-details'
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

    await handleEmailSendActivationPost(mockRequest, mockH)

    expect(mockRequest.yar.get).toHaveBeenCalledWith('emailAddress')
    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'emailActivationSent',
      expect.any(Number)
    )
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/notify/register/email-verify-code'
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
      '/notify/register/email-details'
    )
    expect(mockRequest.yar.set).not.toHaveBeenCalled()
  })
})
