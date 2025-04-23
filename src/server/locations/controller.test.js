import {
  getLocationDataController,
  determineLanguage,
  prepareViewData
} from '~/src/server/locations/controller'
import { LANG_EN, LANG_CY } from '~/src/server/data/constants'

afterEach(() => {
  jest.clearAllMocks() // Clear mock call history
})

describe('controller.js exports', () => {
  it('should export getLocationDataController', () => {
    expect(typeof getLocationDataController.handler).toBe('function')
  })

  it('should export determineLanguage', () => {
    expect(typeof determineLanguage).toBe('function')
  })

  it('should export prepareViewData', () => {
    expect(typeof prepareViewData).toBe('function')
  })
})

describe('determineLanguage', () => {
  it('should return LANG_CY when queryLang is "cy"', () => {
    // Test for Welsh language
    expect(determineLanguage('cy')).toBe(LANG_CY)
  })

  it('should return LANG_EN when queryLang is "en"', () => {
    // Test for English language
    expect(determineLanguage('en')).toBe(LANG_EN)
  })

  it('should return LANG_EN when path is "/location"', () => {
    // Test for default English language based on path
    expect(determineLanguage(null, '/location')).toBe(LANG_EN)
  })

  it('should return LANG_EN when referer includes "search-location"', () => {
    // Test for English language based on referer
    expect(determineLanguage(null, null, 'search-location')).toBe(LANG_EN)
  })

  it('should return LANG_CY as the default when no conditions are met', () => {
    // Test for default Welsh language
    expect(determineLanguage(null, '/some-path', 'some-other-referer')).toBe(
      LANG_CY
    )
  })
})

describe('prepareViewData', () => {
  it('should return view data with default language when no language is provided', () => {
    const viewData = prepareViewData() // Call without arguments
    expect(viewData.lang).toBe(LANG_EN) // Default to LANG_EN
    expect(viewData.pageTitle).toContain(' - ')
    expect(viewData.userLocation).toBe('')
  })
})

describe('getLocationDataController', () => {
  it('should render the "location-not-found/index" view with the correct data', async () => {
    const mockRequest = {
      query: { lang: 'en' },
      path: '/location',
      headers: { referer: 'some-referer' }
    }
    const mockH = {
      view: jest.fn()
    }

    await getLocationDataController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledTimes(1)

    expect(mockH.view).toHaveBeenCalledWith(
      'location-not-found/index',
      expect.objectContaining({
        lang: 'en',
        pageTitle: expect.stringContaining(' - '),
        userLocation: ''
      })
    )
  })
})
