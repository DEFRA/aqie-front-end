// Unit tests for generate-title-data.js
import { generateTitleData } from './generate-title-data'

// Mock data
const mockMatches = [{ name: 'Match1' }, { name: 'Match2' }]

const mockLocationNameOrPostcode = 'London'

describe('generateTitleData', () => {
  it('should generate title data for valid inputs', () => {
    const result = generateTitleData(mockMatches, mockLocationNameOrPostcode)
    expect(result).toHaveProperty('title')
    expect(result).toHaveProperty('headerTitle')
    expect(result).toHaveProperty('urlRoute')
    expect(result).toHaveProperty('headerTitleRoute')
    expect(result).toHaveProperty('titleRoute')
  })

  it('should handle missing inputs gracefully', () => {
    const result = generateTitleData(null, null)
    expect(result).toEqual({
      title: 'Unknown Location',
      headerTitle: '',
      urlRoute: '',
      headerTitleRoute: '',
      titleRoute: ''
    })
  })
})
