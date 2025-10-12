import { searchTermsAndUnitary } from './search-terms-unitary.js'

describe('searchTermsAndUnitary', () => {
  test('returns true when name2 matches searchTerms and secondSearchTerm is UNDEFINED', () => {
    expect(
      searchTermsAndUnitary(
        'hello world',
        'name1',
        'HELLO WORLD',
        'UNDEFINED',
        'unitary',
        true,
        true
      )
    ).toBe(true)
  })

  test('returns false when name2 does not match searchTerms and secondSearchTerm is UNDEFINED', () => {
    expect(
      searchTermsAndUnitary(
        'hello world',
        'name1',
        'world hello',
        'UNDEFINED',
        'unitary',
        true,
        true
      )
    ).toBe(false)
  })

  test('returns true when name2 matches searchTerms and secondSearchTerm matches unitary', () => {
    expect(
      searchTermsAndUnitary(
        'hello world',
        'name1',
        'HELLO WORLD',
        'UNITARY',
        'UNITARY',
        true,
        true
      )
    ).toBe(true)
  })

  test('returns false when name2 matches searchTerms but secondSearchTerm does not match unitary', () => {
    expect(
      searchTermsAndUnitary(
        'hello world',
        'name1',
        'HELLO WORLD',
        'unitary',
        'different',
        true,
        true
      )
    ).toBe(false)
  })

  test('returns true when name1 matches searchTerms and secondSearchTerm is UNDEFINED', () => {
    expect(
      searchTermsAndUnitary(
        'hello world',
        'HELLO WORLD',
        null, // No name2, so it will use name1 path
        'UNDEFINED',
        'unitary',
        true,
        true
      )
    ).toBe(true)
  })

  test('returns false when name1 does not match searchTerms and secondSearchTerm is UNDEFINED', () => {
    expect(
      searchTermsAndUnitary(
        'hello world',
        'world hello',
        'name2',
        'UNDEFINED',
        'unitary',
        true,
        true
      )
    ).toBe(false)
  })

  test('returns false when exactWordFirstTerm is false', () => {
    expect(
      searchTermsAndUnitary(
        'hello world',
        'name1',
        'name2',
        'secondSearchTerm',
        'unitary',
        false,
        true
      )
    ).toBe(false)
  })

  test('returns false when exactWordSecondTerm is false', () => {
    expect(
      searchTermsAndUnitary(
        'hello world',
        'name1',
        'name2',
        'secondSearchTerm',
        'unitary',
        true,
        false
      )
    ).toBe(false)
  })

  test('returns true when name1 matches searchTerms and secondSearchTerm matches unitary', () => {
    expect(
      searchTermsAndUnitary(
        'hello world',
        'HELLO WORLD',
        null, // No name2, so it will use name1 path
        'UNITARY',
        'UNITARY',
        true,
        true
      )
    ).toBe(true)
  })

  test('returns false when name1 matches searchTerms but secondSearchTerm does not match unitary', () => {
    expect(
      searchTermsAndUnitary(
        'hello world',
        'HELLO WORLD',
        'name2',
        'unitary',
        'different',
        true,
        true
      )
    ).toBe(false)
  })

  test('handles empty string input for searchTerms', () => {
    expect(
      searchTermsAndUnitary(
        '',
        'name1',
        'name2',
        'secondSearchTerm',
        'unitary',
        true,
        true
      )
    ).toBe(false)
  })

  test('handles empty string input for name1', () => {
    expect(
      searchTermsAndUnitary(
        'hello world',
        '',
        'name2',
        'secondSearchTerm',
        'unitary',
        true,
        true
      )
    ).toBe(false)
  })

  test('handles empty string input for name2', () => {
    expect(
      searchTermsAndUnitary(
        'hello world',
        'name1',
        '',
        'secondSearchTerm',
        'unitary',
        true,
        true
      )
    ).toBe(false)
  })

  test('handles empty string input for secondSearchTerm', () => {
    expect(
      searchTermsAndUnitary(
        'hello world',
        'name1',
        'name2',
        '',
        'unitary',
        true,
        true
      )
    ).toBe(false)
  })

  test('handles empty string input for unitary', () => {
    expect(
      searchTermsAndUnitary(
        'hello world',
        'name1',
        'name2',
        'secondSearchTerm',
        '',
        true,
        true
      )
    ).toBe(false)
  })

  test('handles null input for searchTerms', () => {
    expect(
      searchTermsAndUnitary(
        null,
        'name1',
        'name2',
        'secondSearchTerm',
        'unitary',
        true,
        true
      )
    ).toBe(false)
  })

  test('handles null input for name1', () => {
    expect(
      searchTermsAndUnitary(
        'hello world',
        null,
        'name2',
        'secondSearchTerm',
        'unitary',
        true,
        true
      )
    ).toBe(false)
  })

  test('handles null input for name2', () => {
    expect(
      searchTermsAndUnitary(
        'hello world',
        'name1',
        null,
        'secondSearchTerm',
        'unitary',
        true,
        true
      )
    ).toBe(false)
  })

  test('handles null input for secondSearchTerm', () => {
    expect(
      searchTermsAndUnitary(
        'hello world',
        'name1',
        'name2',
        null,
        'unitary',
        true,
        true
      )
    ).toBe(false)
  })

  test('handles null input for unitary', () => {
    expect(
      searchTermsAndUnitary(
        'hello world',
        'name1',
        'name2',
        'secondSearchTerm',
        null,
        true,
        true
      )
    ).toBe(false)
  })
})
