import { describe, test, expect, vi } from 'vitest'
import { handleNotifyRequest, handleNotifyPost } from './controller.js'

describe('Notify Controller', () => {
  test('handleNotifyRequest returns correct view data', () => {
    const mockRequest = {
      yar: {
        set: vi.fn()
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
      'notify/index',
      expect.objectContaining({
        pageTitle: 'What is your mobile phone number? - Check air quality',
        heading: 'What is your mobile phone number?',
        serviceName: 'Check air quality'
      })
    )
  })

  test('handleNotifyPost validates mobile number', () => {
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

    handleNotifyPost(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      'notify/index',
      expect.objectContaining({
        error: {
          message: 'Enter your mobile phone number',
          field: 'notifyByText'
        }
      })
    )
  })

  test('handleNotifyPost redirects on valid mobile number', () => {
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

    handleNotifyPost(mockRequest, mockH)

    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'mobileNumber',
      '07123456789'
    )
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/notify/register/sms-verify-code'
    )
  })
})
