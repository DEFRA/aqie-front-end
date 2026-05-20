import { describe, test, expect, vi } from 'vitest'
import {
  handleEmailSendActivationRequest,
  handleEmailSendActivationPost
} from './controller.js'
import { config } from '../../../../config/index.js'
import { generateEmailLink } from '../../../common/services/notify.js'

const EMAIL_ADDRESS = 'user@example.com'
const TEST_LOCATION = 'Test Location'
const TEST_LATITUDE = 51.5
const TEST_LONGITUDE = -0.12
const VERIFY_EMAIL_PATH_KEY = 'notify.emailVerifyEmailPath'
const EMAIL_DETAILS_PATH_KEY = 'notify.emailDetailsPath'

vi.mock('../../../common/services/notify.js', () => ({
  generateEmailLink: vi.fn()
}))

const createActivationRequest = () => {
  return {
    yar: {
      get: vi.fn(
        (key) =>
          ({
            emailAddress: EMAIL_ADDRESS,
            location: TEST_LOCATION,
            latitude: TEST_LATITUDE,
            longitude: TEST_LONGITUDE
          })[key]
      ),
      set: vi.fn()
    }
  }
}

describe('Email Send Activation Controller GET', () => {
  test('handleEmailSendActivationRequest redirects when email exists', async () => {
    const mockRequest = createActivationRequest()

    const mockH = {
      view: vi.fn(),
      redirect: vi.fn()
    }

    generateEmailLink.mockResolvedValue({ ok: true })
    await handleEmailSendActivationRequest(mockRequest, mockH)

    expect(mockRequest.yar.get).toHaveBeenCalledWith('emailAddress')
    expect(generateEmailLink).toHaveBeenCalledWith(
      EMAIL_ADDRESS,
      TEST_LOCATION,
      TEST_LATITUDE,
      TEST_LONGITUDE,
      mockRequest
    )
    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'emailActivationSent',
      expect.any(Number)
    )
    expect(mockH.redirect).toHaveBeenCalledWith(
      config.get(VERIFY_EMAIL_PATH_KEY)
    )
  })

  test('handleEmailSendActivationRequest redirects when no email in session', async () => {
    const mockRequest = {
      yar: {
        get: vi.fn().mockReturnValue('')
      }
    }

    const mockH = {
      view: vi.fn(),
      redirect: vi.fn()
    }

    await handleEmailSendActivationRequest(mockRequest, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith(
      config.get(EMAIL_DETAILS_PATH_KEY)
    )
    expect(mockH.view).not.toHaveBeenCalled()
  })

  test('handleEmailSendActivationRequest still redirects to verify page when send fails', async () => {
    const mockRequest = createActivationRequest()

    const mockH = {
      view: vi.fn(),
      redirect: vi.fn()
    }

    generateEmailLink.mockRejectedValueOnce(new Error('network error'))

    await handleEmailSendActivationRequest(mockRequest, mockH)

    expect(mockRequest.yar.set).not.toHaveBeenCalledWith(
      'emailActivationSent',
      expect.any(Number)
    )
    expect(mockH.redirect).toHaveBeenCalledWith(
      config.get(VERIFY_EMAIL_PATH_KEY)
    )
  })
})

describe('Email Send Activation Controller POST', () => {
  test('handleEmailSendActivationPost processes valid request and redirects', async () => {
    const mockRequest = {
      yar: {
        get: vi.fn().mockReturnValue(EMAIL_ADDRESS),
        set: vi.fn()
      }
    }

    const mockH = {
      redirect: vi.fn()
    }

    generateEmailLink.mockResolvedValue({ ok: true })
    await handleEmailSendActivationPost(mockRequest, mockH)

    expect(mockRequest.yar.get).toHaveBeenCalledWith('emailAddress')
    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'emailActivationSent',
      expect.any(Number)
    )
    expect(mockH.redirect).toHaveBeenCalledWith(
      config.get(VERIFY_EMAIL_PATH_KEY)
    )
  })

  test('handleEmailSendActivationPost redirects when no email in session', async () => {
    const mockRequest = {
      yar: {
        get: vi.fn().mockReturnValue(null),
        set: vi.fn()
      }
    }

    const mockH = {
      redirect: vi.fn()
    }

    await handleEmailSendActivationPost(mockRequest, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith(
      config.get(EMAIL_DETAILS_PATH_KEY)
    )
    expect(mockRequest.yar.set).not.toHaveBeenCalled()
  })
})
