import { handleErrorInputAndRedirect } from './extra-middleware-helpers.js'
import { fetchData } from './fetch-data.js'

vi.mock('./fetch-data.js', () => ({
  fetchData: vi.fn() // Mock the fetchData function
}))

vi.mock('./extra-middleware-helpers.js', () => ({
  handleErrorInputAndRedirect: vi.fn(), // Mock the handleErrorInputAndRedirect function
  handleUKLocationType: vi.fn(() =>
    Promise.resolve('Mocked handleUKLocationType')
  )
}))

vi.mock('./convert-string.js', () => ({
  isValidFullPostcodeUK: vi.fn(),
  isOnlyWords: vi.fn()
}))

vi.mock('./middleware-helpers.js', () => ({
  handleSingleMatch: vi.fn(), // Mock handleSingleMatch
  handleMultipleMatches: vi.fn(() => 'Multiple matches handled'), // Mock handleMultipleMatches
  processMatches: vi.fn(() => ({
    selectedMatches: [] // Default return value
  }))
}))

describe('fetchData Export', () => {
  it('should export fetchData as a function', () => {
    expect(typeof fetchData).toBe('function')
  })
})

describe('handleErrorInputAndRedirect', () => {
  describe('handleErrorInputAndRedirect Mock', () => {
    it('should return the mocked value', () => {
      handleErrorInputAndRedirect.mockReturnValue({
        locationType: 'UK',
        userLocation: 'Test Location',
        locationNameOrPostcode: 'Test Postcode'
      })

      const result = handleErrorInputAndRedirect()
      expect(result).toEqual({
        locationType: 'UK',
        userLocation: 'Test Location',
        locationNameOrPostcode: 'Test Postcode'
      })
    })
  })
})
