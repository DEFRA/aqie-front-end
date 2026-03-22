import { describe, it, expect, beforeEach, vi } from 'vitest'

import { config } from '../../../../src/config/index.js'
import {
  trySetupMockAlert,
  tryFallbackMockSetup,
  getMockAlertStorageSnapshot,
  getMockAlerts,
  clearMockAlerts,
  removeMockAlert
} from '../../../../src/server/common/services/notify-mock-alerts.js'

vi.mock('../../../../src/server/common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  })
}))

vi.mock('../../../../src/config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'env') {
        return 'test'
      }
      return undefined
    })
  }
}))

describe('notify-mock-alerts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearMockAlerts()
    config.get.mockImplementation((key) => {
      if (key === 'env') {
        return 'test'
      }
      return undefined
    })
  })

  it('stores a mock alert and returns masked response', () => {
    const result = trySetupMockAlert({
      phoneNumber: '07123456789',
      alertType: 'sms',
      locationId: 'loc-1',
      sanitizedLocation: 'Leeds',
      latitude: 53.8,
      longitude: -1.5
    })

    expect(result.ok).toBe(true)
    expect(result.mock).toBe(true)
    expect(result.data.phoneNumber).toBe('***6789')
    expect(result.data.locationId).toBe('loc-1')

    const alerts = getMockAlerts()
    expect(alerts).toHaveLength(1)
    expect(alerts[0].phoneNumber).toBe('+447123456789')
  })

  it('normalizes NI postcode key and detects duplicate without locationId', () => {
    const first = trySetupMockAlert({
      phoneNumber: '07123456789',
      alertType: 'sms',
      locationId: null,
      sanitizedLocation: 'bt7 1nn',
      latitude: 54.58,
      longitude: -5.93
    })

    const second = trySetupMockAlert({
      phoneNumber: '07123456789',
      alertType: 'sms',
      locationId: null,
      sanitizedLocation: 'BT7   1NN',
      latitude: 54.58,
      longitude: -5.93
    })

    expect(first.ok).toBe(true)
    expect(second.ok).toBe(false)
    expect(second.status).toBe(409)
    expect(second.data.mock).toBe(true)
  })

  it('enforces max of five alerts per normalized phone', () => {
    for (let i = 1; i <= 5; i++) {
      const result = trySetupMockAlert({
        phoneNumber: '07123456789',
        alertType: 'sms',
        locationId: `loc-${i}`,
        sanitizedLocation: `City-${i}`,
        latitude: i,
        longitude: -i
      })
      expect(result.ok).toBe(true)
    }

    const sixth = trySetupMockAlert({
      phoneNumber: '+44 7123 456789',
      alertType: 'sms',
      locationId: 'loc-6',
      sanitizedLocation: 'City-6',
      latitude: 6,
      longitude: -6
    })

    expect(sixth.ok).toBe(false)
    expect(sixth.status).toBe(400)
    expect(sixth.data.message).toContain('Maximum of 5 alerts')
    expect(sixth.data.mock).toBe(true)
  })

  it('fallback mock returns null when backend status is not service unavailable', () => {
    const result = tryFallbackMockSetup({
      result: { ok: false, status: 500 },
      mockSetupAlertEnabled: true,
      phoneNumber: '07123456789',
      alertType: 'sms',
      locationId: 'loc-1',
      sanitizedLocation: 'Leeds',
      latitude: 53.8,
      longitude: -1.5
    })

    expect(result).toBeNull()
  })

  it('fallback mock returns null when toggle is disabled', () => {
    const result = tryFallbackMockSetup({
      result: { ok: false, status: 503 },
      mockSetupAlertEnabled: false,
      phoneNumber: '07123456789',
      alertType: 'sms',
      locationId: 'loc-1',
      sanitizedLocation: 'Leeds',
      latitude: 53.8,
      longitude: -1.5
    })

    expect(result).toBeNull()
  })

  it('fallback mode stores alert and returns created payload', () => {
    const result = tryFallbackMockSetup({
      result: { ok: false, status: 503 },
      mockSetupAlertEnabled: true,
      phoneNumber: '07123456789',
      alertType: 'sms',
      locationId: 'loc-1',
      sanitizedLocation: 'Leeds',
      latitude: 53.8,
      longitude: -1.5
    })

    expect(result.ok).toBe(true)
    expect(result.status).toBe(201)
    expect(result.data.phoneNumber).toBe('***6789')
    expect(result.data.alertCount).toBe(1)
  })

  it('fallback mode duplicate includes phone and coordinates details', () => {
    const first = tryFallbackMockSetup({
      result: { ok: false, status: 502 },
      mockSetupAlertEnabled: true,
      phoneNumber: '07123456789',
      alertType: 'sms',
      locationId: null,
      sanitizedLocation: 'Leeds',
      latitude: 53.8,
      longitude: -1.5
    })

    const second = tryFallbackMockSetup({
      result: { ok: false, status: 504 },
      mockSetupAlertEnabled: true,
      phoneNumber: '07123456789',
      alertType: 'sms',
      locationId: null,
      sanitizedLocation: 'Leeds',
      latitude: 53.8,
      longitude: -1.5
    })

    expect(first.ok).toBe(true)
    expect(second.ok).toBe(false)
    expect(second.status).toBe(409)
    expect(second.data.phoneNumber).toBe('***6789')
    expect(second.data.coordinates).toEqual({ lat: 53.8, long: -1.5 })
  })

  it('fallback mode max alert response includes fallback details', () => {
    for (let i = 1; i <= 5; i++) {
      const result = tryFallbackMockSetup({
        result: { ok: false, status: 503 },
        mockSetupAlertEnabled: true,
        phoneNumber: '07123456789',
        alertType: 'sms',
        locationId: `loc-${i}`,
        sanitizedLocation: `Leeds-${i}`,
        latitude: i,
        longitude: -i
      })
      expect(result.ok).toBe(true)
    }

    const sixth = tryFallbackMockSetup({
      result: { ok: false, status: 503 },
      mockSetupAlertEnabled: true,
      phoneNumber: '07123456789',
      alertType: 'sms',
      locationId: 'loc-6',
      sanitizedLocation: 'Leeds-6',
      latitude: 6,
      longitude: -6
    })

    expect(sixth.ok).toBe(false)
    expect(sixth.status).toBe(400)
    expect(sixth.data.phoneNumber).toBe('***6789')
    expect(sixth.data.currentAlertCount).toBe(5)
    expect(sixth.data.maxAlerts).toBe(5)
  })

  it('throws when fallback mock is attempted in production', () => {
    config.get.mockImplementation((key) => {
      if (key === 'env') {
        return 'production'
      }
      return undefined
    })

    expect(() =>
      tryFallbackMockSetup({
        result: { ok: false, status: 503 },
        mockSetupAlertEnabled: true,
        phoneNumber: '07123456789',
        alertType: 'sms',
        locationId: 'loc-prod',
        sanitizedLocation: 'Leeds',
        latitude: 53.8,
        longitude: -1.5
      })
    ).toThrow('CRITICAL: Mock setup alert is enabled in production environment')
  })

  it('supports snapshot, remove and clear operations', () => {
    trySetupMockAlert({
      phoneNumber: '07123456789',
      alertType: 'sms',
      locationId: null,
      sanitizedLocation: 'Leeds',
      latitude: 53.8,
      longitude: -1.5
    })

    const snapshot = getMockAlertStorageSnapshot()
    expect(snapshot).toHaveLength(1)
    expect(snapshot[0].phoneNumber).toBe('***6789')
    expect(snapshot[0].location).toBe('Leeds')

    const removed = removeMockAlert('+447123456789', 'Leeds', 53.8, -1.5)
    expect(removed).toBe(true)

    trySetupMockAlert({
      phoneNumber: '07123456789',
      alertType: 'sms',
      locationId: 'loc-2',
      sanitizedLocation: 'York',
      latitude: 53.95,
      longitude: -1.08
    })

    const count = clearMockAlerts()
    expect(count).toBe(1)
    expect(getMockAlerts()).toHaveLength(0)
  })

  it('handles non-string and non-digit phone inputs defensively', () => {
    const nonStringPhone = trySetupMockAlert({
      phoneNumber: null,
      alertType: 'sms',
      locationId: 'null-phone',
      sanitizedLocation: 'Leeds',
      latitude: 53.8,
      longitude: -1.5
    })

    const noDigitsPhone = trySetupMockAlert({
      phoneNumber: 'abc',
      alertType: 'sms',
      locationId: 'no-digits',
      sanitizedLocation: 'York',
      latitude: 53.95,
      longitude: -1.08
    })

    const noLeadingZeroOr44 = trySetupMockAlert({
      phoneNumber: '7123456789',
      alertType: 'sms',
      locationId: 'plain-digits',
      sanitizedLocation: 'Hull',
      latitude: 53.74,
      longitude: -0.34
    })

    expect(nonStringPhone.ok).toBe(true)
    expect(noDigitsPhone.ok).toBe(true)
    expect(noLeadingZeroOr44.ok).toBe(true)
    expect(nonStringPhone.data.phoneNumber).toBe('****')
    expect(noDigitsPhone.data.phoneNumber).toBe('****')
    expect(noLeadingZeroOr44.data.phoneNumber).toBe('***6789')
  })

  it('handles non-string location and undefined phone masks in fallback paths', () => {
    const nonStringLocation = trySetupMockAlert({
      phoneNumber: '07123456789',
      alertType: 'sms',
      locationId: null,
      sanitizedLocation: { name: 'Leeds' },
      latitude: 53.8,
      longitude: -1.5
    })

    const fallbackWithNonStringPhone = tryFallbackMockSetup({
      result: { ok: false, status: 503 },
      mockSetupAlertEnabled: true,
      phoneNumber: { raw: '07123456789' },
      alertType: 'sms',
      locationId: 'obj-phone',
      sanitizedLocation: 'Leeds',
      latitude: 53.8,
      longitude: -1.5
    })

    const removed = removeMockAlert(undefined, 'Leeds', 53.8, -1.5)

    expect(nonStringLocation.ok).toBe(true)
    expect(fallbackWithNonStringPhone.ok).toBe(true)
    expect(fallbackWithNonStringPhone.data.phoneNumber).toBeUndefined()
    expect(removed).toBe(false)
  })
})
