import { routesTitles } from './routes-titles-util'
import { convertStringToHyphenatedLowercaseWords } from './convert-string.js'

vi.mock('./convert-string.js')

beforeEach(() => {
  convertStringToHyphenatedLowercaseWords.mockImplementation((str) =>
    str.toLowerCase().replace(/ /g, '-')
  )
})

describe('routesTitles', () => {
  it('should generate route paths with district and name2', () => {
    const matches = [
      {
        GAZETTEER_ENTRY: {
          NAME2: 'Name2',
          DISTRICT_BOROUGH: 'District'
        }
      }
    ]
    const locationNameOrPostcode = 'Location'
    const result = routesTitles(matches, locationNameOrPostcode)

    expect(result[0].GAZETTEER_ENTRY.ROUTE_PATH).toBe('name2,-district')
  })

  it('should generate route paths with district and name1 if name2 is not present', () => {
    const matches = [
      {
        GAZETTEER_ENTRY: {
          NAME1: 'Name1',
          DISTRICT_BOROUGH: 'District'
        }
      }
    ]
    const locationNameOrPostcode = 'Location'
    const result = routesTitles(matches, locationNameOrPostcode)

    expect(result[0].GAZETTEER_ENTRY.ROUTE_PATH).toBe('name1,-district')
  })

  it('should generate route paths with county and location name or postcode if district is not present', () => {
    const matches = [
      {
        GAZETTEER_ENTRY: {
          COUNTY_UNITARY: 'County'
        }
      }
    ]
    const locationNameOrPostcode = 'Location'
    const result = routesTitles(matches, locationNameOrPostcode)

    expect(result[0].GAZETTEER_ENTRY.ROUTE_PATH).toBe('location,-county')
  })

  it('should handle empty matches array', () => {
    const matches = []
    const locationNameOrPostcode = 'Location'
    const result = routesTitles(matches, locationNameOrPostcode)

    expect(result).toEqual([])
  })
})
