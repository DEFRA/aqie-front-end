/* global vi */
// Tests for alerts success controller (email) ''
import {
  handleAlertsSuccessRequest,
  handleAlertsSuccessPost
} from './controller.js'

describe('Alerts Success Controller (email)', () => {
  test('Request with email uses email template', () => {
    const mockRequest = {
      yar: {
        get: vi
          .fn()
          .mockReturnValueOnce('user@example.com') // emailAddress
          .mockReturnValueOnce(null) // mobileNumber
          .mockReturnValueOnce('London') // location
          .mockReturnValueOnce(true) // alertDetailsConfirmed
          .mockReturnValueOnce({}) // formData
      }
    }
    const mockH = { view: vi.fn() }
    handleAlertsSuccessRequest(mockRequest, mockH, {
      footerTxt: '',
      phaseBanner: '',
      backlink: '',
      cookieBanner: ''
    })
    expect(mockH.view).toHaveBeenCalledWith(
      'notify/register/alerts-success/index',
      expect.any(Object)
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
  })
})
// ''
