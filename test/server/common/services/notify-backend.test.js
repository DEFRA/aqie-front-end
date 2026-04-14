import { describe, it, expect, vi, beforeEach } from 'vitest'
import { config } from '../../../../src/config/index.js'
import { catchFetchError } from '../../../../src/server/common/helpers/catch-fetch-error.js'
import { buildBackendApiFetchOptions } from '../../../../src/server/common/helpers/backend-api-helper.js'
import {
  postToBackend,
  sendEmailCode,
  generateEmailLink,
  validateEmailLink,
  setupEmailAlert,
  sendSmsCode,
  verifyOtp,
  unsubscribeEmailAlert
} from '../../../../src/server/common/services/notify-backend.js'

vi.mock('../../../../src/config/index.js', () => ({
  config: {
    get: vi.fn()
  }
}))

vi.mock('../../../../src/server/common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  })
}))

vi.mock('../../../../src/server/common/helpers/catch-fetch-error.js', () => ({
  catchFetchError: vi.fn()
}))

vi.mock('../../../../src/server/common/helpers/backend-api-helper.js', () => ({
  buildBackendApiFetchOptions: vi.fn()
}))

const createRequestWithYar = (session = {}) => ({
  yar: {
    get: vi.fn((key) => session[key]),
    set: vi.fn((key, value) => {
      session[key] = value
    }),
    clear: vi.fn((key) => {
      delete session[key]
    })
  }
})

describe('notify-backend service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    config.get.mockImplementation((key) => {
      const defaults = {
        'notify.enabled': true,
        'notify.baseUrl': 'https://notify.example',
        'notify.alertBackendBaseUrl': 'https://alerts.example',
        'notify.emailPath': '/email/send-code',
        'notify.emailGenerateLinkPath': '/email/generate-link',
        'notify.emailValidateLinkPath': '/email/validate-link',
        'notify.setupAlertPath': '/alerts/setup',
        'notify.smsPath': '/sms/send',
        'notify.verifyOtpPath': '/sms/verify',
        'notify.mockSetupAlertEnabled': false,
        'notify.mockOtpEnabled': false,
        'notify.mockOtpCode': '12345',
        'notify.optOutEmailAlertPath': '/opt-out-email-alert'
      }
      return defaults[key]
    })

    buildBackendApiFetchOptions.mockReturnValue({
      url: 'https://alerts.example/opt-out-email-alert',
      fetchOptions: { method: 'DELETE' }
    })
    catchFetchError.mockResolvedValue([200, { ok: true }])
  })

  it('returns skipped when notify is disabled', async () => {
    config.get.mockImplementation((key) => {
      if (key === 'notify.enabled') return false
      if (key === 'notify.baseUrl') return 'https://notify.example'
      return undefined
    })

    const result = await postToBackend(null, '/x', { a: 1 })

    expect(result).toEqual({ skipped: true })
    expect(catchFetchError).not.toHaveBeenCalled()
  })

  it('returns skipped when baseUrl is missing', async () => {
    config.get.mockImplementation((key) => {
      if (key === 'notify.enabled') return true
      if (key === 'notify.baseUrl') return ''
      return undefined
    })

    const result = await postToBackend(null, '/x', { a: 1 })

    expect(result).toEqual({ skipped: true })
  })

  it('returns ok true on HTTP 200', async () => {
    catchFetchError.mockResolvedValueOnce([200, { id: 'x' }])

    const result = await postToBackend(null, '/x', { a: 1 })

    expect(result).toEqual({ ok: true, data: { id: 'x' } })
  })

  it('returns ok true on HTTP 201', async () => {
    catchFetchError.mockResolvedValueOnce([201, { id: 'x' }])

    const result = await postToBackend(null, '/x', { a: 1 })

    expect(result).toEqual({ ok: true, data: { id: 'x' } })
  })

  it('returns error object on non-2xx status', async () => {
    catchFetchError.mockResolvedValueOnce([500, { error: 'fail' }])

    const result = await postToBackend(null, '/x', { a: 1 })

    expect(result).toEqual({ ok: false, status: 500, body: { error: 'fail' } })
  })

  it('returns ok false with error when exception is thrown', async () => {
    buildBackendApiFetchOptions.mockImplementationOnce(() => {
      throw new Error('boom')
    })

    const result = await postToBackend(null, '/x', { a: 1 })

    expect(result.ok).toBe(false)
    expect(result.error).toBeInstanceOf(Error)
  })

  it('sendEmailCode uses configured email path', async () => {
    await sendEmailCode('user@example.com', '12345', null)

    expect(buildBackendApiFetchOptions).toHaveBeenCalledWith(
      null,
      'https://notify.example',
      '/email/send-code',
      {
        method: 'POST',
        body: { emailAddress: 'user@example.com', code: '12345' }
      }
    )
  })

  it('generateEmailLink includes parsed lat/long when provided', async () => {
    await generateEmailLink('user@example.com', 'Leeds', '53.8', '-1.5', null)

    expect(buildBackendApiFetchOptions).toHaveBeenCalledWith(
      null,
      'https://notify.example',
      '/email/generate-link',
      {
        method: 'POST',
        body: {
          emailAddress: 'user@example.com',
          alertType: 'email',
          location: 'Leeds',
          lat: 53.8,
          long: -1.5
        }
      }
    )
  })

  it('generateEmailLink omits lat/long when null/undefined', async () => {
    await generateEmailLink('user@example.com', 'Leeds', null, undefined, null)

    const body = buildBackendApiFetchOptions.mock.calls[0][3].body
    expect(body.lat).toBeUndefined()
    expect(body.long).toBeUndefined()
  })

  it('validateEmailLink appends encoded token and handles trailing slash', async () => {
    config.get.mockImplementation((key) => {
      if (key === 'notify.enabled') return true
      if (key === 'notify.baseUrl') return 'https://notify.example'
      if (key === 'notify.emailValidateLinkPath') return '/email/validate-link/'
      return undefined
    })
    buildBackendApiFetchOptions.mockReturnValueOnce({
      url: 'https://notify.example/email/validate-link/a%2Fb',
      fetchOptions: { method: 'GET' }
    })
    catchFetchError.mockResolvedValueOnce([200, { ok: true }])

    const result = await validateEmailLink('a/b', null)

    expect(buildBackendApiFetchOptions).toHaveBeenCalledWith(
      null,
      'https://notify.example',
      '/email/validate-link/a%2Fb',
      { method: 'GET' }
    )
    expect(result).toEqual({ ok: true, data: { ok: true } })
  })

  it('validateEmailLink returns skipped when notify is disabled', async () => {
    config.get.mockImplementation((key) => {
      if (key === 'notify.enabled') return false
      if (key === 'notify.baseUrl') return 'https://notify.example'
      if (key === 'notify.emailValidateLinkPath') return '/email/validate-link'
      return undefined
    })

    const result = await validateEmailLink('abc123', null)

    expect(result).toEqual({ skipped: true })
    expect(catchFetchError).not.toHaveBeenCalled()
  })

  it('validateEmailLink returns not-ok response when GET status is non-200', async () => {
    buildBackendApiFetchOptions.mockReturnValueOnce({
      url: 'https://notify.example/email/validate-link/abc123',
      fetchOptions: { method: 'GET' }
    })
    catchFetchError.mockResolvedValueOnce([403, { message: 'forbidden' }])

    const result = await validateEmailLink('abc123', null)

    expect(result).toEqual({
      ok: false,
      status: 403,
      body: { message: 'forbidden' }
    })
  })

  it('validateEmailLink returns error object when GET request throws', async () => {
    buildBackendApiFetchOptions.mockImplementationOnce(() => {
      throw new Error('network down')
    })

    const result = await validateEmailLink('abc123', null)

    expect(result.ok).toBe(false)
    expect(result.error).toBeInstanceOf(Error)
  })

  it('setupEmailAlert returns mock response when mock setup is enabled', async () => {
    config.get.mockImplementation((key) => {
      const defaults = {
        'notify.enabled': true,
        'notify.baseUrl': 'https://notify.example',
        'notify.alertBackendBaseUrl': 'https://alerts.example',
        'notify.setupAlertPath': '/alerts/setup',
        'notify.mockSetupAlertEnabled': true
      }
      return defaults[key]
    })

    const result = await setupEmailAlert(
      'user@example.com',
      'Air quality in Leeds',
      'loc-1',
      '53.8123456',
      '-1.1234567',
      'en',
      null
    )

    expect(result.mock).toBe(true)
    expect(result.ok).toBe(true)
    expect(catchFetchError).not.toHaveBeenCalled()
  })

  it('setupEmailAlert posts sanitized location and rounded coordinates', async () => {
    await setupEmailAlert(
      'user@example.com',
      'Air quality in Leeds',
      'loc-2',
      '53.8123456',
      '-1.1234567',
      'en',
      null
    )

    expect(buildBackendApiFetchOptions).toHaveBeenCalledWith(
      null,
      'https://alerts.example',
      '/alerts/setup',
      {
        method: 'POST',
        body: {
          emailAddress: 'user@example.com',
          alertType: 'email',
          location: 'Leeds',
          locationId: 'loc-2',
          lat: 53.812346,
          long: -1.123457,
          lang: 'en'
        }
      }
    )
  })

  it('setupEmailAlert preserves non-string location values', async () => {
    const nonStringLocation = { name: 'Leeds' }

    await setupEmailAlert(
      'user@example.com',
      nonStringLocation,
      'loc-3',
      null,
      undefined,
      'en',
      null
    )

    expect(buildBackendApiFetchOptions).toHaveBeenCalledWith(
      null,
      'https://alerts.example',
      '/alerts/setup',
      {
        method: 'POST',
        body: {
          emailAddress: 'user@example.com',
          alertType: 'email',
          location: nonStringLocation,
          locationId: 'loc-3',
          lat: undefined,
          long: undefined,
          lang: 'en'
        }
      }
    )
  })

  it('sendSmsCode returns mock success and stores mock data when mock otp enabled', async () => {
    config.get.mockImplementation((key) => {
      const defaults = {
        'notify.enabled': true,
        'notify.baseUrl': 'https://notify.example',
        'notify.smsPath': '/sms/send',
        'notify.mockOtpEnabled': true,
        'notify.mockOtpCode': '99999'
      }
      return defaults[key]
    })

    const session = { otpGenerationSequence: 3 }
    const request = createRequestWithYar(session)

    const result = await sendSmsCode('07123456789', request)

    expect(result.ok).toBe(true)
    expect(result.mock).toBe(true)
    expect(session.mockOtp).toBe('99999')
    expect(session.mockOtpSequence).toBe(3)
  })

  it('sendSmsCode returns mock success even when backend call fails in mock mode', async () => {
    config.get.mockImplementation((key) => {
      const defaults = {
        'notify.enabled': true,
        'notify.baseUrl': 'https://notify.example',
        'notify.smsPath': '/sms/send',
        'notify.mockOtpEnabled': true,
        'notify.mockOtpCode': '77777'
      }
      return defaults[key]
    })
    catchFetchError.mockResolvedValueOnce([500, { error: 'failed send' }])

    const request = createRequestWithYar({})
    const result = await sendSmsCode('07123456789', request)

    expect(result).toEqual({
      ok: true,
      data: { status: 'mock_otp_enabled', mockOtpCode: '77777' },
      mock: true
    })
  })

  it('sendSmsCode clears mock otp on successful real backend send', async () => {
    const session = { mockOtp: '12345' }
    const request = createRequestWithYar(session)
    catchFetchError.mockResolvedValueOnce([200, { ok: true }])

    await sendSmsCode('07123456789', request)

    expect(request.yar.clear).toHaveBeenCalledWith('mockOtp')
  })

  it('verifyOtp returns mock success and clears session when otp matches mock code', async () => {
    config.get.mockImplementation((key) => {
      const defaults = {
        'notify.mockOtpEnabled': true,
        'notify.mockOtpCode': '12345',
        'notify.verifyOtpPath': '/sms/verify',
        'notify.enabled': true,
        'notify.baseUrl': 'https://notify.example'
      }
      return defaults[key]
    })

    const request = createRequestWithYar({})

    const result = await verifyOtp('07123456789', '12345', request)

    expect(result).toEqual({
      ok: true,
      data: { status: 'verified', mock: true }
    })
    expect(request.yar.clear).toHaveBeenCalledWith('mockOtp')
    expect(request.yar.clear).toHaveBeenCalledWith('mockOtpTimestamp')
    expect(request.yar.clear).toHaveBeenCalledWith('mockOtpSequence')
  })

  it('verifyOtp returns mock invalid response when otp does not match', async () => {
    config.get.mockImplementation((key) => {
      const defaults = {
        'notify.mockOtpEnabled': true,
        'notify.mockOtpCode': '12345',
        'notify.verifyOtpPath': '/sms/verify',
        'notify.enabled': true,
        'notify.baseUrl': 'https://notify.example'
      }
      return defaults[key]
    })

    const result = await verifyOtp(
      '07123456789',
      '00000',
      createRequestWithYar()
    )

    expect(result).toEqual({
      ok: false,
      status: 400,
      body: { message: 'Invalid OTP code', mock: true }
    })
  })

  it('verifyOtp posts to backend when mock otp is disabled', async () => {
    config.get.mockImplementation((key) => {
      const defaults = {
        'notify.enabled': true,
        'notify.baseUrl': 'https://notify.example',
        'notify.verifyOtpPath': '/sms/verify',
        'notify.mockOtpEnabled': false,
        'notify.mockOtpCode': '12345'
      }
      return defaults[key]
    })

    await verifyOtp('07123456789', '12345', null)

    expect(buildBackendApiFetchOptions).toHaveBeenCalledWith(
      null,
      'https://notify.example',
      '/sms/verify',
      {
        method: 'POST',
        body: { phoneNumber: '07123456789', otp: '12345' }
      }
    )
  })

  describe('unsubscribeEmailAlert', () => {
    it('calls DELETE /opt-out-email-alert with emailAddress', async () => {
      catchFetchError.mockResolvedValueOnce([200, { message: 'unsubscribed' }])

      await unsubscribeEmailAlert('user@example.com', null)

      expect(buildBackendApiFetchOptions).toHaveBeenCalledWith(
        null,
        'https://alerts.example',
        '/opt-out-email-alert',
        { method: 'DELETE', body: { emailAddress: 'user@example.com' } }
      )
    })

    it('returns ok:true on 200 response', async () => {
      catchFetchError.mockResolvedValueOnce([200, { message: 'unsubscribed' }])

      const result = await unsubscribeEmailAlert('user@example.com', null)

      expect(result).toEqual({ ok: true, data: { message: 'unsubscribed' } })
    })

    it('returns ok:false with status on non-200 response', async () => {
      catchFetchError.mockResolvedValueOnce([404, { message: 'not found' }])

      const result = await unsubscribeEmailAlert('user@example.com', null)

      expect(result).toEqual({
        ok: false,
        status: 404,
        body: { message: 'not found' }
      })
    })

    it('returns ok:false with status on 500 response', async () => {
      catchFetchError.mockResolvedValueOnce([500, { message: 'server error' }])

      const result = await unsubscribeEmailAlert('user@example.com', null)

      expect(result.ok).toBe(false)
      expect(result.status).toBe(500)
    })

    it('returns skipped:true when notify is disabled', async () => {
      config.get.mockImplementation((key) => {
        if (key === 'notify.enabled') return false
        if (key === 'notify.alertBackendBaseUrl') {
          return 'https://alerts.example'
        }
        if (key === 'notify.optOutEmailAlertPath') return '/opt-out-email-alert'
        return null
      })

      const result = await unsubscribeEmailAlert('user@example.com', null)

      expect(result).toEqual({ skipped: true })
      expect(catchFetchError).not.toHaveBeenCalled()
    })

    it('returns skipped:true when alertBackendBaseUrl is not set', async () => {
      config.get.mockImplementation((key) => {
        if (key === 'notify.enabled') return true
        if (key === 'notify.alertBackendBaseUrl') return ''
        if (key === 'notify.baseUrl') return ''
        if (key === 'notify.optOutEmailAlertPath') return '/opt-out-email-alert'
        return null
      })

      const result = await unsubscribeEmailAlert('user@example.com', null)

      expect(result).toEqual({ skipped: true })
      expect(catchFetchError).not.toHaveBeenCalled()
    })

    it('returns ok:false with error when fetch throws', async () => {
      buildBackendApiFetchOptions.mockImplementationOnce(() => {
        throw new Error('network failure')
      })

      const result = await unsubscribeEmailAlert('user@example.com', null)

      expect(result.ok).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error.message).toBe('network failure')
    })
  })
})
