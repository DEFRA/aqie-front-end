/* global vi */
import { handleNotifyRequest, handleNotifyPost } from './controller.js'

describe('Notify Controller', () => {
  test('handleNotifyRequest returns correct view data', () => {
    const mockRequest = {
      query: {},
      yar: {
        set: vi.fn(),
        get: vi.fn().mockReturnValue({})
      }
    }

    const mockH = {
      view: vi.fn()
    }
    const mockContent = {
      footerTxt: 'Footer text',
      phaseBanner: 'Phase banner',
      backlink: 'Back link',
      cookieBanner: 'Cookie banner'
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
        footerTxt: 'Footer text',
        phaseBanner: 'Phase banner',
        backlink: 'Back link',
        cookieBanner: 'Cookie banner'
      })
    )
  })

  test('handleNotifyPost validates mobile number', async () => {
    const mockRequest = {
      payload: {
        notifyByText: ''
      },
      yar: {
        set: vi.fn()
      }
    }

    const mockH = {
      view: vi.fn(),
      redirect: vi.fn()
    }

    const mockContent = {
      footerTxt: 'Footer text',
      phaseBanner: 'Phase banner',
      backlink: 'Back link',
      cookieBanner: 'Cookie banner'
    }

    await handleNotifyPost(mockRequest, mockH, mockContent)

    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/sms-mobile-number/index',
      expect.objectContaining({
        pageTitle:
          'Error: What is your mobile phone number? - Check air quality - GOV.UK',
        serviceName: 'Check air quality',
        lang: 'en',
        footerTxt: 'Footer text',
        phaseBanner: 'Phase banner',
        backlink: 'Back link',
        cookieBanner: 'Cookie banner',
        error: {
          message: 'Enter your mobile phone number',
          field: 'notifyByText'
        }
      })
    )
  })

  test('handleNotifyPost redirects on valid mobile number', async () => {
    const mockRequest = {
      payload: {
        notifyByText: '07123456789'
      },
      yar: {
        set: vi.fn()
      }
    }

    const mockH = {
      view: vi.fn(),
      redirect: vi.fn()
    }

    const mockContent = {
      footerTxt: 'Footer text',
      phaseBanner: 'Phase banner',
      backlink: 'Back link',
      cookieBanner: 'Cookie banner'
    }

    await handleNotifyPost(mockRequest, mockH, mockContent)

    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'mobileNumber',
      '07123456789'
    )
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/notify/register/sms-send-activation'
    )
  })
})
