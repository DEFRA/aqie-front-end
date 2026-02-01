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

  test('NI postcode normalization prevents duplicates with/without town name', async () => {
    // ''
    const phoneNumber = '07700900123'

    // First alert: BT1 1AA without town name
    const first = await setupAlert(
      phoneNumber,
      'sms',
      'BT1 1AA',
      null,
      '54.6024',
      '-5.9213',
      null
    )

    expect(first.ok).toBe(true)

    // Second alert: same postcode with town name - should be detected as duplicate
    const second = await setupAlert(
      phoneNumber,
      'sms',
      'BT1 1AA, Belfast',
      null,
      '54.6024',
      '-5.9213',
      null
    )

    expect(second.ok).toBe(false)
    expect(second.status).toBe(409)
    expect(second.data.message).toContain('Alert already exists')

    // Should only have one alert stored
    const snapshot = getMockAlertStorageSnapshot()
    expect(snapshot).toHaveLength(1)
  })

  test('NI postcode normalization handles different formatting', async () => {
    // ''
    const phoneNumber = '07700900456'
    const sameCoords = { lat: '54.5085', lon: '-7.8305' }

    // First alert: BT93 8AD with extra spaces
    const first = await setupAlert(
      phoneNumber,
      'sms',
      'BT93  8AD',
      null,
      sameCoords.lat,
      sameCoords.lon,
      null
    )

    expect(first.ok).toBe(true)

    // Second alert: same postcode normalized with town - should be duplicate
    const second = await setupAlert(
      phoneNumber,
      'sms',
      'BT93 8AD, Enniskillen',
      null,
      sameCoords.lat,
      sameCoords.lon,
      null
    )

    expect(second.ok).toBe(false)
    expect(second.status).toBe(409)

    const snapshot = getMockAlertStorageSnapshot()
    expect(snapshot).toHaveLength(1)
  })

  test('Non-NI locations are not affected by postcode normalization', async () => {
    // ''
    const phoneNumber = '07700900789'

    // First alert: London
    const first = await setupAlert(
      phoneNumber,
      'sms',
      'London, City of Westminster',
      null,
      '51.5069',
      '-0.1261',
      null
    )

    expect(first.ok).toBe(true)

    // Second alert: Different London location - should NOT be duplicate
    const second = await setupAlert(
      phoneNumber,
      'sms',
      'London, Camden',
      null,
      '51.5390',
      '-0.1426',
      null
    )

    expect(second.ok).toBe(true)

    const snapshot = getMockAlertStorageSnapshot()
    expect(snapshot).toHaveLength(2)
  })
})
