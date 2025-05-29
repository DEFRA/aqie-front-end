import { searchTermsAndBorough } from '~/src/server/locations/helpers/search-terms-borough.js'

describe('searchTermsAndBorough', () => {
  test('returns false when exactWordFirstTerm is false', () => {
    expect(
      searchTermsAndBorough(
        'hello world',
        'name1',
        'secondSearchTerm',
        'borough',
        false,
        true
      )
    ).toBe(false)
  })

  test.skip('returns true when name1 matches searchTerms and secondSearchTerm is UNDEFINED', () => {
    expect(
      searchTermsAndBorough(
        'hello world',
        'HELLO WORLD',
        'UNDEFINED',
        'borough',
        true,
        true
      )
    ).toBe(true)
  })

  test('returns false when name1 does not match searchTerms and secondSearchTerm is UNDEFINED', () => {
    expect(
      searchTermsAndBorough(
        'hello world',
        'world hello',
        'UNDEFINED',
        'borough',
        true,
        true
      )
    ).toBe(false)
  })

  test.skip('returns true when name1 matches searchTerms and secondSearchTerm is empty', () => {
    expect(
      searchTermsAndBorough(
        'hello world',
        'HELLO WORLD',
        '',
        'borough',
        true,
        true
      )
    ).toBe(true)
  })

  test('returns false when name1 does not match searchTerms and secondSearchTerm is empty', () => {
    expect(
      searchTermsAndBorough(
        'hello world',
        'world hello',
        '',
        'borough',
        true,
        true
      )
    ).toBe(false)
  })

  test('returns false when exactWordSecondTerm is false', () => {
    expect(
      searchTermsAndBorough(
        'hello world',
        'name1',
        'secondSearchTerm',
        'borough',
        true,
        false
      )
    ).toBe(false)
  })

  test.skip('returns true when name1 matches searchTerms and secondSearchTerm matches borough', () => {
    expect(
      searchTermsAndBorough(
        'hello world',
        'HELLO WORLD',
        'BOROUGH',
        'BOROUGH',
        true,
        true
      )
    ).toBe(true)
  })

  test('returns false when name1 matches searchTerms but secondSearchTerm does not match borough', () => {
    expect(
      searchTermsAndBorough(
        'hello world',
        'HELLO WORLD',
        'borough',
        'different',
        true,
        true
      )
    ).toBe(false)
  })

  test('handles empty string input for searchTerms', () => {
    expect(
      searchTermsAndBorough(
        '',
        'name1',
        'secondSearchTerm',
        'borough',
        true,
        true
      )
    ).toBe(false)
  })

  test('handles empty string input for name1', () => {
    expect(
      searchTermsAndBorough(
        'hello world',
        '',
        'secondSearchTerm',
        'borough',
        true,
        true
      )
    ).toBe(false)
  })

  test.skip('handles empty string input for secondSearchTerm', () => {
    expect(
      searchTermsAndBorough('hello world', 'name1', '', 'borough', true, true)
    ).toBe(true)
  })

  test('handles empty string input for borough', () => {
    expect(
      searchTermsAndBorough(
        'hello world',
        'name1',
        'secondSearchTerm',
        '',
        true,
        true
      )
    ).toBe(false)
  })

  test('handles null input for searchTerms', () => {
    expect(
      searchTermsAndBorough(
        null,
        'name1',
        'secondSearchTerm',
        'borough',
        true,
        true
      )
    ).toBe(false)
  })

  test.skip('handles null input for name1', () => {
    expect(
      searchTermsAndBorough(
        'hello world',
        null,
        'secondSearchTerm',
        'borough',
        true,
        true
      )
    ).toBe(false)
  })

  test('handles null input for secondSearchTerm', () => {
    expect(
      searchTermsAndBorough('hello world', 'name1', null, 'borough', true, true)
    ).toBe(false)
  })

  test('handles null input for borough', () => {
    expect(
      searchTermsAndBorough(
        'hello world',
        'name1',
        'secondSearchTerm',
        null,
        true,
        true
      )
    ).toBe(false)
  })
})
