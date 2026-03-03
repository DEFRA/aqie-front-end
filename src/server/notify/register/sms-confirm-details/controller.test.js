/* global vi */
import {
  handleConfirmAlertDetailsRequest,
  handleConfirmAlertDetailsPost
} from './controller.js'

// Mock the notify service
vi.mock('../../../common/services/notify.js', () => ({
  setupAlert: vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: { message: 'Alert setup successful' }
  })
}))

// Test constants ''
const FOOTER_TEXT = 'Footer text'
const PHASE_BANNER = 'Phase banner'
const COOKIE_BANNER = 'Cookie banner'
const TEST_HEADING = 'You will get free air quality alerts for {location}'
const TEST_DESCRIPTION = 'Test description'
const TEST_FORECAST = 'Forecast alert for {location}'
const TEST_MONITORING = 'Monitoring alert for {location}'

// Helper to create mock content ''
const createMockContent = () => ({
  footerTxt: FOOTER_TEXT,
  phaseBanner: PHASE_BANNER,
  backlink: 'Back link',
  cookieBanner: COOKIE_BANNER,
  smsConfirmDetails: {
    heading: TEST_HEADING,
    description: TEST_DESCRIPTION,
    alertTypes: {
      forecast: TEST_FORECAST,
      monitoring: TEST_MONITORING
    },
    continueButton: 'Continue'
  }
})

describe('Confirm Alert Details Controller - handleConfirmAlertDetailsRequest', () => {
  test('returns correct view data', () => {
    const mockRequest = {
      yar: {
        get: vi.fn((key) => {
          const mockData = {
            mobileNumber: '07123456789',
            location: 'London',
            formData: {}
          }
          return mockData[key] || null
        }),
        clear: vi.fn()
      }
    }

    const mockH = {
      view: vi.fn()
    }
    const mockContent = {
      footerTxt: FOOTER_TEXT,
      phaseBanner: PHASE_BANNER,
      backlink: 'Back link',
      cookieBanner: COOKIE_BANNER,
      smsConfirmDetails: {
        heading: 'You will get free air quality alerts for {location}',
        description: 'Test description',
        alertTypes: {
          forecast: 'Forecast alert for {location}',
          monitoring: 'Monitoring alert for {location}'
        },
        continueButton: 'Continue'
      }
    }

    handleConfirmAlertDetailsRequest(mockRequest, mockH, mockContent)

    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/sms-confirm-details/index',
      expect.objectContaining({
        heading: 'You will get free air quality alerts for London',
        serviceName: 'Check air quality',
        lang: 'en',
        mobileNumber: '07123456789',
        location: 'London',
        footerTxt: FOOTER_TEXT,
        phaseBanner: PHASE_BANNER,
        cookieBanner: COOKIE_BANNER
      })
    )
  })
})

describe('Confirm Alert Details Controller - Missing Session Data', () => {
  test('handles missing session data', () => {
    const mockRequest = {
      yar: {
        get: vi.fn((key) => {
          const mockData = {
            formData: {}
          }
          return mockData[key] || null
        })
      }
    }

    const mockH = {
      view: vi.fn(),
      redirect: vi.fn()
    }
    const mockContent = createMockContent()

    handleConfirmAlertDetailsRequest(mockRequest, mockH, mockContent)

    expect(mockH.redirect).toHaveBeenCalledWith(
      '/search-location?fromSmsFlow=true'
    )
  })
})

describe('Confirm Alert Details Controller - handleConfirmAlertDetailsPost', () => {
  describe('POST handler', () => {
    test('redirects to success page', async () => {
      const mockRequest = {
        payload: {
          confirmDetails: 'yes'
        },
        yar: {
          get: vi.fn((key) => {
            const mockData = {
              mobileNumber: '07123456789',
              location: 'London',
              locationId: 'london-123',
              latitude: '51.5074',
              longitude: '-0.1278'
            }
            return mockData[key] || ''
          }),
          set: vi.fn(),
          clear: vi.fn()
        }
      }

      const mockH = {
        view: vi.fn(),
        redirect: vi.fn()
      }

      const mockContent = {
        footerTxt: FOOTER_TEXT,
        phaseBanner: PHASE_BANNER,
        backlink: 'Back link',
        cookieBanner: COOKIE_BANNER
      }

      await handleConfirmAlertDetailsPost(mockRequest, mockH, mockContent)

      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'alertDetailsConfirmed',
        true
      )
      expect(mockH.redirect).toHaveBeenCalledWith(
        '/notify/register/sms-success'
      )
    })
  })
})
