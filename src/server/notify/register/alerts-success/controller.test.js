/* global vi */
// Tests for alerts success controller (email)
import {
  handleAlertsSuccessRequest,
  handleAlertsSuccessPost
} from './controller.js'
import { config } from '../../../../config/index.js'
import { english } from '../../../data/en/en.js'

const CDP_TEST_HOST = 'aqie-front-end.test.cdp-int.defra.cloud'
const CDP_PERF_TEST_HOST = 'aqie-front-end.perf-test.cdp-int.defra.cloud'
const CDP_PERF_HOST = 'aqie-front-end.perf.cdp-int.defra.cloud'
const MOCK_VERIFICATION_TOKEN = 'mock-token-123'
const MOCK_VERIFICATION_HEADER = 'x-aqie-email-verification-token'
const DEFAULT_EMAIL = 'user@example.com'
const ALERTS_SUCCESS_VIEW = 'notify/register/alerts-success/index'

const assertHeadersEmittedInProductionForHost = (host) => {
  const originalNodeEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'

  try {
    const session = {
      mockEmailVerificationToken: MOCK_VERIFICATION_TOKEN
    }
    const mockRequest = {
      yar: {
        get: vi.fn((key) => session[key])
      },
      query: {},
      headers: { host }
    }
    const mockResponse = { header: vi.fn() }
    const mockH = { view: vi.fn(() => mockResponse) }

    handleAlertsSuccessRequest(mockRequest, mockH)

    expect(mockResponse.header).toHaveBeenCalledWith(
      MOCK_VERIFICATION_HEADER,
      MOCK_VERIFICATION_TOKEN
    )
  } finally {
    process.env.NODE_ENV = originalNodeEnv
  }
}

describe('Alerts Success Controller (email) GET', () => {
  test('handleAlertsSuccessRequest returns correct view data', () => {
    const session = {
      emailAddress: DEFAULT_EMAIL,
      location: 'London',
      alertDetailsConfirmed: true,
      mockEmailVerificationToken: MOCK_VERIFICATION_TOKEN,
      formData: {}
    }
    const mockRequest = {
      yar: {
        get: vi.fn((key) => session[key])
      },
      query: {},
      headers: {}
    }
    const mockResponse = { header: vi.fn() }
    const mockH = { view: vi.fn(() => mockResponse) }

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

    expect(mockResponse.header).toHaveBeenCalledWith(
      MOCK_VERIFICATION_HEADER,
      MOCK_VERIFICATION_TOKEN
    )

    const endpointHeaderCall = mockResponse.header.mock.calls.find(
      ([name]) => name === 'x-aqie-email-generate-link-endpoint'
    )
    expect(endpointHeaderCall).toBeTruthy()
    expect(endpointHeaderCall[1]).toContain('/subscribe/generate-link')
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

describe('Alerts Success Controller (email) production CDP host override', () => {
  test('emits mock headers in production for CDP test host', () => {
    assertHeadersEmittedInProductionForHost(CDP_TEST_HOST)
  })

  test('emits mock headers in production for CDP perf-test host', () => {
    assertHeadersEmittedInProductionForHost(CDP_PERF_TEST_HOST)
  })

  test('emits mock headers in production for CDP perf host', () => {
    assertHeadersEmittedInProductionForHost(CDP_PERF_HOST)
  })
})

describe('Alerts Success Controller (email) production non-CDP behavior', () => {
  test('does not emit mock headers in production for non-CDP host', () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    try {
      const session = {
        mockEmailVerificationToken: MOCK_VERIFICATION_TOKEN
      }
      const mockRequest = {
        yar: {
          get: vi.fn((key) => session[key])
        },
        query: {},
        headers: { host: 'www.example.com' }
      }
      const mockResponse = { header: vi.fn() }
      const mockH = { view: vi.fn(() => mockResponse) }

      handleAlertsSuccessRequest(mockRequest, mockH)

      expect(mockResponse.header).not.toHaveBeenCalled()
    } finally {
      process.env.NODE_ENV = originalNodeEnv
    }
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

  test('skips endpoint header when generate-link endpoint config is incomplete', () => {
    const originalGet = config.get.bind(config)
    const getSpy = vi.spyOn(config, 'get').mockImplementation((key) => {
      if (key === 'notify.baseUrl') {
        return ''
      }
      return originalGet(key)
    })

    try {
      const session = {
        mockEmailVerificationToken: MOCK_VERIFICATION_TOKEN
      }
      const mockRequest = {
        yar: {
          get: vi.fn((key) => session[key])
        },
        query: {},
        headers: {}
      }
      const mockResponse = { header: vi.fn() }
      const mockH = { view: vi.fn(() => mockResponse) }

      handleAlertsSuccessRequest(mockRequest, mockH)

      const headerNames = mockResponse.header.mock.calls.map(([name]) => name)
      expect(headerNames).toContain(MOCK_VERIFICATION_HEADER)
      expect(headerNames).not.toContain('x-aqie-email-generate-link-endpoint')
    } finally {
      getSpy.mockRestore()
    }
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
