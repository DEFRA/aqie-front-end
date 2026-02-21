/* global vi */
// '' Tests for alerts success controller (email)
import {
  handleAlertsSuccessRequest,
  handleAlertsSuccessPost
} from './controller.js'

describe('Alerts Success Controller (email)', () => {
  test('handleAlertsSuccessRequest returns correct view data', () => {
    const mockRequest = {
      yar: {
        get: vi
          .fn()
          .mockReturnValueOnce('user@example.com') // emailAddress
          .mockReturnValueOnce('London') // location
          .mockReturnValueOnce(true) // alertDetailsConfirmed
          .mockReturnValueOnce({}) // formData
      },
      query: {},
      headers: {}
    }
    const mockH = { view: vi.fn() }
    handleAlertsSuccessRequest(mockRequest, mockH)
    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/alerts-success/index',
      expect.objectContaining({
        pageTitle:
          'You have successfully signed up for air quality alerts - Check air quality - GOV.UK',
        heading: 'You have successfully signed up for air quality alerts',
        serviceName: 'Check air quality',
        lang: 'en',
        emailAddress: 'user@example.com',
        location: 'London',
        emailSuccessHeading:
          'You have set up air quality email alerts for London',
        emailSuccessAnotherAlertPrefix:
          'If you want to set up another alert for user@example.com you can',
        alertDetailsConfirmed: true
      })
    )
  })

  test('handleAlertsSuccessRequest handles missing session data', () => {
    const mockRequest = {
      yar: {
        get: vi
          .fn()
          .mockReturnValueOnce(null) // emailAddress
          .mockReturnValueOnce(null) // location
          .mockReturnValueOnce(null) // alertDetailsConfirmed
          .mockReturnValueOnce({}) // formData
      },
      query: {},
      headers: {}
    }
    const mockH = { view: vi.fn() }
    handleAlertsSuccessRequest(mockRequest, mockH)
    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/alerts-success/index',
      expect.objectContaining({
        emailAddress: 'Not provided',
        location: 'Not selected',
        alertDetailsConfirmed: false
      })
    )
  })

  test('Post clears session and redirects', () => {
    const cleared = []
    const mockRequest = {
      yar: { clear: vi.fn((k) => cleared.push(k)) }
    }
    const mockH = { redirect: vi.fn() }
    handleAlertsSuccessPost(mockRequest, mockH)
    expect(mockH.redirect).toHaveBeenCalledWith('/')
    expect(cleared).toContain('emailAddress')
    expect(cleared).toContain('alertDetailsConfirmed')
    expect(cleared).toContain('notifyJourney')
  })
})
// ''
