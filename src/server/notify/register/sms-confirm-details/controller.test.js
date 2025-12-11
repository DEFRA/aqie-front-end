/* global vi */
import {
  handleConfirmAlertDetailsRequest,
  handleConfirmAlertDetailsPost
} from './controller.js'

describe('Confirm Alert Details Controller', () => {
  test('handleConfirmAlertDetailsRequest returns correct view data', () => {
    const mockRequest = {
      yar: {
        get: vi
          .fn()
          .mockReturnValueOnce('07123456789') // mobileNumber
          .mockReturnValueOnce('London') // location
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

    handleConfirmAlertDetailsRequest(mockRequest, mockH, mockContent)

    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/sms-confirm-details/index',
      expect.objectContaining({
        pageTitle: 'Confirm your alert details - Check air quality - GOV.UK',
        heading: 'Confirm your alert details',
        serviceName: 'Check air quality',
        lang: 'en',
        mobileNumber: '07123456789',
        location: 'London',
        footerTxt: 'Footer text',
        phaseBanner: 'Phase banner',
        backlink: 'Back link',
        cookieBanner: 'Cookie banner'
      })
    )
  })

  test('handleConfirmAlertDetailsPost validates confirmation selection', () => {
    const mockRequest = {
      payload: {
        confirmDetails: ''
      },
      yar: {
        set: vi.fn(),
        get: vi
          .fn()
          .mockReturnValueOnce('07123456789') // mobileNumber
          .mockReturnValueOnce('London') // location
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

    handleConfirmAlertDetailsPost(mockRequest, mockH, mockContent)

    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/sms-confirm-details/index',
      expect.objectContaining({
        pageTitle:
          'Error: Confirm your alert details - Check air quality - GOV.UK',
        serviceName: 'Check air quality',
        lang: 'en',
        mobileNumber: '07123456789',
        location: 'London',
        footerTxt: 'Footer text',
        phaseBanner: 'Phase banner',
        backlink: 'Back link',
        cookieBanner: 'Cookie banner',
        error: {
          message: 'Select yes to confirm your alert details',
          field: 'confirmDetails'
        }
      })
    )
  })

  test('handleConfirmAlertDetailsPost redirects on valid confirmation', () => {
    const mockRequest = {
      payload: {
        confirmDetails: 'yes'
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

    handleConfirmAlertDetailsPost(mockRequest, mockH, mockContent)

    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'alertDetailsConfirmed',
      true
    )
    expect(mockH.redirect).toHaveBeenCalledWith('/notify/register/sms-success')
  })

  test('handleConfirmAlertDetailsRequest handles missing session data', () => {
    const mockRequest = {
      yar: {
        get: vi
          .fn()
          .mockReturnValueOnce(null) // mobileNumber
          .mockReturnValueOnce(null) // location
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

    handleConfirmAlertDetailsRequest(mockRequest, mockH, mockContent)

    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/sms-confirm-details/index',
      expect.objectContaining({
        mobileNumber: 'Not provided',
        location: 'Not selected'
      })
    )
  })
})
