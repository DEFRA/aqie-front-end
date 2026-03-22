import { describe, it, expect, vi, beforeEach } from 'vitest'
import { config } from '../../../../src/config/index.js'
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

describe('notify-subscription-helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    config.get.mockImplementation((key) => {
      if (key === 'notify.enabled') {
        return true
      }
      if (key === 'notify.baseUrl') {
        return 'https://notify.example'
      }
      if (key === 'notify.mockSubscriptionCheckMaxReached') {
        return false
      }
      return undefined
    })
  })

  it('resolves email and sms alert types', () => {
    expect(resolveSubscriptionAlertType('user@example.com')).toBe('email')
    expect(resolveSubscriptionAlertType('07123456789')).toBe('sms')
  })

  it('creates max alerts check log with contact suffix', () => {
    const log = createMaxAlertsCheckLog(
      'https://api.example',
      '/api/subscriptions',
      'sms',
      '07123456789'
    )

    expect(log).toEqual({
      alertBackendBaseUrl: 'https://api.example',
      getSubscriptionsPath: '/api/subscriptions',
      alertType: 'sms',
      contactLast6: '456789'
    })
  })

  it('uses fallback config baseUrl when alert backend URL is missing', () => {
    const result = getNotifySubscriptionConfig(undefined)

    expect(result).toEqual({ enabled: true, baseUrl: 'https://notify.example' })
  })

  it('returns null when subscriptions check is enabled and configured', () => {
    const result = handleDisabledSubscriptionCheck(
      '/api/subscriptions',
      true,
      'https://notify.example'
    )

    expect(result).toBeNull()
  })

  it('returns allow-default when subscriptions check is disabled', () => {
    const result = handleDisabledSubscriptionCheck(
      '/api/subscriptions',
      false,
      ''
    )

    expect(result).toEqual({ ok: true, maxReached: false })
  })

  it('returns null when mock max reached toggle is disabled', () => {
    config.get.mockImplementation((key) => {
      if (key === 'notify.mockSubscriptionCheckMaxReached') {
        return false
      }
      return undefined
    })

    expect(handleMockMaxSubscriptionCheck('sms', '07123456789')).toBeNull()
  })

  it('returns max reached when mock max reached toggle is enabled', () => {
    config.get.mockImplementation((key) => {
      if (key === 'notify.mockSubscriptionCheckMaxReached') {
        return true
      }
      return undefined
    })

    expect(handleMockMaxSubscriptionCheck('email', 'user@example.com')).toEqual(
      {
        ok: true,
        maxReached: true
      }
    )
  })

  it('treats 400 response as max reached', () => {
    const result = evaluateSubscriptionResponse(
      400,
      { message: 'max reached' },
      'sms'
    )

    expect(result).toEqual({ ok: true, maxReached: true })
  })

  it('treats 200 response with count below limit as not max reached', () => {
    const result = evaluateSubscriptionResponse(
      200,
      { subscriptions: [{}, {}] },
      'sms'
    )

    expect(result).toEqual({ ok: true, maxReached: false })
  })

  it('treats 200 response with count at limit as max reached', () => {
    const result = evaluateSubscriptionResponse(200, { count: 5 }, 'email')

    expect(result).toEqual({ ok: true, maxReached: true })
  })

  it('treats unexpected status as failure', () => {
    const result = evaluateSubscriptionResponse(503, { error: 'down' }, 'sms')

    expect(result).toEqual({ ok: false, maxReached: false })
  })
})
