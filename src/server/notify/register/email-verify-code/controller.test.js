import { describe, test, expect, vi } from 'vitest'
import {
  handleEmailVerifyCodeRequest,
  handleEmailVerifyCodePost
} from './controller.js'

describe('Email Verify Code Controller', () => {
  test('GET: redirects if prerequisites missing', () => {
    const mockRequest = {
      yar: { get: vi.fn().mockReturnValueOnce(null).mockReturnValueOnce(null) }
    }
    const mockH = { redirect: vi.fn(), view: vi.fn() }
    handleEmailVerifyCodeRequest(mockRequest, mockH)
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/notify/register/email-details'
    )
  })

  test('GET: renders view when email and token present', () => {
    const mockRequest = {
      yar: {
        get: vi
          .fn()
          .mockReturnValueOnce('user@example.com') // email
          .mockReturnValueOnce('12345') // token
          .mockReturnValue(undefined)
      }
    }
    const mockH = { redirect: vi.fn(), view: vi.fn() }
    handleEmailVerifyCodeRequest(mockRequest, mockH)
    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/email-verify-code/index',
      expect.objectContaining({ emailAddress: 'user@example.com' })
    )
  })

  test('POST: redirects if prerequisites missing', () => {
    const mockRequest = {
      yar: { get: vi.fn().mockReturnValueOnce(null).mockReturnValueOnce(null) }
    }
    const mockH = { redirect: vi.fn(), view: vi.fn() }
    handleEmailVerifyCodePost(mockRequest, mockH)
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/notify/register/email-details'
    )
  })

  test('POST: shows error when empty code submitted', () => {
    const mockRequest = {
      payload: { emailVerifyCode: '' },
      yar: {
        get: vi
          .fn()
          .mockReturnValueOnce('12345') // expected
          .mockReturnValueOnce('user@example.com') // email
      }
    }
    const mockH = { redirect: vi.fn(), view: vi.fn() }
    handleEmailVerifyCodePost(mockRequest, mockH)
    expect(mockH.view).toHaveBeenCalled()
  })

  test('POST: shows error when incorrect code submitted', () => {
    const mockRequest = {
      payload: { emailVerifyCode: '54321' },
      yar: {
        get: vi
          .fn()
          .mockReturnValueOnce('12345') // expected
          .mockReturnValueOnce('user@example.com') // email
      }
    }
    const mockH = { redirect: vi.fn(), view: vi.fn() }
    handleEmailVerifyCodePost(mockRequest, mockH)
    expect(mockH.view).toHaveBeenCalled()
  })

  test('POST: redirects on success', () => {
    const mockRequest = {
      payload: { emailVerifyCode: '12345' },
      yar: {
        get: vi
          .fn()
          .mockReturnValueOnce('12345') // expected
          .mockReturnValueOnce('user@example.com'), // email
        set: vi.fn()
      }
    }
    const mockH = { redirect: vi.fn(), view: vi.fn() }
    handleEmailVerifyCodePost(mockRequest, mockH)
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/notify/register/confirm-alert-details'
    )
  })
})
