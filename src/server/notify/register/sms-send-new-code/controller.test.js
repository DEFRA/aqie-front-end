// Tests for SMS send new code controller ''
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  handleSendNewCodeRequest,
  handleSendNewCodePost
} from './controller.js'

// Test constants ''
const VIEW_PATH = 'notify/register/sms-send-new-code/index'

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

// Mock the notify service ''
vi.mock('../../../common/services/notify.js', () => ({
  sendSmsCode: vi.fn(() => Promise.resolve({ ok: true }))
}))

describe('SMS Send New Code Controller - handleSendNewCodeRequest', () => {
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

  it('should redirect to mobile number page if no mobile number in session', () => {
    // Arrange ''
    mockRequest.yar.get.mockReturnValue(null)

    // Act ''
    handleSendNewCodeRequest(mockRequest, mockH)

    // Assert ''
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/notify/register/sms-mobile-number'
    )
    expect(mockH.view).not.toHaveBeenCalled()
  })
})

describe('SMS Send New Code Controller - handleSendNewCodeRequest with Mobile', () => {
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

  it('should render the send new code page with mobile number', () => {
    // Arrange ''
    const mobileNumber = '07123456789'
    mockRequest.yar.get.mockImplementation((key) => {
      if (key === 'mobileNumber') {
        return mobileNumber
      }
      if (key === 'formData') {
        return {}
      }
      return null
    })

    // Act ''
    handleSendNewCodeRequest(mockRequest, mockH)

    // Assert ''
    expect(mockH.view).toHaveBeenCalledWith(
      VIEW_PATH,
      expect.objectContaining({
        pageTitle: 'Request a new activation code - Check air quality - GOV.UK',
        heading: 'Request a new activation code',
        mobileNumber,
        serviceName: 'Check air quality'
      })
    )
  })

  it('should include all required view model properties', () => {
    // Arrange ''
    const mobileNumber = '07123456789'
    mockRequest.yar.get.mockImplementation((key) => {
      if (key === 'mobileNumber') {
        return mobileNumber
      }
      if (key === 'formData') {
        return {}
      }
      return null
    })

    // Act ''
    handleSendNewCodeRequest(mockRequest, mockH)

    // Assert ''
    expect(mockH.view).toHaveBeenCalledWith(
      VIEW_PATH,
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

describe('SMS Send New Code Controller - handleSendNewCodePost', () => {
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

  it('should set new code flags and redirect to verify code page even without mobile number', async () => {
    // Arrange ''
    mockRequest.payload = { mobileNumberNew: '07123456789' }
    mockRequest.yar.get.mockReturnValue(null)
    mockRequest.yar.clear = vi.fn()

    // Act ''
    await handleSendNewCodePost(mockRequest, mockH) // NOSONAR - mocked async function

    // Assert ''
    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'mobileNumber',
      '07123456789'
    )
    expect(mockRequest.yar.set).toHaveBeenCalledWith('newCodeRequested', true)
    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'newCodeSentAt',
      expect.any(Number)
    )
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/notify/register/sms-verify-code'
    )
  })

  it('should set new code flags and redirect to verify code page', async () => {
    // Arrange ''
    const mobileNumber = '07123456789'
    mockRequest.payload = { mobileNumberNew: mobileNumber }
    mockRequest.yar.get.mockReturnValue(mobileNumber)
    mockRequest.yar.clear = vi.fn()

    // Act ''
    await handleSendNewCodePost(mockRequest, mockH) // NOSONAR - mocked async function

    // Assert ''
    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'mobileNumber',
      '07123456789'
    )
    expect(mockRequest.yar.set).toHaveBeenCalledWith('newCodeRequested', true)
    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'newCodeSentAt',
      expect.any(Number)
    )
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/notify/register/sms-verify-code'
    )
  })
})
