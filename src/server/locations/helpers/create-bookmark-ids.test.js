import { createURLRouteBookmarks } from './create-bookmark-ids.js'
import {
  convertStringToHyphenatedLowercaseWords,
  isValidFullPostcodeUK
} from './convert-string.js'

vi.mock('./convert-string.js', () => ({
  convertStringToHyphenatedLowercaseWords: vi.fn(),
  isValidFullPostcodeUK: vi.fn()
}))

describe('createURLRouteBookmarks', () => {
  beforeEach(() => {
    convertStringToHyphenatedLowercaseWords.mockImplementation((str) =>
      str.replace(/\s+/g, '-').toLowerCase()
    )
    isValidFullPostcodeUK.mockImplementation((postcode) =>
      /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(postcode)
    )
  })

  test('creates URL route bookmarks with valid postcode', () => {
    const selectedMatchesAddedIDs = [
      {
        GAZETTEER_ENTRY: {
          NAME1: 'SW1A 1AA',
          ID: '',
          DISTRICT_BOROUGH: '',
          COUNTY_UNITARY: ''
        }
      }
    ]
    const result = createURLRouteBookmarks(selectedMatchesAddedIDs)
    expect(result.selectedMatchesAddedIDs[0].GAZETTEER_ENTRY.ID).toBe('sw1a1aa')
  })

  test('creates URL route bookmarks with district borough and name2', () => {
    const selectedMatchesAddedIDs = [
      {
        GAZETTEER_ENTRY: {
          NAME1: 'Name1',
          NAME2: 'Name2',
          DISTRICT_BOROUGH: 'District',
          COUNTY_UNITARY: '',
          ID: ''
        }
      }
    ]
    const result = createURLRouteBookmarks(selectedMatchesAddedIDs)
    expect(result.selectedMatchesAddedIDs[0].GAZETTEER_ENTRY.ID).toBe(
      'name2_district'
    )
  })

  test('creates URL route bookmarks with district borough and name1', () => {
    const selectedMatchesAddedIDs = [
      {
        GAZETTEER_ENTRY: {
          NAME1: 'Name1',
          NAME2: '',
          DISTRICT_BOROUGH: 'District',
          COUNTY_UNITARY: '',
          ID: 'Name1_District'
        }
      }
    ]
    const result = createURLRouteBookmarks(selectedMatchesAddedIDs)
    expect(result.selectedMatchesAddedIDs[0].GAZETTEER_ENTRY.ID).toBe(
      'name1_district'
    )
  })

  test('creates URL route bookmarks with county unitary and name2', () => {
    const selectedMatchesAddedIDs = [
      {
        GAZETTEER_ENTRY: {
          NAME1: 'Name1',
          NAME2: 'Name2',
          DISTRICT_BOROUGH: '',
          COUNTY_UNITARY: 'County',
          ID: ''
        }
      }
    ]
    const result = createURLRouteBookmarks(selectedMatchesAddedIDs)
    expect(result.selectedMatchesAddedIDs[0].GAZETTEER_ENTRY.ID).toBe(
      'name2_county'
    )
  })

  test('creates URL route bookmarks with county unitary and name1', () => {
    const selectedMatchesAddedIDs = [
      {
        GAZETTEER_ENTRY: {
          NAME1: 'Name1',
          NAME2: '',
          DISTRICT_BOROUGH: '',
          COUNTY_UNITARY: 'County',
          ID: ''
        }
      }
    ]
    const result = createURLRouteBookmarks(selectedMatchesAddedIDs)
    expect(result.selectedMatchesAddedIDs[0].GAZETTEER_ENTRY.ID).toBe(
      'name1_county'
    )
  })

  test('handles empty selectedMatchesAddedIDs array', () => {
    const selectedMatchesAddedIDs = []
    const result = createURLRouteBookmarks(selectedMatchesAddedIDs)
    expect(result.selectedMatchesAddedIDs).toEqual([])
  })

  test('handles missing GAZETTEER_ENTRY properties', () => {
    const selectedMatchesAddedIDs = [
      { GAZETTEER_ENTRY: { NAME1: 'Name1', ID: '' } }
    ]
    const result = createURLRouteBookmarks(selectedMatchesAddedIDs)
    expect(result.selectedMatchesAddedIDs[0].GAZETTEER_ENTRY.ID).toBe(
      'name1_undefined'
    )
  })
})
