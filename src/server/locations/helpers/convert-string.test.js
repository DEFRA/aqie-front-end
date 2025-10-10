import {
  convertStringToHyphenatedLowercaseWords,
  removeLastWordAndAddHyphens,
  removeLastWordAndHyphens,
  splitAndKeepFirstWord,
  removeHyphensAndUnderscores,
  extractAndFormatUKPostcode,
  removeAllWordsAfterUnderscore,
  isValidPartialPostcodeUK,
  isValidFullPostcodeUK,
  isValidPartialPostcodeNI,
  isValidFullPostcodeNI,
  splitAndCheckSpecificWords,
  splitAndCheckExactWords,
  countWords,
  isOnlyLettersAndMoreThanFour,
  formatNorthernIrelandPostcode,
  hasExactMatch,
  hasCommonWord,
  formatUKPostcode,
  isOnlyWords,
  compareLastElements
} from './convert-string.js'

describe('convertStringToHyphenatedLowercaseWords', () => {
  it('should convert a string to lowercase words joined by hyphens and remove commas', () => {
    const input = 'London City Airport, Newham'
    const expectedOutput = 'london-city-airport-newham'
    expect(convertStringToHyphenatedLowercaseWords(input)).toBe(expectedOutput)
  })

  it('should handle strings without commas or hyphens', () => {
    const input = 'Reading Street Thanet'
    const expectedOutput = 'reading-street-thanet'
    expect(convertStringToHyphenatedLowercaseWords(input)).toBe(expectedOutput)
  })

  it('should handle strings with multiple spaces', () => {
    const input = 'London,   Little - Greater  London'
    const expectedOutput = 'london-little-greater-london'
    expect(convertStringToHyphenatedLowercaseWords(input)).toBe(expectedOutput)
  })

  it('should handle empty strings', () => {
    const input = ''
    const expectedOutput = ''
    expect(convertStringToHyphenatedLowercaseWords(input)).toBe(expectedOutput)
  })
})

describe('removeLastWordAndAddHyphens', () => {
  test('removes the last word and adds hyphens', () => {
    expect(removeLastWordAndAddHyphens('hello world example')).toBe(
      'hello-world'
    )
  })

  test('handles single word input', () => {
    expect(removeLastWordAndAddHyphens('hello')).toBe('')
  })

  test('handles empty string input', () => {
    expect(removeLastWordAndAddHyphens('')).toBe('')
  })
})

describe('removeLastWordAndHyphens', () => {
  test('removes the last word and hyphens', () => {
    expect(removeLastWordAndHyphens('hello-world example')).toBe('helloworld')
  })

  test('handles input without hyphens', () => {
    expect(removeLastWordAndHyphens('hello world example')).toBe('helloworld')
  })

  test('handles empty string input', () => {
    expect(removeLastWordAndHyphens('')).toBe('')
  })
})

describe('splitAndKeepFirstWord', () => {
  test('splits by underscore and keeps the first word', () => {
    expect(splitAndKeepFirstWord('hello_world_example')).toBe('hello')
  })

  test('handles input without underscores', () => {
    expect(splitAndKeepFirstWord('hello world example')).toBe(
      'hello world example'
    )
  })

  test('handles empty string input', () => {
    expect(splitAndKeepFirstWord('')).toBe('')
  })
})

describe('removeHyphensAndUnderscores', () => {
  test('removes hyphens and underscores', () => {
    expect(removeHyphensAndUnderscores('hello-world')).toBe('helloworld')
  })

  test('handles input without hyphens or underscores', () => {
    expect(removeHyphensAndUnderscores('hello world')).toBe('hello world')
  })

  test('handles empty string input', () => {
    expect(removeHyphensAndUnderscores('')).toBe('')
  })
})

describe('extractAndFormatUKPostcode', () => {
  test('extracts and formats UK postcode', () => {
    expect(extractAndFormatUKPostcode('SW1A 1AA')).toBe('SW1A 1AA')
    expect(extractAndFormatUKPostcode('SW1A1AA')).toBe('SW1A1AA')
    expect(extractAndFormatUKPostcode('invalid')).toBeNull()
  })

  test('handles input with partial postcode', () => {
    expect(extractAndFormatUKPostcode('SW1A')).toBe('SW1A')
  })

  test('handles input without postcode', () => {
    expect(extractAndFormatUKPostcode('hello world')).toBeNull()
  })
})

describe('removeAllWordsAfterUnderscore', () => {
  test('removes all words after underscore', () => {
    expect(removeAllWordsAfterUnderscore('hello_world_example')).toBe('hello')
  })

  test('handles input without underscores', () => {
    expect(removeAllWordsAfterUnderscore('hello world example')).toBe(
      'hello world example'
    )
  })

  test('handles empty string input', () => {
    expect(removeAllWordsAfterUnderscore('')).toBe('')
  })
})

describe('isValidPartialPostcodeUK', () => {
  test('validates partial UK postcode', () => {
    expect(isValidPartialPostcodeUK('SW1')).toBe(true)
    expect(isValidPartialPostcodeUK('invalid')).toBe(false)
  })

  test('handles lowercase input', () => {
    expect(isValidPartialPostcodeUK('sw1')).toBe(true)
  })

  test('handles empty string input', () => {
    expect(isValidPartialPostcodeUK('')).toBe(false)
  })
})

describe('isValidFullPostcodeUK', () => {
  test('validates full UK postcode', () => {
    expect(isValidFullPostcodeUK('SW1A 1AA')).toBe(true)
    expect(isValidFullPostcodeUK('invalid')).toBe(false)
  })

  test('handles lowercase input', () => {
    expect(isValidFullPostcodeUK('sw1a 1aa')).toBe(true)
  })

  test('handles empty string input', () => {
    expect(isValidFullPostcodeUK('')).toBe(false)
  })
})

describe('isValidPartialPostcodeNI', () => {
  test('validates partial NI postcode', () => {
    expect(isValidPartialPostcodeNI('BT1')).toBe(true)
    expect(isValidPartialPostcodeNI('invalid')).toBe(false)
  })

  test('handles lowercase input', () => {
    expect(isValidPartialPostcodeNI('bt1')).toBe(true)
  })

  test('handles empty string input', () => {
    expect(isValidPartialPostcodeNI('')).toBe(false)
  })
})

describe('isValidFullPostcodeNI', () => {
  test('validates full NI postcode', () => {
    expect(isValidFullPostcodeNI('BT1 1AA')).toBe(true)
    expect(isValidFullPostcodeNI('BT12 1AB')).toBe(true)
    expect(isValidFullPostcodeNI('invalid')).toBe(false)
  })

  test('handles lowercase input', () => {
    expect(isValidFullPostcodeNI('bt1 1aa')).toBe(true)
  })

  test('handles input without space', () => {
    expect(isValidFullPostcodeNI('BT11AA')).toBe(true)
  })

  test('handles empty string input', () => {
    expect(isValidFullPostcodeNI('')).toBe(false)
  })
})

describe.skip('splitAndCheckSpecificWords', () => {
  test('checks if source string contains exact first two words or last word', () => {
    expect(
      splitAndCheckSpecificWords('HELLO WORLD EXAMPLE', 'hello world')
    ).toBe(true)
    expect(
      splitAndCheckSpecificWords('HELLO WORLD EXAMPLE', 'world example')
    ).toBe(false)
  })

  test('handles input with three words', () => {
    expect(
      splitAndCheckSpecificWords('HELLO WORLD EXAMPLE', 'hello world example')
    ).toBe(true)
    expect(
      splitAndCheckSpecificWords('HELLO WORLD EXAMPLE', 'hello world')
    ).toBe(true)
  })

  test('handles input with one word', () => {
    expect(splitAndCheckSpecificWords('HELLO WORLD EXAMPLE', 'hello')).toBe(
      true
    )
    expect(splitAndCheckSpecificWords('HELLO WORLD EXAMPLE', 'example')).toBe(
      true
    )
  })

  test.skip('handles empty string input', () => {
    expect(splitAndCheckSpecificWords('', 'hello world')).toBe(false)
  })
})

describe('splitAndCheckExactWords', () => {
  test('checks if target string contains exactly any of the three words', () => {
    expect(splitAndCheckExactWords('hello world example', 'world')).toBe(true)
    expect(splitAndCheckExactWords('hello world example', 'example')).toBe(true)
    expect(splitAndCheckExactWords('hello world example', 'test')).toBe(false)
  })

  test('handles input with more than three words', () => {
    expect(splitAndCheckExactWords('hello world example test', 'example')).toBe(
      true
    )
  })

  test('handles input with less than three words', () => {
    expect(splitAndCheckExactWords('hello world', 'world')).toBe(false)
  })

  test('handles empty string input', () => {
    expect(splitAndCheckExactWords('', 'world')).toBe(false)
  })
})

describe('countWords', () => {
  test('counts the number of words in a string', () => {
    expect(countWords('hello world example')).toBe(3)
    expect(countWords('hello')).toBe(1)
  })

  test('handles input with multiple spaces', () => {
    expect(countWords('hello   world   example')).toBe(3)
  })

  test('handles empty string input', () => {
    expect(countWords('')).toBe(1)
  })

  test('handles input with leading and trailing spaces', () => {
    expect(countWords('  hello world example  ')).toBe(3)
  })
})

describe('isOnlyLettersAndMoreThanFour', () => {
  test('checks if string is only letters and contains more than 4 letters', () => {
    expect(isOnlyLettersAndMoreThanFour('hello')).toBe(true)
    expect(isOnlyLettersAndMoreThanFour('hell')).toBe(false)
    expect(isOnlyLettersAndMoreThanFour('hello123')).toBe(false)
  })

  test('handles input with spaces', () => {
    expect(isOnlyLettersAndMoreThanFour('hello world')).toBe(true)
  })

  test('handles empty string input', () => {
    expect(isOnlyLettersAndMoreThanFour('')).toBe(false)
  })

  test('handles input with special characters', () => {
    expect(isOnlyLettersAndMoreThanFour('hello!')).toBe(false)
  })
})

describe('formatNorthernIrelandPostcode', () => {
  test('formats Northern Ireland postcode', () => {
    expect(formatNorthernIrelandPostcode('BT1 1AA')).toBe('BT1 1AA')
    expect(formatNorthernIrelandPostcode('BT11AA')).toBe('BT1 1AA')
  })

  test('handles invalid postcode', () => {
    expect(formatNorthernIrelandPostcode('invalid')).toBe('invalid')
  })

  test.skip('handles lowercase input', () => {
    expect(formatNorthernIrelandPostcode('bt1 1aa')).toBe('BT1 1AA')
  })

  test('handles empty string input', () => {
    expect(formatNorthernIrelandPostcode('')).toBe('')
  })
})

describe('hasExactMatch', () => {
  test('checks if a word separated by spaces in one string has an exact match in another string', () => {
    expect(hasExactMatch('hello world', 'HELLO WORLD')).toBe(true)
    expect(hasExactMatch('hello world', 'WORLD HELLO')).toBe(false)
  })

  test('handles input with name2', () => {
    expect(hasExactMatch('hello world', 'HELLO', 'WORLD')).toBe(false)
    expect(hasExactMatch('hello world', 'HELLO', 'HELLO WORLD')).toBe(true)
  })

  test('handles input with single word', () => {
    expect(hasExactMatch('hello', 'HELLO')).toBe(true)
    expect(hasExactMatch('hello', 'WORLD')).toBe(false)
  })

  test('handles empty string input', () => {
    expect(hasExactMatch('', 'HELLO')).toBe(false)
    expect(hasExactMatch('hello', '')).toBe(false)
  })
})

describe('hasCommonWord', () => {
  test('checks if two strings contain the exact same word', () => {
    expect(hasCommonWord('hello world', 'world example')).toBe(true)
    expect(hasCommonWord('hello world', 'example test')).toBe(false)
  })

  test('handles input with multiple common words', () => {
    expect(hasCommonWord('hello world example', 'world example test')).toBe(
      true
    )
  })

  test('handles input with no common words', () => {
    expect(hasCommonWord('hello world', 'example test')).toBe(false)
  })

  test('handles empty string input', () => {
    expect(hasCommonWord('', 'world')).toBe(false)
    expect(hasCommonWord('hello world', '')).toBe(false)
  })
})

describe('formatUKPostcode', () => {
  test('formats UK postcode', () => {
    expect(formatUKPostcode('SW1A 1AA')).toBe('SW1A 1AA')
    expect(formatUKPostcode('SW1A1AA')).toBe('SW1A 1AA')
  })

  test('handles invalid postcode', () => {
    expect(formatUKPostcode('invalid')).toBe('invalid')
  })

  test('handles lowercase input', () => {
    expect(formatUKPostcode('sw1a 1aa')).toBe('SW1A 1AA')
  })

  test('handles empty string input', () => {
    expect(formatUKPostcode('')).toBe('')
  })
})

describe('isOnlyWords', () => {
  test('checks if string contains only words (letters)', () => {
    expect(isOnlyWords('hello world')).toBe(true)
    expect(isOnlyWords('hello123')).toBe(false)
  })

  test('handles input with spaces', () => {
    expect(isOnlyWords('hello world')).toBe(true)
  })

  test('handles empty string input', () => {
    expect(isOnlyWords('')).toBe(false)
  })

  test('handles input with special characters', () => {
    expect(isOnlyWords('hello!')).toBe(false)
  })
})

describe('compareLastElements', () => {
  test('compares the last elements of two URLs', () => {
    expect(
      compareLastElements(
        'http://example.com/page1',
        'http://example.com/page1'
      )
    ).toBe(true)
    expect(
      compareLastElements(
        'http://example.com/page1',
        'http://example.com/page2'
      )
    ).toBe(false)
  })

  test('handles input with query parameters', () => {
    expect(
      compareLastElements(
        'http://example.com/page1?query=123',
        'http://example.com/page1'
      )
    ).toBe(true)
  })

  test('handles input with different domains', () => {
    expect(
      compareLastElements(
        'http://example1.com/page1',
        'http://example2.com/page1'
      )
    ).toBe(false)
  })

  test('handles empty string input', () => {
    expect(compareLastElements('', 'http://example.com/page1')).toBe(false)
    expect(compareLastElements('http://example.com/page1', '')).toBe(false)
  })
})

// Unit tests for convert-string.js
const { convertString } = require('./convert-string')

// Mock data
const mockString = 'Test String'

describe('convertString', () => {
  it('should convert string to uppercase', () => {
    const result = convertString(mockString)
    expect(result).toBe('TEST STRING')
  })

  it('should handle empty string gracefully', () => {
    const result = convertString('')
    expect(result).toBe('')
  })
})
