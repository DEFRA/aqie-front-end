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
})
// ''
