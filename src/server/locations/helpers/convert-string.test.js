import { convertStringToHyphenatedLowercaseWords } from '~/src/server/locations/helpers/convert-string'

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
