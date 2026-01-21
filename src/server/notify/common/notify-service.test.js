/* global describe, test, expect, beforeEach, vi */

import {
  clearMockAlerts,
  getMockAlertStorageSnapshot,
  setupAlert
} from '../../common/services/notify.js'

vi.mock('../../../config/index.js', () => {
  const configStore = new Map([
    ['notify.enabled', true],
    ['notify.setupAlertPath', '/api/setup-alert'],
    ['notify.alertBackendBaseUrl', 'https://backend.example'],
    ['notify.mockSetupAlertEnabled', true]
  ])

  return {
    config: {
      get: (key) => configStore.get(key)
    }
  }
})

vi.mock('../../common/helpers/backend-api-helper.js', () => ({
  buildBackendApiFetchOptions: (_request, baseUrl, apiPath, options) => ({
    url: `${baseUrl}${apiPath}`,
    fetchOptions: {
      method: options.method,
      body: options.body
    }
  })
}))

vi.mock('../../common/helpers/catch-fetch-error.js', () => ({
  catchFetchError: async () => [503, { message: 'Service unavailable' }]
}))

vi.mock('../../common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: () => {},
    warn: () => {},
    error: () => {}
  })
}))

describe('notify service - mock alert storage', () => {
  beforeEach(() => {
    clearMockAlerts()
  })

  test('getMockAlertStorageSnapshot returns coordinates and masked phone number', async () => {
    const phoneNumber = '07700900982'
    const location = 'Air quality in London, City of Westminster'

    const result = await setupAlert(
      phoneNumber,
      'sms',
      location,
      'location-id-123',
      '51.5007',
      '-0.1246',
      null
    )

    expect(result.ok).toBe(true)
    expect(result.data).toEqual(
      expect.objectContaining({
        mock: true,
        phoneNumber: '***0982'
      })
    )

    const snapshot = getMockAlertStorageSnapshot()
    expect(snapshot).toHaveLength(1)
    expect(snapshot[0]).toEqual(
      expect.objectContaining({
        phoneNumber: '***0982',
        location: 'London, City of Westminster',
        latitude: 51.5007,
        longitude: -0.1246
      })
    )
  })

  test('setupAlert returns 409 for same phone + locationId (duplicate)', async () => {
    const phoneNumberNational = '07700900982'
    const phoneNumberE164 = '+447700900982'
    const locationId = 'n87ge'

    const first = await setupAlert(
      phoneNumberNational,
      'sms',
      'N8 7GE, Haringey',
      locationId,
      '51.5885',
      '-0.1139',
      null
    )

    expect(first.ok).toBe(true)

    // Same locationId + logically same phone, but different display string
    const second = await setupAlert(
      phoneNumberE164,
      'sms',
      'N8 7GE, Hornsey',
      locationId,
      '51.5885',
      '-0.1139',
      null
    )

    expect(second.ok).toBe(false)
    expect(second.status).toBe(409)
    expect(second.data).toEqual(
      expect.objectContaining({
        message: expect.stringContaining('Alert already exists')
      })
    )

    const snapshot = getMockAlertStorageSnapshot()
    expect(snapshot).toHaveLength(1)
    expect(snapshot[0]).toEqual(
      expect.objectContaining({
        locationId
      })
    )
  })
})
