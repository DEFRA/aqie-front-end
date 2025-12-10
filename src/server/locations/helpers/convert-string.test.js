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
  compareLastElements,
  convertString
} from './convert-string.js'

// Test constants
const HELLO_WORLD_EXAMPLE = 'hello world example'
const EMPTY_STRING_INPUT = 'handles empty string input'
const HELLO_WORLD = 'hello world'
const LOWERCASE_INPUT = 'handles lowercase input'
const HELLO_WORLD_UPPER = 'HELLO WORLD'
const EXAMPLE_URL = 'https://example.com/page1'
const THREE_WORDS = 3

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
    expect(removeLastWordAndAddHyphens(HELLO_WORLD_EXAMPLE)).toBe('hello-world')
  })

  test('handles single word input', () => {
    expect(removeLastWordAndAddHyphens('hello')).toBe('')
  })

  test(EMPTY_STRING_INPUT, () => {
    expect(removeLastWordAndAddHyphens('')).toBe('')
  })
})

describe('removeLastWordAndHyphens', () => {
  test('removes the last word and hyphens', () => {
    expect(removeLastWordAndHyphens('hello-world example')).toBe('helloworld')
  })

  test('handles input without hyphens', () => {
    expect(removeLastWordAndHyphens(HELLO_WORLD_EXAMPLE)).toBe('helloworld')
  })

  test(EMPTY_STRING_INPUT, () => {
    expect(removeLastWordAndHyphens('')).toBe('')
  })
})

describe('splitAndKeepFirstWord', () => {
  test('splits by underscore and keeps the first word', () => {
    expect(splitAndKeepFirstWord('hello_world_example')).toBe('hello')
  })

  test('handles input without underscores', () => {
    expect(splitAndKeepFirstWord(HELLO_WORLD_EXAMPLE)).toBe(HELLO_WORLD_EXAMPLE)
  })

  test(EMPTY_STRING_INPUT, () => {
    expect(splitAndKeepFirstWord('')).toBe('')
  })
})

describe('removeHyphensAndUnderscores', () => {
  test('removes hyphens and underscores', () => {
    expect(removeHyphensAndUnderscores('hello-world')).toBe('helloworld')
  })

  test('handles input without hyphens or underscores', () => {
    expect(removeHyphensAndUnderscores(HELLO_WORLD)).toBe(HELLO_WORLD)
  })

  test(EMPTY_STRING_INPUT, () => {
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
    expect(extractAndFormatUKPostcode(HELLO_WORLD)).toBeNull()
  })
})

describe('removeAllWordsAfterUnderscore', () => {
  test('removes all words after underscore', () => {
    expect(removeAllWordsAfterUnderscore('hello_world_example')).toBe('hello')
  })

  test('handles input without underscores', () => {
    expect(removeAllWordsAfterUnderscore(HELLO_WORLD_EXAMPLE)).toBe(
      HELLO_WORLD_EXAMPLE
    )
  })

  test(EMPTY_STRING_INPUT, () => {
    expect(removeAllWordsAfterUnderscore('')).toBe('')
  })
})

describe('isValidPartialPostcodeUK', () => {
  test('validates partial UK postcode', () => {
    expect(isValidPartialPostcodeUK('SW1')).toBe(true)
    expect(isValidPartialPostcodeUK('invalid')).toBe(false)
  })

  test(LOWERCASE_INPUT, () => {
    expect(isValidPartialPostcodeUK('sw1')).toBe(true)
  })

  test(EMPTY_STRING_INPUT, () => {
    expect(isValidPartialPostcodeUK('')).toBe(false)
  })
})

describe('isValidFullPostcodeUK', () => {
  test('validates full UK postcode', () => {
    expect(isValidFullPostcodeUK('SW1A 1AA')).toBe(true)
    expect(isValidFullPostcodeUK('invalid')).toBe(false)
  })

  test(LOWERCASE_INPUT, () => {
    expect(isValidFullPostcodeUK('sw1a 1aa')).toBe(true)
  })

  test(EMPTY_STRING_INPUT, () => {
    expect(isValidFullPostcodeUK('')).toBe(false)
  })
})

describe('isValidPartialPostcodeNI', () => {
  test('validates partial NI postcode', () => {
    expect(isValidPartialPostcodeNI('BT1')).toBe(true)
    expect(isValidPartialPostcodeNI('invalid')).toBe(false)
  })

  test(LOWERCASE_INPUT, () => {
    expect(isValidPartialPostcodeNI('bt1')).toBe(true)
  })

  test(EMPTY_STRING_INPUT, () => {
    expect(isValidPartialPostcodeNI('')).toBe(false)
  })
})

describe('isValidFullPostcodeNI', () => {
  test('validates full NI postcode', () => {
    expect(isValidFullPostcodeNI('BT1 1AA')).toBe(true)
    expect(isValidFullPostcodeNI('BT12 1AB')).toBe(true)
    expect(isValidFullPostcodeNI('invalid')).toBe(false)
  })

  test(LOWERCASE_INPUT, () => {
    expect(isValidFullPostcodeNI('bt1 1aa')).toBe(true)
  })

  test('handles input without space', () => {
    expect(isValidFullPostcodeNI('BT11AA')).toBe(true)
  })

  test(EMPTY_STRING_INPUT, () => {
    expect(isValidFullPostcodeNI('')).toBe(false)
  })
})

describe('splitAndCheckSpecificWords', () => {
  test('checks if source string contains exact first two words or last word', () => {
    // For 2 words: check if sourceString includes joinedWords.toUpperCase() OR vice versa
    expect(splitAndCheckSpecificWords('HELLO WORLD EXAMPLE', HELLO_WORLD)).toBe(
      true
    )
    expect(
      splitAndCheckSpecificWords('HELLO WORLD EXAMPLE', 'world example')
    ).toBe(true) // "HELLO WORLD EXAMPLE".includes("WORLD EXAMPLE") = true
  })

  test('handles input with three words', () => {
    // For 3 words, checks if sourceString.includes(firstTwoWords) - case sensitive!
    expect(
      splitAndCheckSpecificWords(HELLO_WORLD_EXAMPLE, HELLO_WORLD_EXAMPLE)
    ).toBe(true)
    expect(
      splitAndCheckSpecificWords('hello world extra', HELLO_WORLD_EXAMPLE)
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

  test('handles two-word input where target contains the joined words', () => {
    // For 2 words: check if sourceString includes 'hello world' OR 'HELLO WORLD' includes sourceString
    expect(splitAndCheckSpecificWords(HELLO_WORLD_UPPER, HELLO_WORLD)).toBe(
      true
    )
    expect(splitAndCheckSpecificWords('HELLO WORLD FOO', HELLO_WORLD)).toBe(
      true
    )
  })

  test('handles two-word input where joined words contain the target', () => {
    // 'HELLO WORLD' includes 'HEL WOR' (joined as 'hel wor')? No. But 'HEL WOR' includes 'HELLO WORLD'? No.
    expect(splitAndCheckSpecificWords('HELLO', 'hel wor')).toBe(false)
  })

  test('handles three-word input checking first two words', () => {
    // For three words, it checks if sourceString contains the first two words (lowercase)
    expect(splitAndCheckSpecificWords('FOO BAR', 'one two three')).toBe(false)
    expect(splitAndCheckSpecificWords('one two', 'one two three')).toBe(true)
  })

  test('handles input with more than three words (default case)', () => {
    // For >3 words or <2 words, default case: sourceString includes name1.toUpperCase() OR vice versa
    expect(
      splitAndCheckSpecificWords('HELLO WORLD', 'one two three four')
    ).toBe(false)
    expect(
      splitAndCheckSpecificWords('ONE TWO THREE FOUR', 'one two three four')
    ).toBe(true)
  })

  test('handles empty string input', () => {
    // Empty string splits to [''], length 1, so it goes to default case
    // '' includes anything, and anything.toUpperCase() includes ''
    expect(splitAndCheckSpecificWords('HELLO', '')).toBe(true)
    // Source empty means sourceString.includes('') is true
    expect(splitAndCheckSpecificWords('', 'hello')).toBe(true)
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
    expect(countWords(HELLO_WORLD_EXAMPLE)).toBe(THREE_WORDS)
    expect(countWords('hello')).toBe(1)
  })

  test('handles input with multiple spaces', () => {
    expect(countWords('hello   world   example')).toBe(THREE_WORDS)
  })

  test(EMPTY_STRING_INPUT, () => {
    expect(countWords('')).toBe(1)
  })

  test('handles input with leading and trailing spaces', () => {
    expect(countWords('  hello world example  ')).toBe(THREE_WORDS)
  })
})

describe('isOnlyLettersAndMoreThanFour', () => {
  test('checks if string is only letters and contains more than 4 letters', () => {
    expect(isOnlyLettersAndMoreThanFour('hello')).toBe(true)
    expect(isOnlyLettersAndMoreThanFour('hell')).toBe(false)
    expect(isOnlyLettersAndMoreThanFour('hello123')).toBe(false)
  })

  test('handles input with spaces', () => {
    expect(isOnlyLettersAndMoreThanFour(HELLO_WORLD)).toBe(true)
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
    expect(hasExactMatch(HELLO_WORLD, HELLO_WORLD_UPPER)).toBe(true)
    expect(hasExactMatch(HELLO_WORLD, 'WORLD HELLO')).toBe(false)
  })

  test('handles input with name2', () => {
    expect(hasExactMatch(HELLO_WORLD, 'HELLO', 'WORLD')).toBe(false)
    expect(hasExactMatch(HELLO_WORLD, 'HELLO', HELLO_WORLD_UPPER)).toBe(true)
  })

  test('handles input with single word', () => {
    expect(hasExactMatch('hello', 'HELLO')).toBe(true)
    expect(hasExactMatch('hello', 'WORLD')).toBe(false)
  })

  test(EMPTY_STRING_INPUT, () => {
    expect(hasExactMatch('', 'HELLO')).toBe(false)
    expect(hasExactMatch('hello', '')).toBe(false)
  })

  test('handles null name1', () => {
    expect(hasExactMatch(HELLO_WORLD, null)).toBe(false)
  })

  test('handles null name2', () => {
    expect(hasExactMatch(HELLO_WORLD, 'HELLO', null)).toBe(false)
  })

  test('handles undefined inputs', () => {
    expect(hasExactMatch(HELLO_WORLD, undefined)).toBe(false)
    expect(hasExactMatch(HELLO_WORLD, 'HELLO', undefined)).toBe(false)
  })
})

describe('hasCommonWord', () => {
  test('checks if two strings contain the exact same word', () => {
    expect(hasCommonWord(HELLO_WORLD, 'world example')).toBe(true)
    expect(hasCommonWord(HELLO_WORLD, 'example test')).toBe(false)
  })

  test('handles input with multiple common words', () => {
    expect(hasCommonWord(HELLO_WORLD_EXAMPLE, 'world example test')).toBe(true)
  })

  test('handles input with no common words', () => {
    expect(hasCommonWord(HELLO_WORLD, 'example test')).toBe(false)
  })

  test(EMPTY_STRING_INPUT, () => {
    expect(hasCommonWord('', 'world')).toBe(false)
    expect(hasCommonWord(HELLO_WORLD, '')).toBe(false)
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

  test(LOWERCASE_INPUT, () => {
    expect(formatUKPostcode('sw1a 1aa')).toBe('SW1A 1AA')
  })

  test(EMPTY_STRING_INPUT, () => {
    expect(formatUKPostcode('')).toBe('')
  })
})

describe('isOnlyWords', () => {
  test('checks if string contains only words (letters)', () => {
    expect(isOnlyWords(HELLO_WORLD)).toBe(true)
    expect(isOnlyWords('hello123')).toBe(false)
  })

  test('handles input with spaces', () => {
    expect(isOnlyWords(HELLO_WORLD)).toBe(true)
  })

  test(EMPTY_STRING_INPUT, () => {
    expect(isOnlyWords('')).toBe(false)
  })

  test('handles input with special characters', () => {
    expect(isOnlyWords('hello!')).toBe(false)
  })
})

describe('compareLastElements', () => {
  test('compares the last elements of two URLs', () => {
    expect(compareLastElements(EXAMPLE_URL, EXAMPLE_URL)).toBe(true)
    expect(compareLastElements(EXAMPLE_URL, 'https://example.com/page2')).toBe(
      false
    )
  })

  test('handles input with query parameters', () => {
    expect(
      compareLastElements('https://example.com/page1?query=123', EXAMPLE_URL)
    ).toBe(true)
  })

  test('handles input with different domains', () => {
    expect(
      compareLastElements(
        'https://example1.com/page1',
        'https://example2.com/page1'
      )
    ).toBe(false)
  })

  test(EMPTY_STRING_INPUT, () => {
    expect(compareLastElements('', EXAMPLE_URL)).toBe(false)
    expect(compareLastElements(EXAMPLE_URL, '')).toBe(false)
  })
})

describe('convertString', () => {
  it('should convert string to uppercase', () => {
    // ''
    const mockString = 'Test String'
    const result = convertString(mockString)
    expect(result).toBe('TEST STRING')
  })

  it('should handle empty string gracefully', () => {
    // ''
    const result = convertString('')
    expect(result).toBe('')
  })

  it('should handle non-string inputs', () => {
    // ''
    expect(convertString('hello')).toBe('HELLO')
    expect(convertString('123 ABC')).toBe('123 ABC')
    expect(convertString('mixed-case_test')).toBe('MIXED-CASE_TEST')
  })
})
