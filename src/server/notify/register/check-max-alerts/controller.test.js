/* global vi, describe, test, expect, beforeEach, afterEach */
import { checkMaxAlertsController } from './controller.js'
import * as notifyService from '../../../common/services/notify.js'

// Mock the notify service ''
vi.mock('../../../common/services/notify.js', () => ({
  getSubscriptionCount: vi.fn()
}))

describe('Check Max Alerts Controller', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = {
      yar: {
        get: vi.fn(),
        set: vi.fn(),
        clear: vi.fn()
      }
    }

    mockH = {
      redirect: vi.fn()
    }

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when mobile number is missing from session', () => {
    test('redirects to mobile number page', async () => {
      // '' Arrange
      mockRequest.yar.get.mockReturnValue(null)

      // '' Act
      await checkMaxAlertsController.handler(mockRequest, mockH)

      // '' Assert
      expect(mockH.redirect).toHaveBeenCalledWith(
        '/notify/register/sms-mobile-number'
      )
    })
  })

  describe('when user has NOT reached maximum alerts (< 5 locations)', () => {
    test('sets notification flow and redirects to search location', async () => {
      // '' Arrange
      const phoneNumber = '07700900982'
      mockRequest.yar.get.mockReturnValue(phoneNumber)
      notifyService.getSubscriptionCount.mockResolvedValue({
        ok: true,
        maxReached: false
      })

      // '' Act
      await checkMaxAlertsController.handler(mockRequest, mockH)

      // '' Assert
      expect(notifyService.getSubscriptionCount).toHaveBeenCalledWith(
        phoneNumber,
        mockRequest
      )
      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'notificationFlow',
        'sms'
      )
      expect(mockH.redirect).toHaveBeenCalledWith(
        '/search-location?fromSmsFlow=true'
      )
    })
  })

  describe('when user HAS reached maximum alerts (>= 5 locations)', () => {
    test('sets error flags, clears mobile number, and redirects to mobile number page', async () => {
      // '' Arrange
      const phoneNumber = '07700900982'
      mockRequest.yar.get.mockReturnValue(phoneNumber)
      notifyService.getSubscriptionCount.mockResolvedValue({
        ok: true,
        maxReached: true
      })

      // '' Act
      await checkMaxAlertsController.handler(mockRequest, mockH)

      // '' Assert
      expect(notifyService.getSubscriptionCount).toHaveBeenCalledWith(
        phoneNumber,
        mockRequest
      )
      expect(mockRequest.yar.set).toHaveBeenCalledWith('maxAlertsError', true)
      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'maskedPhoneNumber',
        '07700 XXX 982'
      )
      expect(mockRequest.yar.clear).toHaveBeenCalledWith('mobileNumber')
      expect(mockH.redirect).toHaveBeenCalledWith(
        '/notify/register/sms-mobile-number'
      )
    })

    test('correctly masks phone number with different format', async () => {
      // '' Arrange
      const phoneNumber = '07123456789'
      mockRequest.yar.get.mockReturnValue(phoneNumber)
      notifyService.getSubscriptionCount.mockResolvedValue({
        ok: true,
        maxReached: true
      })

      // '' Act
      await checkMaxAlertsController.handler(mockRequest, mockH)

      // '' Assert
      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'maskedPhoneNumber',
        '07123 XXX 789'
      )
    })
  })

  describe('when API check fails', () => {
    test('allows user to proceed (fail open) and redirects to search', async () => {
      // '' Arrange
      const phoneNumber = '07700900982'
      mockRequest.yar.get.mockReturnValue(phoneNumber)
      notifyService.getSubscriptionCount.mockResolvedValue({
        ok: false,
        maxReached: false
      })

      // '' Act
      await checkMaxAlertsController.handler(mockRequest, mockH)

      // '' Assert
      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'notificationFlow',
        'sms'
      )
      expect(mockH.redirect).toHaveBeenCalledWith(
        '/search-location?fromSmsFlow=true'
      )
    })

    test('handles API errors gracefully and allows user to proceed', async () => {
      // '' Arrange
      const phoneNumber = '07700900982'
      mockRequest.yar.get.mockReturnValue(phoneNumber)
      notifyService.getSubscriptionCount.mockRejectedValue(
        new Error('Network error')
      )

      // '' Act
      await checkMaxAlertsController.handler(mockRequest, mockH)

      // '' Assert
      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'notificationFlow',
        'sms'
      )
      expect(mockH.redirect).toHaveBeenCalledWith(
        '/search-location?fromSmsFlow=true'
      )
    })
  })
})
