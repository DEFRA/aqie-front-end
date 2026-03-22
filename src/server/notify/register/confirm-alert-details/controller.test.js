/* global vi */
// Tests for confirm alert details controller (email + sms) ''
import {
  handleConfirmAlertDetailsRequest,
  handleConfirmAlertDetailsPost
} from './controller.js'

describe('Confirm Alert Details Controller (email & sms)', () => {
  test('Request with email uses email template and data', () => {
    const mockRequest = {
      yar: {
        get: vi
          .fn()
          .mockReturnValueOnce('user@example.com') // emailAddress
          .mockReturnValueOnce(null) // mobileNumber
          .mockReturnValueOnce('London') // location
          .mockReturnValueOnce({}) // formData
      }
    }
    const mockH = { view: vi.fn() }
    handleConfirmAlertDetailsRequest(mockRequest, mockH, {
      footerTxt: '',
      phaseBanner: '',
      backlink: '',
      cookieBanner: ''
    })
    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/confirm-alert-details/index',
      expect.objectContaining({ emailAddress: 'user@example.com' })
    )
  })

  test('Post with missing confirmDetails returns error', () => {
    const mockRequest = {
      payload: { confirmDetails: '' },
      yar: {
        get: vi
          .fn()
          .mockReturnValueOnce('user@example.com') // emailAddress
          .mockReturnValueOnce(null) // mobileNumber
          .mockReturnValueOnce('London') // location
      }
    }
    const mockH = { view: vi.fn() }
    handleConfirmAlertDetailsPost(mockRequest, mockH, {
      footerTxt: '',
      phaseBanner: '',
      backlink: '',
      cookieBanner: ''
    })
    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/confirm-alert-details/index',
      expect.objectContaining({ error: expect.any(Object) })
    )
  })

  test('Post success redirects to email alerts success when email present', () => {
    const mockRequest = {
      payload: { confirmDetails: 'yes' },
      yar: {
        get: vi
          .fn()
          .mockReturnValueOnce('user@example.com') // emailAddress
          .mockReturnValueOnce(null) // mobileNumber
          .mockReturnValueOnce('London'), // location
        set: vi.fn()
      }
    }
    const mockH = { view: vi.fn(), redirect: vi.fn() }
    handleConfirmAlertDetailsPost(mockRequest, mockH, {
      footerTxt: '',
      phaseBanner: '',
      backlink: '',
      cookieBanner: ''
    })
    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'alertDetailsConfirmed',
      true
    )
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/notify/register/alerts-success'
    )
  })

  test('Request with sms uses sms template and mobile data', () => {
    const mockRequest = {
      path: '/notify/register/confirm-alert-details',
      yar: {
        get: vi
          .fn()
          .mockReturnValueOnce(null) // emailAddress
          .mockReturnValueOnce('07123456789') // mobileNumber
          .mockReturnValueOnce('Leeds') // location
          .mockReturnValueOnce({}) // formData
      }
    }
    const mockH = { view: vi.fn() }

    handleConfirmAlertDetailsRequest(mockRequest, mockH, {
      footerTxt: '',
      phaseBanner: '',
      backlink: '',
      cookieBanner: ''
    })

    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/sms-confirm-details/index',
      expect.objectContaining({
        contactMethod: 'sms',
        mobileNumber: '07123456789'
      })
    )
  })

  test('Request with no contact details uses unknown contact fallback', () => {
    const mockRequest = {
      path: '/notify/register/confirm-alert-details',
      yar: {
        get: vi
          .fn()
          .mockReturnValueOnce(null) // emailAddress
          .mockReturnValueOnce(null) // mobileNumber
          .mockReturnValueOnce(null) // location
          .mockReturnValueOnce({}) // formData
      }
    }
    const mockH = { view: vi.fn() }

    handleConfirmAlertDetailsRequest(mockRequest, mockH, {
      footerTxt: '',
      phaseBanner: '',
      backlink: '',
      cookieBanner: ''
    })

    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/sms-confirm-details/index',
      expect.objectContaining({
        contactMethod: 'unknown',
        contactValue: 'Not provided',
        location: 'Not selected'
      })
    )
  })

  test('Post success redirects to sms success when mobile number present', () => {
    const mockRequest = {
      payload: { confirmDetails: 'yes' },
      yar: {
        get: vi
          .fn()
          .mockReturnValueOnce(null) // emailAddress
          .mockReturnValueOnce('07123456789') // mobileNumber
          .mockReturnValueOnce('Leeds'), // location
        set: vi.fn()
      }
    }
    const mockH = { view: vi.fn(), redirect: vi.fn() }

    handleConfirmAlertDetailsPost(mockRequest, mockH, {
      footerTxt: '',
      phaseBanner: '',
      backlink: '',
      cookieBanner: ''
    })

    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'alertDetailsConfirmed',
      true
    )
    expect(mockH.redirect).toHaveBeenCalledWith('/notify/register/sms-success')
  })
})
// ''
