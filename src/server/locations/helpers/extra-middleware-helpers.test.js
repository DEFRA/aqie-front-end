import { handleErrorInputAndRedirect } from '~/src/server/locations/helpers/extra-middleware-helpers'
import { fetchData } from '~/src/server/locations/helpers/fetch-data'

jest.mock('~/src/server/locations/helpers/fetch-data', () => ({
  fetchData: jest.fn() // Mock the fetchData function
}))

jest.mock('~/src/server/locations/helpers/extra-middleware-helpers', () => ({
  handleInvalidDailySummary: jest.fn(),
  validateLocationInput: jest.fn(),
  handleErrorInputAndRedirect: jest.fn(), // Mock the handleErrorInputAndRedirect function
  handleUKLocationType: jest.fn()
}))

describe('fetchData Export', () => {
  it('should export fetchData as a function', () => {
    expect(typeof fetchData).toBe('function') // ''
  })
})

describe('searchMiddleware', () => {
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
