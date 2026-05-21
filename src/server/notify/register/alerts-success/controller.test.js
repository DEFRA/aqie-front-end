/* global vi */
// Tests for alerts success controller (email)
import {
  handleAlertsSuccessRequest,
  handleAlertsSuccessPost
} from './controller.js'
import { english } from '../../../data/en/en.js'

const DEFAULT_EMAIL = 'user@example.com'
const ALERTS_SUCCESS_VIEW = 'notify/register/alerts-success/index'

describe('Alerts Success Controller (email) GET', () => {
  test('handleAlertsSuccessRequest returns correct view data', () => {
    const session = {
      emailAddress: DEFAULT_EMAIL,
      location: 'London',
      alertDetailsConfirmed: true,
      formData: {}
    }
    const mockRequest = {
      yar: {
        get: vi.fn((key) => session[key])
      },
      query: {},
      headers: {}
    }
    const mockH = { view: vi.fn(() => ({})) }

    handleAlertsSuccessRequest(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      ALERTS_SUCCESS_VIEW,
      expect.objectContaining({
        pageTitle:
          'You have successfully signed up for air quality alerts - Check air quality - GOV.UK',
        heading: 'You have successfully signed up for air quality alerts',
        serviceName: 'Check air quality',
        lang: 'en',
        emailAddress: DEFAULT_EMAIL,
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
    const session = {
      emailAddress: null,
      location: null,
      alertDetailsConfirmed: null,
      formData: {}
    }
    const mockRequest = {
      yar: {
        get: vi.fn((key) => session[key])
      },
      query: {},
      headers: {}
    }
    const mockH = { view: vi.fn() }
    handleAlertsSuccessRequest(mockRequest, mockH)
    expect(mockH.view).toHaveBeenCalledWith(
      ALERTS_SUCCESS_VIEW,
      expect.objectContaining({
        emailAddress: 'Not provided',
        location: 'Not selected',
        alertDetailsConfirmed: false
      })
    )
  })
})

describe('Alerts Success Controller (email) edge branches', () => {
  test('returns an empty success heading when banner heading template is empty', () => {
    const originalBannerHeading = english.emailSuccess.bannerHeading
    english.emailSuccess.bannerHeading = ''

    try {
      const session = {
        emailAddress: DEFAULT_EMAIL,
        location: 'Leeds',
        alertDetailsConfirmed: true,
        formData: {}
      }
      const mockRequest = {
        yar: {
          get: vi.fn((key) => session[key])
        },
        query: {},
        headers: {}
      }
      const mockH = { view: vi.fn(() => ({})) }

      handleAlertsSuccessRequest(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        ALERTS_SUCCESS_VIEW,
        expect.objectContaining({
          emailSuccessHeading: ''
        })
      )
    } finally {
      english.emailSuccess.bannerHeading = originalBannerHeading
    }
  })

  test('renders view model without relying on mock verification headers', () => {
    const session = {
      emailAddress: DEFAULT_EMAIL,
      location: 'Leeds',
      alertDetailsConfirmed: true,
      formData: {}
    }
    const mockRequest = {
      yar: {
        get: vi.fn((key) => session[key])
      },
      query: {},
      headers: {}
    }
    const mockH = { view: vi.fn(() => ({})) }

    handleAlertsSuccessRequest(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      ALERTS_SUCCESS_VIEW,
      expect.objectContaining({
        location: 'Leeds',
        emailAddress: DEFAULT_EMAIL
      })
    )
  })
})

describe('Alerts Success Controller (email) POST', () => {
  test('clears session and redirects', () => {
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
    expect(cleared).toContain('mockEmailVerificationToken')
  })
})
