import { describe, it, expect, vi } from 'vitest'
import { fetchMeasurementsTestMode } from './extracted/test-mode-helpers.js'
import {
  selectMeasurementsUrlAndOptions,
  callAndHandleMeasurementsResponse
} from './extracted/api-utils.js'

describe('fetchMeasurementsTestMode', () => {
  it('returns mock measurement and logs in test mode', () => {
    const logger = { info: vi.fn() }
    const result = fetchMeasurementsTestMode(() => true, logger)
    expect(result).toEqual([{ measurement: 'mock-measurement' }])
    expect(logger.info).toHaveBeenCalledWith(
      'Test mode: fetchMeasurements returning mock measurements'
    )
  })
  it('returns null if not in test mode', () => {
    const logger = { info: vi.fn() }
    const result = fetchMeasurementsTestMode(() => false, logger)
    expect(result).toBeNull()
  })
})

describe('selectMeasurementsUrlAndOptions', () => {
  const injectedConfig = {
    get: vi.fn((key) => {
      if (key === 'ricardoMeasurementsApiUrl') return 'ricardo-url'
      if (key === 'ephemeralProtectedDevApiUrl') return 'dev-url'
      if (key === 'measurementsApiUrl') return 'old-url'
      return ''
    })
  }
  const injectedLogger = { info: vi.fn() }
  it('returns new Ricardo API url and opts in production', () => {
    const result = selectMeasurementsUrlAndOptions(
      51.5,
      -0.1,
      true,
      injectedConfig,
      injectedLogger,
      'production',
      'dev-opts',
      'prod-opts'
    )
    expect(result.url).toContain('ricardo-url?')
    expect(result.opts).toBe('prod-opts')
  })
  it('returns dev url and opts in development', () => {
    const result = selectMeasurementsUrlAndOptions(
      51.5,
      -0.1,
      true,
      injectedConfig,
      injectedLogger,
      'development',
      'dev-opts',
      'prod-opts'
    )
    expect(result.url).toContain('dev-url/aqie-back-end/monitoringStationInfo?')
    expect(result.opts).toBe('dev-opts')
  })
  it('returns old API url and opts if not using new Ricardo', () => {
    const result = selectMeasurementsUrlAndOptions(
      51.5,
      -0.1,
      false,
      injectedConfig,
      injectedLogger,
      'production',
      'dev-opts',
      'prod-opts'
    )
    expect(result.url).toBe('old-url')
    expect(result.opts).toBe('prod-opts')
  })
})

describe('callAndHandleMeasurementsResponse', () => {
  it('returns data if status is 200', async () => {
    const injectedCatchFetchError = vi.fn(async () => [200, [{ foo: 'bar' }]])
    const injectedLogger = { info: vi.fn(), error: vi.fn() }
    const result = await callAndHandleMeasurementsResponse(
      'url',
      {},
      injectedCatchFetchError,
      injectedLogger
    )
    expect(result).toEqual([{ foo: 'bar' }])
    expect(injectedLogger.info).toHaveBeenCalledWith(
      'Data fetched successfully.'
    )
  })
  it('returns [] and logs error if status is not 200', async () => {
    const injectedCatchFetchError = vi.fn(async () => [
      500,
      { message: 'fail' }
    ])
    const injectedLogger = { info: vi.fn(), error: vi.fn() }
    const result = await callAndHandleMeasurementsResponse(
      'url',
      {},
      injectedCatchFetchError,
      injectedLogger
    )
    expect(result).toEqual([])
    expect(injectedLogger.error).toHaveBeenCalledWith(
      'Error fetching data: fail'
    )
  })
})
