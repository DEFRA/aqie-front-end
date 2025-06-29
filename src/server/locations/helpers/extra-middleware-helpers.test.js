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

describe('Middleware Helpers', () => {
  describe('handleErrorInputAndRedirect', () => {
    it('should redirect to location-not-found when no locationType and no searchTerms', () => {
      const request = { yar: { set: jest.fn() } }
      const h = { redirect: jest.fn(() => ({ takeover: jest.fn() })) }
      const payload = {}
      const searchTerms = null

      const result = handleErrorInputAndRedirect(
        request,
        h,
        'en',
        payload,
        searchTerms
      )

      expect(request.yar.set).toHaveBeenCalledWith('locationDataNotFound', {
        locationNameOrPostcode: '',
        lang: 'en'
      })
      expect(h.redirect).toHaveBeenCalledWith('/location-not-found')
      expect(result).toBeDefined()
    })

    it('should return location data when valid locationType or searchTerms are provided', () => {
      const request = { yar: { set: jest.fn() } }
      const h = {}
      const payload = { locationType: 'UK' }
      const searchTerms = 'Some location'

      const result = handleErrorInputAndRedirect(
        request,
        h,
        'en',
        payload,
        searchTerms
      )

      expect(result).toEqual({
        locationType: 'UK',
        userLocation: 'Some location',
        locationNameOrPostcode: 'Some location'
      })
    })
  })

  describe('handleUKLocationType', () => {
    it('should handle single match correctly', async () => {
      const request = { yar: { set: jest.fn(), clear: jest.fn() } }
      const h = {}
      const params = {
        getOSPlaces: { results: [{ id: 1 }] },
        userLocation: 'user-location',
        locationNameOrPostcode: 'location-name',
        searchTerms: '',
        secondSearchTerm: '',
        lang: 'en'
      }

      duplicateResults.mockReturnValue([{ id: 1 }])
      processMatches.mockReturnValue({ selectedMatches: [{ id: 1 }] })
      generateTitleData.mockReturnValue({ title: 'Title Data' })
      handleSingleMatchHelper.mockReturnValue('Single Match Response')

      const result = await handleUKLocationType(request, h, params)

      expect(duplicateResults).toHaveBeenCalledWith([{ id: 1 }])
      expect(processMatches).toHaveBeenCalled()
      expect(generateTitleData).toHaveBeenCalledWith(
        [{ id: 1 }],
        'location-name'
      )
      expect(handleSingleMatchHelper).toHaveBeenCalled()
      expect(result).toBe('Single Match Response')
    })

    it('should handle multiple matches correctly', async () => {
      const request = { yar: { set: jest.fn(), clear: jest.fn() } }
      const h = {}
      const params = {
        getOSPlaces: { results: [{ id: 1 }, { id: 2 }] },
        userLocation: 'user-location',
        locationNameOrPostcode: 'location-name',
        searchTerms: '',
        secondSearchTerm: '',
        lang: 'en'
      }

      duplicateResults.mockReturnValue([{ id: 1 }, { id: 2 }])
      processMatches.mockReturnValue({
        selectedMatches: [{ id: 1 }, { id: 2 }]
      })
      handleMultipleMatchesHelper.mockReturnValue('Multiple Matches Response')

      const result = await handleUKLocationType(request, h, params)

      expect(handleMultipleMatchesHelper).toHaveBeenCalled()
      expect(result).toBe('Multiple Matches Response')
    })

    it('should handle no matches correctly', async () => {
      const request = { yar: { set: jest.fn(), clear: jest.fn() } }
      const h = { redirect: jest.fn(() => ({ takeover: jest.fn() })) }
      const params = {
        getOSPlaces: { results: [] },
        userLocation: 'user-location',
        locationNameOrPostcode: 'location-name',
        searchTerms: '',
        secondSearchTerm: '',
        lang: 'en'
      }

      duplicateResults.mockReturnValue([])
      processMatches.mockReturnValue({ selectedMatches: [] })

      const result = await handleUKLocationType(request, h, params)

      expect(request.yar.set).toHaveBeenCalledWith('locationDataNotFound', {
        locationNameOrPostcode: 'location-name',
        lang: 'en'
      })
      expect(h.redirect).toHaveBeenCalledWith('/location-not-found')
      expect(result).toBeDefined()
    })
  })
})
