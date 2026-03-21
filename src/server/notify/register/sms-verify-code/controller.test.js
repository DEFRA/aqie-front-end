// Tests for SMS verify code controller ''
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  handleCheckMessageRequest,
  handleCheckMessagePost
} from './controller.js'
import { verifyOtp } from '../../../common/services/notify.js'

// Mock the logger ''
vi.mock('../../../common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  })
}))

// Mock the site URL helper ''
vi.mock('../../../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => 'http://localhost:3000')
}))

// Mock the notify service ''
vi.mock('../../../common/services/notify.js', () => ({
  verifyOtp: vi.fn(() => Promise.resolve({ ok: true }))
}))

vi.mock('../helpers/resolve-notify-language.js', () => ({
  resolveNotifyLanguage: vi.fn(() => 'en')
}))

// Helper function to create mock get implementation ''
const createMockGetWithMobile = (mobileNumber) => (key) => {
  if (key === 'mobileNumber') {
    return mobileNumber
  }
  if (key === 'formData') {
    return {}
  }
  return null
}

// Helper function for verify test ''
const createMockGetForVerify = (mobileNumber, token) => (k) => {
  if (k === 'mobileNumber') {
    return mobileNumber
  }
  if (k === 'smsVerificationToken') {
    return token
  }
  if (k === 'codeVerified') {
    return false
  }
  if (k === 'otpFailedAttempts') {
    return 0
  }
  return null
}

const createMockGetForFailedVerify =
  (mobileNumber, token, attempts, ts) => (k) => {
    if (k === 'mobileNumber') {
      return mobileNumber
    }
    if (k === 'smsVerificationToken') {
      return token
    }
    if (k === 'codeVerified') {
      return false
    }
    if (k === 'otpFailedAttempts') {
      return attempts
    }
    if (k === 'otpLastFailedTime') {
      return ts
    }
    return null
  }

// Setup helpers ''
const createMockRequest = () => ({
  yar: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn()
  },
  payload: {}
})

const createMockH = () => ({
  view: vi.fn((tpl, vm) => ({ tpl, vm })),
  redirect: vi.fn((location) => ({ redirect: location }))
})

describe('SMS Verify Code Controller - handleCheckMessageRequest', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = createMockRequest()
    mockH = createMockH()
  })

  describe('GET request handler', () => {
    describe('when no mobile number in session', () => {
      it('should redirect to mobile number page', () => {
        // Arrange ''
        mockRequest.yar.get.mockReturnValue(null)

        // Act ''
        handleCheckMessageRequest(mockRequest, mockH)

        // Assert ''
        expect(mockH.redirect).toHaveBeenCalledWith(
          '/notify/register/sms-mobile-number'
        )
      })
    })

    describe('when mobile number exists', () => {
      it('should render the verify code page with mobile number', () => {
        // Arrange ''
        const mobileNumber = '07123456789'
        mockRequest.yar.get.mockImplementation(
          createMockGetWithMobile(mobileNumber)
        )

        // Act ''
        handleCheckMessageRequest(mockRequest, mockH)

        // Assert ''
        expect(mockH.view).toHaveBeenCalledWith(
          'notify/register/sms-verify-code/index',
          expect.objectContaining({
            pageTitle: 'Check your mobile phone - Check air quality - GOV.UK',
            heading: 'Check your mobile phone',
            mobileNumber,
            serviceName: 'Check air quality'
          })
        )
      })

      it('should include all required view model properties', () => {
        // Arrange ''
        const mobileNumber = '07123456789'
        mockRequest.yar.get.mockImplementation(
          createMockGetWithMobile(mobileNumber)
        )

        // Act ''
        handleCheckMessageRequest(mockRequest, mockH)

        // Assert ''
        expect(mockH.view).toHaveBeenCalledWith(
          'notify/register/sms-verify-code/index',
          expect.objectContaining({
            pageTitle: expect.any(String),
            heading: expect.any(String),
            page: expect.any(String),
            serviceName: expect.any(String),
            lang: expect.any(String),
            metaSiteUrl: expect.any(String),
            footerTxt: expect.any(Object),
            phaseBanner: expect.any(Object),
            cookieBanner: expect.any(Object),
            mobileNumber: expect.any(String),
            formData: expect.any(Object)
          })
        )
      })

      it('should include debug token in non-production mode', () => {
        mockRequest.yar.get.mockImplementation((k) => {
          if (k === 'mobileNumber') return '07123456789'
          if (k === 'smsVerificationToken') return '12345'
          if (k === 'formData') return {}
          return null
        })

        handleCheckMessageRequest(mockRequest, mockH)

        expect(mockH.view).toHaveBeenCalledWith(
          'notify/register/sms-verify-code/index',
          expect.objectContaining({
            debugToken: expect.stringContaining('12345')
          })
        )
      })
    })
  })
})

describe('SMS Verify Code Controller - handleCheckMessagePost', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = createMockRequest()
    mockH = createMockH()
  })

  describe('POST request handler', () => {
    describe('when no mobile number in session', () => {
      it('should redirect to mobile number page', () => {
        // Arrange ''
        mockRequest.yar.get.mockReturnValue(null)

        // Act ''
        handleCheckMessagePost(mockRequest, mockH)

        // Assert ''
        expect(mockH.redirect).toHaveBeenCalledWith(
          '/notify/register/sms-mobile-number'
        )
      })
    })

    describe('when code matches', () => {
      it('should set codeVerified flag and redirect', async () => {
        // Arrange ''
        const mobileNumber = '07123456789'
        const token = '12345'
        mockRequest.yar.get.mockImplementation(
          createMockGetForVerify(mobileNumber, token)
        )
        mockRequest.yar.clear = vi.fn()
        mockRequest.payload = { 'activation-code': token }

        // Act ''
        await handleCheckMessagePost(mockRequest, mockH) // NOSONAR - mocked async function

        // Assert ''
        expect(mockRequest.yar.set).toHaveBeenCalledWith('codeVerified', true)
        expect(mockH.redirect).toHaveBeenCalledWith(
          '/notify/register/sms-confirm-details'
        )
      })

      it('should reject invalid format code and render error', async () => {
        mockRequest.yar.get.mockImplementation(
          createMockGetForVerify('07123456789', '12345')
        )
        mockRequest.payload = { 'activation-code': 'abcde' }

        await handleCheckMessagePost(mockRequest, mockH)

        expect(mockH.view).toHaveBeenCalledWith(
          'notify/register/sms-verify-code/index',
          expect.objectContaining({
            error: expect.objectContaining({
              message: expect.stringContaining('like 01234')
            })
          })
        )
      })

      it('should reject empty code and render error', async () => {
        mockRequest.yar.get.mockImplementation(
          createMockGetForVerify('07123456789', '12345')
        )
        mockRequest.payload = { 'activation-code': '' }

        await handleCheckMessagePost(mockRequest, mockH)

        expect(mockH.view).toHaveBeenCalledWith(
          'notify/register/sms-verify-code/index',
          expect.objectContaining({
            error: expect.objectContaining({
              message: expect.stringContaining(
                'Enter your 5 digit activation code'
              )
            })
          })
        )
      })

      it('should show wait-five-minutes message when max attempts reached recently', async () => {
        const now = Date.now()
        mockRequest.yar.get.mockImplementation(
          createMockGetForFailedVerify('07123456789', '12345', 3, now)
        )
        mockRequest.payload = { 'activation-code': '11111' }
        verifyOtp.mockResolvedValueOnce({
          ok: false,
          body: { message: 'Invalid OTP' }
        })

        await handleCheckMessagePost(mockRequest, mockH)

        expect(mockH.view).toHaveBeenCalledWith(
          'notify/register/sms-verify-code/index',
          expect.objectContaining({
            error: expect.objectContaining({
              message: expect.stringContaining('Wait 5 minutes')
            })
          })
        )
      })

      it('should reset attempts after cooldown and show normal invalid-code error', async () => {
        const oldTs = Date.now() - 6 * 60 * 1000
        mockRequest.yar.get.mockImplementation(
          createMockGetForFailedVerify('07123456789', '12345', 3, oldTs)
        )
        mockRequest.yar.clear = vi.fn()
        mockRequest.payload = { 'activation-code': '11111' }
        verifyOtp.mockResolvedValueOnce({
          ok: false,
          body: { message: 'Invalid OTP' }
        })

        await handleCheckMessagePost(mockRequest, mockH)

        expect(mockRequest.yar.set).toHaveBeenCalledWith('otpFailedAttempts', 0)
        expect(mockH.view).toHaveBeenCalledWith(
          'notify/register/sms-verify-code/index',
          expect.objectContaining({
            error: expect.objectContaining({
              message: expect.stringContaining(
                'Enter the 5 digit activation code shown'
              )
            })
          })
        )
      })

      it('should show expired message when backend says secret expired', async () => {
        mockRequest.yar.get.mockImplementation(
          createMockGetForFailedVerify('07123456789', '12345', 0, null)
        )
        mockRequest.payload = { 'activation-code': '11111' }
        verifyOtp.mockResolvedValueOnce({
          ok: false,
          error: { message: 'Secret has expired' }
        })

        await handleCheckMessagePost(mockRequest, mockH)

        expect(mockH.view).toHaveBeenCalledWith(
          'notify/register/sms-verify-code/index',
          expect.objectContaining({
            error: expect.objectContaining({
              message: expect.stringContaining('expired')
            })
          })
        )
      })

      it('should show superseded message when backend says code is no longer valid', async () => {
        mockRequest.yar.get.mockImplementation(
          createMockGetForFailedVerify('07123456789', '12345', 0, null)
        )
        mockRequest.payload = { 'activation-code': '11111' }
        verifyOtp.mockResolvedValueOnce({
          ok: false,
          body: { message: 'This code is no longer valid' }
        })

        await handleCheckMessagePost(mockRequest, mockH)

        expect(mockH.view).toHaveBeenCalledWith(
          'notify/register/sms-verify-code/index',
          expect.objectContaining({
            error: expect.objectContaining({
              message: expect.stringContaining('no longer valid')
            })
          })
        )
      })

      it('should redirect when already verified and submitted code matches mock code', async () => {
        mockRequest.yar.get.mockImplementation((k) => {
          if (k === 'mobileNumber') return '07123456789'
          if (k === 'codeVerified') return true
          return null
        })
        mockRequest.payload = { 'activation-code': '12345' }

        const response = await handleCheckMessagePost(mockRequest, mockH)

        expect(response.redirect).toBe('/notify/register/sms-confirm-details')
      })

      it('should render error when already verified but submitted code differs', async () => {
        mockRequest.yar.get.mockImplementation((k) => {
          if (k === 'mobileNumber') return '07123456789'
          if (k === 'codeVerified') return true
          return null
        })
        mockRequest.payload = { 'activation-code': '99999' }

        await handleCheckMessagePost(mockRequest, mockH)

        expect(mockH.view).toHaveBeenCalledWith(
          'notify/register/sms-verify-code/index',
          expect.objectContaining({
            error: expect.objectContaining({
              message: expect.stringContaining(
                'Enter the 5 digit activation code shown'
              )
            })
          })
        )
      })
    })
  })
})
