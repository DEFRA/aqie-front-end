import { describe, it, expect, vi } from 'vitest'
import { fetchMeasurements } from './fetch-data.js'
import {
  STATUS_OK,
  STATUS_NOT_FOUND,
  STATUS_INTERNAL_SERVER_ERROR
} from '../../data/constants.js'

// Test constants
const TEST_LATITUDE = 51.5
const TEST_LONGITUDE = -0.1

describe('fetchMeasurements edge branches', () => {
  it('uses ephemeralProtectedDevApiUrl in development for newRicardo', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: {
        get: vi.fn((key) =>
          key === 'ephemeralProtectedDevApiUrl' ? 'dev-url' : 'base-url'
        )
      },
      catchFetchError: vi.fn(async () => [STATUS_OK, [{ measurement: 'dev' }]]),
      options: {},
      optionsEphemeralProtected: {},
      nodeEnv: 'development'
    }
    const result = await fetchMeasurements(
      TEST_LATITUDE,
      TEST_LONGITUDE,
      true,
      {
        ...di,
        request: {}
      }
    )
    expect(result).toEqual([{ measurement: 'dev' }])
    expect(di.logger.info).toHaveBeenCalledWith(
      expect.stringContaining('New Ricardo measurements API URL:')
    )
  })

  it('calls old measurements API if useNewRicardoMeasurementsEnabled is false', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: { get: vi.fn((_key) => 'old-url') },
      catchFetchError: vi.fn(async () => [STATUS_OK, [{ measurement: 'old' }]]),
      options: {},
      optionsEphemeralProtected: {},
      nodeEnv: 'production'
    }
    const result = await fetchMeasurements(
      TEST_LATITUDE,
      TEST_LONGITUDE,
      false,
      {
        ...di,
        request: {}
      }
    )
    expect(result).toEqual([{ measurement: 'old' }])
    expect(di.logger.info).toHaveBeenCalledWith(
      'Old measurements API URL: old-url'
    )
  })
})

describe('fetchMeasurements additional coverage', () => {
  it('returns [] and logs error if fetchDataFromApi throws', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: {
        get: vi.fn((key) => {
          if (key === 'measurementsApiUrl') {
            throw new Error('fail')
          }
          return 'mock-url'
        })
      },
      catchFetchError: vi.fn(),
      options: {},
      optionsEphemeralProtected: {},
      nodeEnv: 'production'
    }
    const result = await fetchMeasurements(
      TEST_LATITUDE,
      TEST_LONGITUDE,
      false,
      {
        ...di,
        request: {}
      }
    )
    expect(result).toEqual([])
    expect(di.logger.error).toHaveBeenCalled()
  })

  it('returns [] if fetchDataFromApi returns non-200 status', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: { get: vi.fn((_key) => 'mock-url') },
      catchFetchError: vi.fn(async () => [
        STATUS_NOT_FOUND,
        { message: 'not found' }
      ]),
      options: {},
      optionsEphemeralProtected: {},
      nodeEnv: 'production'
    }
    const result = await fetchMeasurements(
      TEST_LATITUDE,
      TEST_LONGITUDE,
      false,
      {
        ...di,
        request: {}
      }
    )
    expect(result).toEqual([])
    expect(di.logger.error).toHaveBeenCalledWith(
      'Error fetching data: not found'
    )
  })
})

describe('fetchMeasurements error handling', () => {
  it('returns empty array and logs error if API fails', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: { get: vi.fn((_key) => 'mock-url') },
      catchFetchError: vi.fn(async () => [
        STATUS_INTERNAL_SERVER_ERROR,
        { message: 'fail' }
      ]),
      options: {},
      optionsEphemeralProtected: {},
      nodeEnv: 'production'
    }
    const result = await fetchMeasurements(
      TEST_LATITUDE,
      TEST_LONGITUDE,
      false,
      {
        ...di,
        request: {}
      }
    )
    expect(result).toEqual([])
    expect(di.logger.error).toHaveBeenCalledWith('Error fetching data: fail')
  })

  it('returns empty array if config.get throws', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: {
        get: vi.fn(() => {
          throw new Error('config fail')
        })
      },
      catchFetchError: vi.fn(),
      options: {},
      optionsEphemeralProtected: {},
      nodeEnv: 'production'
    }
    const result = await fetchMeasurements(
      TEST_LATITUDE,
      TEST_LONGITUDE,
      false,
      {
        ...di,
        request: {}
      }
    )
    expect(result).toEqual([])
  })
})
