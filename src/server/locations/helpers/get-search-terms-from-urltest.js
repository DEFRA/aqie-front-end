import { getSearchTermsFromUrl } from './get-search-terms-from-url.js'
import { LOCATION_TYPE_NI, LOCATION_TYPE_UK } from '../../data/constants.js' // Updated imports to use relative paths

// describe('getSearchTermsFromUrl', () => {
//   it('should return correct search terms for English location', () => {
//     const url = 'https://example.com/location/en/some-location/AB12-3CD'
//     const result = getSearchTermsFromUrl(url)
//     expect(result).toEqual({
//       searchTerms: 'AB12 3CD',
//       secondSearchTerm: 'some location',
//       searchTermsLang: 'en',
//       searchTermsLocationType: LOCATION_TYPE_UK
//     })
//   })

//   it('should return correct search terms for Welsh location', () => {
//     const url = 'https://example.com/lleoliad/cy/rhyw-le/BT12-3CD'
//     const result = getSearchTermsFromUrl(url)
//     expect(result).toEqual({
//       searchTerms: 'BT12 3CD',
//       secondSearchTerm: 'rhyw le',
//       searchTermsLang: 'cy',
//       searchTermsLocationType: LOCATION_TYPE_NI
//     })
//   })

//   it('should handle URLs without a query string', () => {
//     const url = 'https://example.com/location/en/some-location/AB12-3CD'
//     const result = getSearchTermsFromUrl(url)
//     expect(result).toEqual({
//       searchTerms: 'AB12 3CD',
//       secondSearchTerm: 'some location',
//       searchTermsLang: 'en',
//       searchTermsLocationType: LOCATION_TYPE_UK
//     })
//   })

//   it('should handle URLs with a query string', () => {
//     const url =
//       'https://example.com/location/en/some-location/AB12-3CD?query=param'
//     const result = getSearchTermsFromUrl(url)
//     expect(result).toEqual({
//       searchTerms: 'AB12 3CD',
//       secondSearchTerm: 'some location',
//       searchTermsLang: 'en',
//       searchTermsLocationType: LOCATION_TYPE_UK
//     })
//   })

//   it('should handle URLs without a postcode', () => {
//     const url = 'https://example.com/location/en/some-location/some-place'
//     const result = getSearchTermsFromUrl(url)
//     expect(result).toEqual({
//       searchTerms: 'some place',
//       secondSearchTerm: '',
//       searchTermsLang: 'en',
//       searchTermsLocationType: LOCATION_TYPE_UK
//     })
//   })

//   it('should handle URLs with Northern Ireland postcode', () => {
//     const url = 'https://example.com/location/en/some-location/BT12-3CD'
//     const result = getSearchTermsFromUrl(url)
//     expect(result).toEqual({
//       searchTerms: 'BT12 3CD',
//       secondSearchTerm: 'some location',
//       searchTermsLang: 'en',
//       searchTermsLocationType: LOCATION_TYPE_NI
//     })
//   })

//   it('should handle URLs with UK postcode', () => {
//     const url = 'https://example.com/location/en/some-location/SW1A-1AA'
//     const result = getSearchTermsFromUrl(url)
//     expect(result).toEqual({
//       searchTerms: 'SW1A 1AA',
//       secondSearchTerm: 'some location',
//       searchTermsLang: 'en',
//       searchTermsLocationType: LOCATION_TYPE_UK
//     })
//   })
// })

describe('getSearchTermsFromUrl', () => {
  it('should return correct search terms for English language and UK postcode', () => {
    const url = 'http://localhost:3000/location/n8-7ge_haringey'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: 'n8 7ge',
      secondSearchTerm: 'haringey',
      searchTermsLang: 'en',
      searchTermsLocationType: LOCATION_TYPE_UK
    })
  })

  it('should return correct search terms for Welsh language and Northern Ireland postcode', () => {
    const url =
      'http://localhost:3000/lleoliad/BT93-8AD_fermanagh-and-omagh?lang=cy'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: 'BT93 8AD',
      secondSearchTerm: 'fermanagh and omagh',
      searchTermsLang: 'cy',
      searchTermsLocationType: LOCATION_TYPE_NI
    })
  })

  it('should return correct search terms for URL without postcode', () => {
    const url = 'http://localhost:3000/location/slough_slough'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: 'slough',
      secondSearchTerm: 'slough',
      searchTermsLang: 'en',
      searchTermsLocationType: LOCATION_TYPE_UK
    })
  })
})
