import { firstLetterUppercase } from '~/src/server/common/helpers/stringUtils'

describe('firstLetterUppercase', () => {
  it('should capitalize the first letter of each word except "and", "the", "of", "air", "quality", "aer", "ansawdd"', () => {
    const input = 'check air quality'
    const expected = 'Check air quality'
    expect(firstLetterUppercase(input)).toBe(expected)
  })

  it('should handle strings with numbers and process after the first comma', () => {
    const input = '123, check Air Quality Of The Location'
    const expected = '123, Check air quality of the Location'
    expect(firstLetterUppercase(input)).toBe(expected)
  })

  it('should keep "gov.uk" in uppercase', () => {
    const input = 'check Air Quality - gov.uk'
    const expected = 'Check air quality - GOV.UK'
    expect(firstLetterUppercase(input)).toBe(expected)
  })

  it('should handle strings with "air", "quality", "aer", "ansawdd" in lowercase', () => {
    const input = 'air quality is good'
    const expected = 'air quality Is Good'
    expect(firstLetterUppercase(input)).toBe(expected)
  })

  it('should handle empty strings', () => {
    const input = ''
    const expected = ''
    expect(firstLetterUppercase(input)).toBe(expected)
  })

  it('should handle strings without spaces', () => {
    const input = 'Search location'
    const expected = 'Search Location'
    expect(firstLetterUppercase(input)).toBe(expected)
  })

  it('should handle strings with mixed case', () => {
    const input = 'The foreCast foR the nExt fOur days'
    const expected = 'the Forecast For the Next Four Days'
    expect(firstLetterUppercase(input)).toBe(expected)
  })

  it('should handle strings with special characters', () => {
    const input = 'air, quality!'
    const expected = 'Air, Quality!'
    expect(firstLetterUppercase(input)).toBe(expected)
  })
})
