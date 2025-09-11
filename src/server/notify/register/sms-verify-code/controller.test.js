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
    warn: vi.fn()
  })
}))

// Mock the site URL helper ''
vi.mock('../../../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => 'http://localhost:3000')
}))

describe('SMS Verify Code Controller', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = {
      yar: {
        get: vi.fn(),
        set: vi.fn()
      },
      payload: {}
    }

    mockH = {
      view: vi.fn(),
      redirect: vi.fn()
    }
  })

  describe('handleCheckMessageRequest', () => {
    it('should redirect to mobile number page if no mobile number in session', () => {
      // Arrange ''
      mockRequest.yar.get.mockReturnValue(null)

      // Act ''
      handleCheckMessageRequest(mockRequest, mockH)

      // Assert ''
      expect(mockH.redirect).toHaveBeenCalledWith(
        '/notify/register/sms-mobile-number'
      )
    })

    it('should render the verify code page with mobile number', () => {
      // Arrange ''
      const mobileNumber = '07123456789'
      mockRequest.yar.get.mockImplementation((key) => {
        if (key === 'mobileNumber') return mobileNumber
        if (key === 'formData') return {}
        return null
      })

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
      mockRequest.yar.get.mockImplementation((key) => {
        if (key === 'mobileNumber') return mobileNumber
        if (key === 'formData') return {}
        return null
      })

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
          backlink: expect.any(Object),
          cookieBanner: expect.any(Object),
          mobileNumber: expect.any(String),
          formData: expect.any(Object)
        })
      )
    })
  })

  describe('handleCheckMessagePost', () => {
    it('should redirect to mobile number page if no mobile number in session', () => {
      // Arrange ''
      mockRequest.yar.get.mockReturnValue(null)

      // Act ''
      handleCheckMessagePost(mockRequest, mockH)

      // Assert ''
      expect(mockH.redirect).toHaveBeenCalledWith(
        '/notify/register/sms-mobile-number'
      )
    })

    it('should set codeVerified flag and redirect', () => {
      // Arrange ''
      const mobileNumber = '07123456789'
      mockRequest.yar.get.mockReturnValue(mobileNumber)

      // Act ''
      handleCheckMessagePost(mockRequest, mockH)

      // Assert ''
      expect(mockRequest.yar.set).toHaveBeenCalledWith('codeVerified', true)
      expect(mockH.redirect).toHaveBeenCalledWith(
        '/notify/register/sms-confirm-details'
      )
    })
  })
})
