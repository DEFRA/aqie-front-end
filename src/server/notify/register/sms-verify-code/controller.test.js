// Tests for SMS verify code controller ''
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  handleCheckMessageRequest,
  handleCheckMessagePost
} from './controller.js'

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

// Mock the notify service ''
vi.mock('../../../common/services/notify.js', () => ({
  verifyOtp: vi.fn(() => Promise.resolve({ ok: true }))
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

// Setup helpers ''
const createMockRequest = () => ({
  yar: {
    get: vi.fn(),
    set: vi.fn()
  },
  payload: {}
})

const createMockH = () => ({
  view: vi.fn(),
  redirect: vi.fn()
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
    })
  })
})
