import { vi } from 'vitest'
import {
  getLocationNameOrPostcode,
  handleRedirect,
  getMonth,
  configureLocationTypeAndRedirects,
  filteredAndSelectedLocationType
} from './location-type-util.js'
import { calendarEnglish } from '../../data/en/en.js'
import {
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI,
  SEARCH_LOCATION_ROUTE_CY,
  SEARCH_LOCATION_PATH_EN,
  SEARCH_LOCATION_ROUTE_EN,
  LANG_CY,
  REDIRECT_STATUS_CODE
} from '../../data/constants.js'

vi.mock('moment-timezone', () => {
  const moment = () => ({
    format: () => '01 January 2025'
  })
  moment.tz = {
    format: vi.fn(() => '01 January 2025')
  }
  return { default: moment }
})

// Shared test data
const UK_ERROR_TITLE = 'UK Error Title'
const UK_ERROR_TEXT = 'Enter a location or postcode'
const NI_ERROR_TITLE = 'NI Error Title'
const NI_ERROR_TEXT = 'Enter a postcode'
const GENERIC_ERROR_TITLE = 'Error Title'

const createSearchLocation = () => ({
  errorText: {
    uk: {
      fields: {
        title: UK_ERROR_TITLE,
        list: { text: UK_ERROR_TEXT }
      }
    },
    ni: {
      fields: {
        title: NI_ERROR_TITLE,
        list: { text: NI_ERROR_TEXT }
      }
    }
  }
})

describe('getLocationNameOrPostcode', () => {
  test('returns engScoWal for LOCATION_TYPE_UK', () => {
    const payload = { engScoWal: 'London', ni: 'Belfast' }
    expect(getLocationNameOrPostcode(LOCATION_TYPE_UK, payload)).toBe('London')
  })

  test('returns ni for LOCATION_TYPE_NI', () => {
    const payload = { engScoWal: 'London', ni: 'Belfast' }
    expect(getLocationNameOrPostcode(LOCATION_TYPE_NI, payload)).toBe('Belfast')
  })

  test('returns null for other location types', () => {
    const payload = { engScoWal: 'London', ni: 'Belfast' }
    expect(getLocationNameOrPostcode('OTHER_TYPE', payload)).toBeNull()
  })
})

describe('handleRedirect', () => {
  it('should redirect to the given route with a 301 status code', () => {
    const mockCode = vi.fn()
    const mockH = {
      redirect: vi.fn(() => ({ code: mockCode }))
    }
    const redirectRoute = '/some-route'
    handleRedirect(mockH, redirectRoute)
    expect(mockH.redirect).toHaveBeenCalledWith(redirectRoute)
    expect(mockCode).toHaveBeenCalledWith(REDIRECT_STATUS_CODE)
  })
})

describe.skip('getMonth', () => {
  test('returns the formatted date index', () => {
    const formattedDate = 'January'
    const getFormattedDate = calendarEnglish.findIndex((item) =>
      item.includes(formattedDate)
    )
    expect(getMonth()).toEqual({ getFormattedDate })
  })
})

describe('configureLocationTypeAndRedirects - basic functionality', () => {
  let request, h, options

  beforeEach(() => {
    request = {
      payload: { engScoWal: 'London', ni: 'Belfast' },
      yar: {
        get: vi.fn(),
        set: vi.fn()
      }
    }
    h = { redirect: vi.fn() }
    options = {
      locationType: LOCATION_TYPE_UK,
      locationNameOrPostcode: '',
      str: '',
      query: {},
      searchLocation: {
        errorText: {
          radios: {
            title: GENERIC_ERROR_TITLE,
            list: { text: 'Error Text' }
          }
        }
      },
      airQuality: 'Good'
    }
  })

  test('sets locationNameOrPostcode for LOCATION_TYPE_UK', () => {
    configureLocationTypeAndRedirects(request, h, options)
    expect(request.yar.set).toHaveBeenCalledWith(
      'locationNameOrPostcode',
      'London'
    )
  })

  test('sets locationNameOrPostcode for LOCATION_TYPE_NI', () => {
    options.locationType = LOCATION_TYPE_NI
    configureLocationTypeAndRedirects(request, h, options)
    expect(request.yar.set).toHaveBeenCalledWith(
      'locationNameOrPostcode',
      'Belfast'
    )
  })

  test('sets empty string for other location types', () => {
    options.locationType = 'OTHER_TYPE'
    configureLocationTypeAndRedirects(request, h, options)
    expect(request.yar.set).toHaveBeenCalledWith('locationNameOrPostcode', '')
  })

  test('retrieves from session when locationType is missing and str is not SEARCH_LOCATION_PATH_EN', () => {
    options.locationType = null
    options.str = '/some-other-path'
    request.yar.get.mockImplementation((key) => {
      if (key === 'locationType') {
        return LOCATION_TYPE_UK
      }
      if (key === 'locationNameOrPostcode') {
        return 'Manchester'
      }
      return null
    })

    configureLocationTypeAndRedirects(request, h, options)
    expect(request.yar.get).toHaveBeenCalledWith('locationType')
    expect(request.yar.get).toHaveBeenCalledWith('locationNameOrPostcode')
  })
})

describe('configureLocationTypeAndRedirects - redirects', () => {
  let request, h, options

  beforeEach(() => {
    request = {
      payload: { engScoWal: 'London', ni: 'Belfast' },
      yar: {
        get: vi.fn(),
        set: vi.fn()
      }
    }
    h = { redirect: vi.fn() }
    options = {
      locationType: LOCATION_TYPE_UK,
      locationNameOrPostcode: '',
      str: '',
      query: {},
      searchLocation: {
        errorText: {
          radios: {
            title: GENERIC_ERROR_TITLE,
            list: { text: 'Error Text' }
          }
        }
      },
      airQuality: 'Good'
    }
  })

  test('redirects to SEARCH_LOCATION_ROUTE_CY for Welsh language when no location type or name', () => {
    const mockCode = vi.fn().mockReturnValue('redirect-result')
    h.redirect.mockReturnValue({ code: mockCode })
    options.locationType = null
    options.locationNameOrPostcode = ''
    options.query = { lang: LANG_CY }

    const result = configureLocationTypeAndRedirects(request, h, options)
    expect(request.yar.set).toHaveBeenCalledWith(
      'errors',
      expect.objectContaining({
        errors: expect.objectContaining({
          titleText: GENERIC_ERROR_TITLE
        })
      })
    )
    expect(h.redirect).toHaveBeenCalledWith(SEARCH_LOCATION_ROUTE_CY)
    expect(mockCode).toHaveBeenCalledWith(REDIRECT_STATUS_CODE)
    expect(result).toBe('redirect-result')
  })

  test('redirects to SEARCH_LOCATION_ROUTE_EN for English path when no location type or name', () => {
    const mockCode = vi.fn()
    h.redirect.mockReturnValue({ code: mockCode })
    options.locationType = null
    options.locationNameOrPostcode = ''
    options.str = SEARCH_LOCATION_PATH_EN
    options.query = {}

    configureLocationTypeAndRedirects(request, h, options)
    expect(request.yar.set).toHaveBeenCalledWith(
      'errors',
      expect.objectContaining({
        errors: expect.objectContaining({
          titleText: GENERIC_ERROR_TITLE
        })
      })
    )
    expect(h.redirect).toHaveBeenCalledWith(SEARCH_LOCATION_ROUTE_EN)
    expect(mockCode).toHaveBeenCalledWith(REDIRECT_STATUS_CODE)
  })

  test('returns null when locationNameOrPostcode and locationType are present', () => {
    options.locationType = LOCATION_TYPE_UK
    options.locationNameOrPostcode = 'London'

    const result = configureLocationTypeAndRedirects(request, h, options)
    expect(result).toBeNull()
  })
})

describe('filteredAndSelectedLocationType - postcode formatting', () => {
  let request, h, searchLocation

  beforeEach(() => {
    request = {
      yar: {
        set: vi.fn()
      }
    }
    h = { redirect: vi.fn() }
    searchLocation = createSearchLocation()
  })

  test('inserts space for full postcodes without space', () => {
    const userLocation = 'SW1A1AA'
    const result = filteredAndSelectedLocationType(
      LOCATION_TYPE_UK,
      userLocation,
      request,
      searchLocation,
      h
    )
    expect(result).toBe('SW1A 1AA')
  })

  test('handles partial postcode without space correctly', () => {
    const userLocation = 'SW1A'
    const result = filteredAndSelectedLocationType(
      LOCATION_TYPE_UK,
      userLocation,
      request,
      searchLocation,
      h
    )
    expect(result).toBeNull()
  })

  test('handles postcode with existing space correctly', () => {
    const userLocation = 'SW1A 1AA'
    const result = filteredAndSelectedLocationType(
      LOCATION_TYPE_UK,
      userLocation,
      request,
      searchLocation,
      h
    )
    expect(result).toBeNull()
  })
})

describe('filteredAndSelectedLocationType - error handling', () => {
  let request, h, searchLocation

  beforeEach(() => {
    request = {
      yar: {
        set: vi.fn()
      }
    }
    h = { redirect: vi.fn() }
    searchLocation = createSearchLocation()
  })

  test('redirects for missing userLocation and LOCATION_TYPE_UK', () => {
    const userLocation = ''
    filteredAndSelectedLocationType(
      LOCATION_TYPE_UK,
      userLocation,
      request,
      searchLocation,
      h
    )
    expect(request.yar.set).toHaveBeenCalledWith('errors', expect.any(Object))
    expect(h.redirect).toHaveBeenCalledWith(SEARCH_LOCATION_PATH_EN)
  })

  test('redirects for missing userLocation and LOCATION_TYPE_NI', () => {
    const userLocation = ''
    filteredAndSelectedLocationType(
      LOCATION_TYPE_NI,
      userLocation,
      request,
      searchLocation,
      h
    )
    expect(request.yar.set).toHaveBeenCalledWith('errors', expect.any(Object))
    expect(h.redirect).toHaveBeenCalledWith(SEARCH_LOCATION_PATH_EN)
  })
})

describe('filteredAndSelectedLocationType - valid inputs', () => {
  let request, h, searchLocation

  beforeEach(() => {
    request = {
      yar: {
        set: vi.fn()
      }
    }
    h = { redirect: vi.fn() }
    searchLocation = createSearchLocation()
  })

  test('returns null for valid userLocation', () => {
    const userLocation = 'SW1A 1AA'
    const result = filteredAndSelectedLocationType(
      LOCATION_TYPE_UK,
      userLocation,
      request,
      searchLocation,
      h
    )
    expect(result).toBeNull()
  })

  test('returns null for non-postcode location name', () => {
    const userLocation = 'London'
    const result = filteredAndSelectedLocationType(
      LOCATION_TYPE_UK,
      userLocation,
      request,
      searchLocation,
      h
    )
    expect(result).toBeNull()
  })
})
