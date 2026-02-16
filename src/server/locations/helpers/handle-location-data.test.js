import { describe, it, expect, vi } from 'vitest'
import { handleUKLocationData, handleNILocationData } from './fetch-data.js'

// '' Mock NI places helper to avoid network calls in unit tests
vi.mock('./get-ni-places.js', () => ({
  getNIPlaces: vi.fn().mockResolvedValue({ results: ['niData'] })
}))

describe('handleUKLocationData more branches', () => {
  it('calls getOSPlacesHelper when conditions are met', async () => {
    const getOSPlacesHelper = vi.fn().mockResolvedValue({ results: ['ok'] })
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      config: { get: vi.fn(() => 'test-key') },
      getOSPlacesHelper,
      buildUKLocationFilters: vi.fn(() => ({})),
      combineUKSearchTerms: vi.fn((a, _b) => a),
      isValidFullPostcodeUK: vi.fn(() => true),
      isValidPartialPostcodeUK: vi.fn(() => false),
      buildUKApiUrl: vi.fn(() => 'url'),
      shouldCallUKApi: vi.fn(() => true),
      symbolsArray: [],
      options: {},
      request: {},
      searchTerms: 'test',
      secondSearchTerm: ''
    }
    const result = await handleUKLocationData('test', di)
    expect(result).toBeDefined()
    expect(getOSPlacesHelper).toHaveBeenCalledWith(
      'test',
      'test',
      '',
      true,
      {},
      {},
      undefined
    )
  })
})

describe('handleUKLocationData edge cases', () => {
  it('returns empty results and warns if OS key missing', async () => {
    const di = {
      isTestMode: () => false,
      logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
      config: { get: vi.fn((key) => (key === 'osNamesApiKey' ? '' : 'url')) },
      buildUKLocationFilters: vi.fn(() => ({})),
      combineUKSearchTerms: vi.fn((a, _b) => a),
      isValidFullPostcodeUK: vi.fn(() => false),
      isValidPartialPostcodeUK: vi.fn(() => false),
      buildUKApiUrl: vi.fn(() => null),
      shouldCallUKApi: vi.fn(() => true),
      symbolsArray: [],
      options: {},
      request: {},
      searchTerms: '',
      secondSearchTerm: ''
    }
    const result = await handleUKLocationData({}, di)
    expect(result).toEqual({ results: [] })
    expect(di.logger.warn).toHaveBeenCalledWith(
      'OS_NAMES_API_KEY not set; skipping OS Names API call and returning empty results.'
    )
  })
})

describe('handleUKLocationData', () => {
  it('returns mock data in test mode', async () => {
    const di = {
      isTestMode: () => true,
      logger: { info: vi.fn() }
    }
    const result = await handleUKLocationData('postcode', di)
    expect(result).toEqual({ results: ['ukData'] })
    expect(di.logger.info).toHaveBeenCalledWith(
      'Test mode: handleUKLocationData returning mock data'
    )
  })
})

describe('handleNILocationData more branches', () => {
  it('returns { results: ["niData"] } in test mode', async () => {
    const di = {
      logger: { info: vi.fn(), error: vi.fn() },
      isTestMode: () => true
    }
    const result = await handleNILocationData('postcode', di)
    expect(result).toEqual({ results: ['niData'] })
  })

  it('calls getNIPlaces in non-test mode', async () => {
    const di = {
      logger: { info: vi.fn(), error: vi.fn() },
      isTestMode: () => false
    }
    const result = await handleNILocationData('BT1 1AA', di)
    expect(result).toBeDefined()
  })
})

describe('handleNILocationData', () => {
  it('returns mock data in test mode', async () => {
    const di = {
      isTestMode: () => true,
      logger: { info: vi.fn() }
    }
    const result = await handleNILocationData('postcode', di)
    expect(result).toEqual({ results: ['niData'] })
  })
})
