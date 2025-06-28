import { getNIData } from './get-ni-single-data.js'
import { sentenceCase } from '../../common/helpers/sentence-case.js'
import { LOCATION_TYPE_NI } from '../../data/constants.js'

vi.mock('../../common/helpers/sentence-case.js', () => ({
  sentenceCase: vi.fn()
}))

describe('getNIData', () => {
  beforeEach(() => {
    sentenceCase.mockImplementation(
      (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    )
  })

  test('returns resultNI with correct data when locationType is LOCATION_TYPE_NI', () => {
    const locationData = {
      urlRoute: 'route',
      results: [{ postcode: 'BT1 1AA', town: 'belfast' }]
    }
    const distance = { latlon: { lon: -5.9301, lat: 54.597 } }
    const locationType = LOCATION_TYPE_NI
    const result = getNIData(locationData, distance, locationType)
    expect(result.resultNI).toEqual([
      {
        GAZETTEER_ENTRY: {
          ID: 'route',
          NAME1: 'BT1 1AA',
          DISTRICT_BOROUGH: 'Belfast',
          LONGITUDE: -5.9301,
          LATITUDE: 54.597
        }
      }
    ])
  })

  test('returns empty resultNI when locationType is not LOCATION_TYPE_NI', () => {
    const locationData = {
      urlRoute: 'route',
      results: [{ postcode: 'BT1 1AA', town: 'belfast' }]
    }
    const distance = { latlon: { lon: -5.9301, lat: 54.597 } }
    const locationType = 'OTHER_TYPE'
    const result = getNIData(locationData, distance, locationType)
    expect(result.resultNI).toEqual([])
  })

  test.skip('handles missing locationData properties', () => {
    const locationData = { results: [{}] }
    const distance = { latlon: { lon: -5.9301, lat: 54.597 } }
    const locationType = LOCATION_TYPE_NI
    const result = getNIData(locationData, distance, locationType)
    expect(result.resultNI).toEqual([
      {
        GAZETTEER_ENTRY: {
          ID: undefined,
          NAME1: undefined,
          DISTRICT_BOROUGH: undefined,
          LONGITUDE: -5.9301,
          LATITUDE: 54.597
        }
      }
    ])
  })

  test('handles missing distance properties', () => {
    const locationData = {
      urlRoute: 'route',
      results: [{ postcode: 'BT1 1AA', town: 'belfast' }]
    }
    const distance = {}
    const locationType = LOCATION_TYPE_NI
    const result = getNIData(locationData, distance, locationType)
    expect(result.resultNI).toEqual([
      {
        GAZETTEER_ENTRY: {
          ID: 'route',
          NAME1: 'BT1 1AA',
          DISTRICT_BOROUGH: 'Belfast',
          LONGITUDE: undefined,
          LATITUDE: undefined
        }
      }
    ])
  })

  test('handles empty locationData', () => {
    const locationData = null
    const distance = { latlon: { lon: -5.9301, lat: 54.597 } }
    const locationType = LOCATION_TYPE_NI
    const result = getNIData(locationData, distance, locationType)
    expect(result.resultNI).toEqual([])
  })

  test('handles empty distance', () => {
    const locationData = {
      urlRoute: 'route',
      results: [{ postcode: 'BT1 1AA', town: 'belfast' }]
    }
    const distance = null
    const locationType = LOCATION_TYPE_NI
    const result = getNIData(locationData, distance, locationType)
    expect(result.resultNI).toEqual([
      {
        GAZETTEER_ENTRY: {
          ID: 'route',
          NAME1: 'BT1 1AA',
          DISTRICT_BOROUGH: 'Belfast',
          LONGITUDE: undefined,
          LATITUDE: undefined
        }
      }
    ])
  })

  test('handles empty locationType', () => {
    const locationData = {
      urlRoute: 'route',
      results: [{ postcode: 'BT1 1AA', town: 'belfast' }]
    }
    const distance = { latlon: { lon: -5.9301, lat: 54.597 } }
    const locationType = null
    const result = getNIData(locationData, distance, locationType)
    expect(result.resultNI).toEqual([])
  })
})
