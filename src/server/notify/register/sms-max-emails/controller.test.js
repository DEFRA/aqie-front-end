// Tests for SMS max alerts controller ''
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { handleSmsMaxAlertsRequest } from './controller.js'

// Test constants ''
const VIEW_PATH = 'notify/register/sms-max-emails/index'

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

// Mock the config ''
vi.mock('../../../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      const values = {
        'notify.smsMaxAlertsPath': '/notify/register/sms-max-emails',
        'notify.smsMobileNumberPath': '/notify/register/sms-mobile-number'
      }
      return values[key] ?? null
    })
  }
}))

describe('SMS Max Alerts Controller - handleSmsMaxAlertsRequest', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = {
      yar: {
        get: vi.fn().mockReturnValue(null),
        set: vi.fn()
      },
      headers: {},
      query: {}
    }

    mockH = {
      view: vi.fn(),
      redirect: vi.fn()
    }
  })

  it('should render the sms-max-emails page with English content', () => {
    // Act ''
    handleSmsMaxAlertsRequest(mockRequest, mockH)

    // Assert ''
    expect(mockH.view).toHaveBeenCalledWith(
      VIEW_PATH,
      expect.objectContaining({
        heading: 'You have added the maximum number of alerts',
        displayBacklink: false
      })
    )
  })

  it('should include all required view model properties', () => {
    // Act ''
    handleSmsMaxAlertsRequest(mockRequest, mockH)

    // Assert ''
    const viewModel = mockH.view.mock.calls[0][1]
    expect(viewModel).toHaveProperty('content')
    expect(viewModel).toHaveProperty('smsMobileNumberPath')
    expect(viewModel).toHaveProperty('footerTxt')
    expect(viewModel).toHaveProperty('phaseBanner')
    expect(viewModel).toHaveProperty('common')
    expect(viewModel.displayBacklink).toBe(false)
  })

  it('should include the correct smsMobileNumberPath for the "different address" link', () => {
    // Act ''
    handleSmsMaxAlertsRequest(mockRequest, mockH)

    // Assert ''
    const viewModel = mockH.view.mock.calls[0][1]
    expect(viewModel.smsMobileNumberPath).toBe(
      '/notify/register/sms-mobile-number'
    )
  })

  it('should include smsMaxAlerts content properties', () => {
    // Act ''
    handleSmsMaxAlertsRequest(mockRequest, mockH)

    // Assert ''
    const { content } = mockH.view.mock.calls[0][1]
    expect(content).toHaveProperty('heading')
    expect(content).toHaveProperty('limitText')
    expect(content).toHaveProperty('intro')
    expect(content).toHaveProperty('differentEmailLinkText')
    expect(content).toHaveProperty('unsubscribeLinkText')
  })
})
