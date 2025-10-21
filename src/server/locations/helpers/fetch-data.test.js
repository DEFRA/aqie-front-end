import { describe, it, expect, vi } from 'vitest'
import {
  fetchMeasurements,
  handleUKLocationData,
  handleNILocationData,
  fetchForecasts,
  refreshOAuthToken
} from './fetch-data.js'

describe('fetchMeasurements', () => {
  it('returns mock data in test mode', async () => {
    const di = {
      isTestMode: () => true,
      logger: { info: vi.fn() }
    }
    const result = await fetchMeasurements(51.5, -0.1, true, di)
    expect(result).toEqual([{ measurement: 'mock-measurement' }])
    expect(di.logger.info).toHaveBeenCalledWith(
      'Test mode: fetchMeasurements returning mock measurements'
    )
  })

  it('calls API in production mode', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: { get: vi.fn((key) => 'mock-url') },
      catchFetchError: vi.fn(async () => [200, [{ measurement: 'real' }]]),
      options: {},
      optionsEphemeralProtected: {},
      nodeEnv: 'production'
    }
    const result = await fetchMeasurements(51.5, -0.1, false, di)
    expect(result).toEqual([{ measurement: 'real' }])
    expect(di.logger.info).toHaveBeenCalledWith('Data fetched successfully.')
  })
})

describe('handleUKLocationData', () => {
  it('returns mock data in test mode', async () => {
    const di = {
      isTestMode: () => true,
      logger: { info: vi.fn() }
    }
    const result = await handleUKLocationData({}, '', '', di)
    expect(result).toEqual({ results: ['ukData'] })
    expect(di.logger.info).toHaveBeenCalledWith(
      'Test mode: handleUKLocationData returning mock data'
    )
  })
})

describe('handleNILocationData', () => {
  it('returns mock data in test mode', async () => {
    const di = {
      isTestMode: () => true,
      logger: { info: vi.fn() }
    }
    const result = await handleNILocationData({}, {}, di)
    expect(result).toEqual({ results: ['niData'] })
    expect(di.logger.info).toHaveBeenCalledWith(
      'Test mode: handleNILocationData returning mock data'
    )
  })
})

describe('fetchForecasts', () => {
  it('returns mock forecasts in test mode', async () => {
    const di = {
      isTestMode: () => true,
      logger: { info: vi.fn() }
    }
    const result = await fetchForecasts(di)
    expect(result).toEqual({ forecasts: 'mock-forecasts' })
    expect(di.logger.info).toHaveBeenCalledWith(
      'Test mode: fetchForecasts returning mock forecasts'
    )
  })
})

describe('refreshOAuthToken', () => {
  it('returns mock token in test mode', async () => {
    const di = {
      isTestMode: () => true,
      logger: { info: vi.fn() }
    }
    const request = { yar: { clear: vi.fn(), set: vi.fn() } }
    const result = await refreshOAuthToken(request, di)
    expect(result).toEqual({ accessToken: 'mock-token' })
    expect(di.logger.info).toHaveBeenCalledWith(
      'Test mode: refreshOAuthToken returning mock token'
    )
  })
})
