/* global vi */
import { handleNotifyRequest, handleNotifyPost } from './controller.js'

// Test constants ''
const FOOTER_TEXT = 'Footer text'
const PHASE_BANNER = 'Phase banner'
const BACK_LINK = 'Back link'
const COOKIE_BANNER = 'Cookie banner'

describe('Notify Controller - handleNotifyRequest', () => {
  test('returns correct view data', () => {
    const mockRequest = {
      query: { locationId: 'test-location-id' },
      yar: {
        set: vi.fn(),
        get: vi.fn().mockReturnValue({})
      }
    }

    const mockH = {
      view: vi.fn()
    }
    const mockContent = {
      footerTxt: FOOTER_TEXT,
      phaseBanner: PHASE_BANNER,
      backlink: BACK_LINK,
      cookieBanner: COOKIE_BANNER
    }

    handleNotifyRequest(mockRequest, mockH, mockContent)

    expect(mockRequest.yar.set).toHaveBeenCalledWith('notifyJourney', 'started')
    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/sms-mobile-number/index',
      expect.objectContaining({
        pageTitle:
          'What is your mobile phone number? - Check air quality - GOV.UK',
        heading: 'What is your mobile phone number?',
        serviceName: 'Check air quality',
        lang: 'en',
        footerTxt: FOOTER_TEXT,
        phaseBanner: PHASE_BANNER,
        cookieBanner: COOKIE_BANNER,
        displayBacklink: true,
        customBackLink: true,
        backLinkText: 'Back',
        backLinkUrl: '/location/test-location-id'
      })
    )
  })
})

describe('Notify Controller - handleNotifyPost', () => {
  test('validates mobile number', async () => {
    const mockRequest = {
      query: {},
      payload: {
        notifyByText: ''
      },
      yar: {
        set: vi.fn(),
        get: vi.fn()
      }
    }

    const mockH = {
      view: vi.fn(),
      redirect: vi.fn()
    }

    const mockContent = {
      footerTxt: FOOTER_TEXT,
      phaseBanner: PHASE_BANNER,
      backlink: BACK_LINK,
      cookieBanner: COOKIE_BANNER
    }

    await handleNotifyPost(mockRequest, mockH, mockContent)

    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/sms-mobile-number/index',
      expect.objectContaining({
        pageTitle:
          'Error: What is your mobile phone number? - Check air quality - GOV.UK',
        serviceName: 'Check air quality',
        lang: 'en',
        footerTxt: FOOTER_TEXT,
        phaseBanner: PHASE_BANNER,
        cookieBanner: COOKIE_BANNER,
        error: {
          message: 'Enter your mobile phone number',
          field: 'notifyByText'
        }
      })
    )
    // Note: backlink is no longer a simple string, it's an object with { text: 'Back' }
  })

  test('redirects on valid mobile number', async () => {
    const mockRequest = {
      query: {},
      payload: {
        notifyByText: '07123456789'
      },
      yar: {
        set: vi.fn(),
        get: vi.fn()
      }
    }

    const mockH = {
      view: vi.fn(),
      redirect: vi.fn()
    }

    const mockContent = {
      footerTxt: FOOTER_TEXT,
      phaseBanner: PHASE_BANNER,
      backlink: BACK_LINK,
      cookieBanner: COOKIE_BANNER
    }

    await handleNotifyPost(mockRequest, mockH, mockContent)

    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'mobileNumber',
      '+447123456789'
    )
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/notify/register/sms-send-activation'
    )
  })
})
