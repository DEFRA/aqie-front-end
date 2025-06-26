import { filterMatches } from './filter-matches'
import {
  hasExactMatch,
  splitAndCheckSpecificWords
} from '~/src/server/locations/helpers/convert-string'
import { searchTermsAndBorough } from '~/src/server/locations/helpers/search-terms-borough'
import { searchTermsAndUnitary } from '~/src/server/locations/helpers/search-terms-unitary'

jest.mock('~/src/server/locations/helpers/convert-string')
jest.mock('~/src/server/locations/helpers/search-terms-borough')
jest.mock('~/src/server/locations/helpers/search-terms-unitary')

describe('filterMatches', () => {
  it('should match based on borough', () => {
    const item = {
      GAZETTEER_ENTRY: {
        NAME1: 'Test Name1',
        DISTRICT_BOROUGH: 'Test Borough'
      }
    }
    const criteria = {
      searchTerms: 'Test',
      secondSearchTerm: 'Borough',
      isFullPostcode: false,
      userLocation: ''
    }

    hasExactMatch.mockReturnValue(true)
    searchTermsAndBorough.mockReturnValue(true)

    const result = filterMatches(item, criteria)

    expect(result).toBe(true)
  })

  it('should match based on unitary', () => {
    const item = {
      GAZETTEER_ENTRY: {
        NAME1: 'Test Name1',
        NAME2: 'Test Name2',
        COUNTY_UNITARY: 'Test Unitary'
      }
    }
    const criteria = {
      searchTerms: 'Test',
      secondSearchTerm: 'Unitary',
      isFullPostcode: false,
      userLocation: ''
    }

    hasExactMatch.mockReturnValue(true)
    searchTermsAndUnitary.mockReturnValue(true)

    const result = filterMatches(item, criteria)

    expect(result).toBe(true)
  })

  it('should match based on full postcode', () => {
    const item = {
      GAZETTEER_ENTRY: {
        NAME1: 'TestPostcode'
      }
    }
    const criteria = {
      searchTerms: '',
      secondSearchTerm: '',
      isFullPostcode: true,
      userLocation: 'TestPostcode'
    }

    const result = filterMatches(item, criteria)

    expect(result).toBe(true)
  })

  it('should match based on generic matching', () => {
    const item = {
      GAZETTEER_ENTRY: {
        NAME1: 'GenericName1',
        NAME2: 'GenericName2'
      }
    }
    const criteria = {
      searchTerms: '',
      secondSearchTerm: '',
      isFullPostcode: false,
      userLocation: 'GenericName1'
    }

    splitAndCheckSpecificWords.mockReturnValue(true)

    const result = filterMatches(item, criteria)

    expect(result).toBe(true)
  })

  it('should return false when no match is found', () => {
    const item = {
      GAZETTEER_ENTRY: {
        NAME1: 'NoMatchName1',
        NAME2: 'NoMatchName2'
      }
    }
    const criteria = {
      searchTerms: '',
      secondSearchTerm: '',
      isFullPostcode: false,
      userLocation: 'NonMatchingLocation'
    }

    splitAndCheckSpecificWords.mockReturnValue(false)

    const result = filterMatches(item, criteria)

    expect(result).toBe(false)
  })
})
