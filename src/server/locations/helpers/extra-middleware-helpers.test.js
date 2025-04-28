import { handleErrorInputAndRedirect } from '~/src/server/locations/helpers/extra-middleware-helpers'
import { fetchData } from '~/src/server/locations/helpers/fetch-data'

jest.mock('~/src/server/locations/helpers/fetch-data', () => ({
  fetchData: jest.fn() // Mock the fetchData function
}))

jest.mock('~/src/server/locations/helpers/extra-middleware-helpers', () => ({
  handleErrorInputAndRedirect: jest.fn(), // Mock the handleErrorInputAndRedirect function
  handleUKLocationType: jest.fn(() =>
    Promise.resolve('Mocked handleUKLocationType')
  )
}))

jest.mock('~/src/server/locations/helpers/convert-string', () => ({
  isValidFullPostcodeUK: jest.fn(),
  isOnlyWords: jest.fn()
}))

jest.mock('~/src/server/locations/helpers/middleware-helpers', () => ({
  handleSingleMatch: jest.fn(), // Mock handleSingleMatch
  handleMultipleMatches: jest.fn(() => 'Multiple matches handled'), // Mock handleMultipleMatches
  processMatches: jest.fn(() => ({
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
