/* global vi */
import {
  handleAlertsSuccessRequest,
  handleAlertsSuccessPost
} from './controller.js'

describe('Alerts Success Controller', () => {
  test('handleAlertsSuccessRequest returns correct view data', () => {
    const mockRequest = {
      yar: {
        get: vi
          .fn()
          .mockReturnValueOnce('07123456789') // mobileNumber
          .mockReturnValueOnce('London') // location
          .mockReturnValueOnce(true) // alertDetailsConfirmed
          .mockReturnValueOnce({}) // formData
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

    handleAlertsSuccessRequest(mockRequest, mockH, mockContent)

    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/sms-success/index',
      expect.objectContaining({
        pageTitle:
          'You have successfully signed up for air quality alerts - Check air quality - GOV.UK',
        heading: 'You have successfully signed up for air quality alerts',
        serviceName: 'Check air quality',
        lang: 'en',
        mobileNumber: '07123456789',
        location: 'London',
        alertDetailsConfirmed: true,
        footerTxt: 'Footer text',
        phaseBanner: 'Phase banner',
        backlink: 'Back link',
        cookieBanner: 'Cookie banner'
      })
    )
  })

  test('handleAlertsSuccessPost clears session and redirects to home', () => {
    const mockRequest = {
      yar: {
        clear: vi.fn()
      }
    }

    const mockH = {
      redirect: vi.fn()
    }

    const mockContent = {
      footerTxt: 'Footer text',
      phaseBanner: 'Phase banner',
      backlink: 'Back link',
      cookieBanner: 'Cookie banner'
    }

    handleAlertsSuccessPost(mockRequest, mockH, mockContent)

    expect(mockRequest.yar.clear).toHaveBeenCalledWith('mobileNumber')
    expect(mockRequest.yar.clear).toHaveBeenCalledWith('location')
    expect(mockRequest.yar.clear).toHaveBeenCalledWith('alertDetailsConfirmed')
    expect(mockRequest.yar.clear).toHaveBeenCalledWith('notifyJourney')
    expect(mockRequest.yar.clear).toHaveBeenCalledWith('formData')
    expect(mockH.redirect).toHaveBeenCalledWith('/')
  })

  test('handleAlertsSuccessRequest handles missing session data', () => {
    const mockRequest = {
      yar: {
        get: vi
          .fn()
          .mockReturnValueOnce(null) // mobileNumber
          .mockReturnValueOnce(null) // location
          .mockReturnValueOnce(null) // alertDetailsConfirmed
          .mockReturnValueOnce({}) // formData
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

    handleAlertsSuccessRequest(mockRequest, mockH, mockContent)

    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/sms-success/index',
      expect.objectContaining({
        mobileNumber: 'Not provided',
        location: 'Not selected',
        alertDetailsConfirmed: false
      })
    )
  })
})
