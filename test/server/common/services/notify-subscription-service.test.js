import { describe, it, expect, vi, beforeEach } from 'vitest'
import { config } from '../../../../src/config/index.js'
import { getSubscriptionCount } from '../../../../src/server/common/services/notify-subscription-service.js'
import { catchFetchError } from '../../../../src/server/common/helpers/catch-fetch-error.js'
import { buildBackendApiFetchOptions } from '../../../../src/server/common/helpers/backend-api-helper.js'
import {
  resolveSubscriptionAlertType,
  createMaxAlertsCheckLog,
  getNotifySubscriptionConfig,
  handleDisabledSubscriptionCheck,
  handleMockMaxSubscriptionCheck,
  evaluateSubscriptionResponse
} from '../../../../src/server/common/services/notify-subscription-helpers.js'

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

vi.mock(
  '../../../../src/server/common/services/notify-subscription-helpers.js',
  () => ({
    resolveSubscriptionAlertType: vi.fn(),
    createMaxAlertsCheckLog: vi.fn(),
    getNotifySubscriptionConfig: vi.fn(),
    handleDisabledSubscriptionCheck: vi.fn(),
    handleMockMaxSubscriptionCheck: vi.fn(),
    evaluateSubscriptionResponse: vi.fn()
  })
)

describe('notify-subscription-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    config.get.mockImplementation((key) => {
      if (key === 'notify.alertBackendBaseUrl') {
        return 'https://backend.example'
      }
      if (key === 'notify.getSubscriptionsPath') {
        return '/api/subscriptions'
      }
      return undefined
    })

    resolveSubscriptionAlertType.mockReturnValue('sms')
    createMaxAlertsCheckLog.mockReturnValue({ check: 'log' })
    getNotifySubscriptionConfig.mockReturnValue({
      enabled: true,
      baseUrl: 'https://backend.example'
    })
    handleDisabledSubscriptionCheck.mockReturnValue(null)
    handleMockMaxSubscriptionCheck.mockReturnValue(null)
    buildBackendApiFetchOptions.mockReturnValue({
      url: 'https://backend.example/api/subscriptions/071?alertType=sms',
      fetchOptions: { method: 'GET' }
    })
    catchFetchError.mockResolvedValue([200, { count: 2 }])
    evaluateSubscriptionResponse.mockReturnValue({
      ok: true,
      maxReached: false
    })
  })

  it('returns disabled check result without calling backend', async () => {
    handleDisabledSubscriptionCheck.mockReturnValueOnce({
      ok: true,
      maxReached: false
    })

    const result = await getSubscriptionCount('07123456789')

    expect(result).toEqual({ ok: true, maxReached: false })
    expect(catchFetchError).not.toHaveBeenCalled()
  })

  it('returns mock max result without calling backend', async () => {
    handleMockMaxSubscriptionCheck.mockReturnValueOnce({
      ok: true,
      maxReached: true
    })

    const result = await getSubscriptionCount('07123456789')

    expect(result).toEqual({ ok: true, maxReached: true })
    expect(catchFetchError).not.toHaveBeenCalled()
  })

  it('calls backend and evaluates API response', async () => {
    const request = { headers: { 'x-api-key': 'test' } }

    const result = await getSubscriptionCount('07123456789', request)

    expect(buildBackendApiFetchOptions).toHaveBeenCalledTimes(1)
    expect(catchFetchError).toHaveBeenCalledWith(
      'https://backend.example/api/subscriptions/071?alertType=sms',
      { method: 'GET' }
    )
    expect(evaluateSubscriptionResponse).toHaveBeenCalledWith(
      200,
      { count: 2 },
      'sms'
    )
    expect(result).toEqual({ ok: true, maxReached: false })
  })

  it('encodes contact values before calling backend', async () => {
    await getSubscriptionCount('user+tag@example.com')

    const apiPathArg = buildBackendApiFetchOptions.mock.calls[0][2]
    expect(apiPathArg).toContain('user%2Btag%40example.com')
  })

  it('returns fail-open fallback when an exception is thrown', async () => {
    buildBackendApiFetchOptions.mockImplementationOnce(() => {
      throw new Error('unexpected')
    })

    const result = await getSubscriptionCount('07123456789')

    expect(result).toEqual({ ok: false, maxReached: false })
  })
})
