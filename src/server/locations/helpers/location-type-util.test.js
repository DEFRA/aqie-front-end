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
  LANG_CY
} from '../../data/constants.js'

vi.mock('moment-timezone', () => {
  const originalMoment = vi.importActual('moment-timezone')
  return {
    ...originalMoment,
    tz: {
      ...originalMoment.tz,
      format: vi.fn(() => '01 January 2025')
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
  test('redirects to the given route', () => {
    const h = { redirect: vi.fn() }
    const redirectRoute = '/some-route'
    handleRedirect(h, redirectRoute)
    expect(h.redirect).toHaveBeenCalledWith(redirectRoute)
  })
})

describe.skip('getMonth', () => {
  test('returns the formatted date index', () => {
    const formattedDate = 'January'
    const getFormattedDate = calendarEnglish.findIndex(
      (item) => item.indexOf(formattedDate) !== -1
    )
    expect(getMonth()).toEqual({ getFormattedDate })
  })
})

describe('configureLocationTypeAndRedirects', () => {
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
            title: 'Error Title',
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

  test.skip('redirects to SEARCH_LOCATION_ROUTE_CY for Welsh language', () => {
    options.query.lang = LANG_CY
    configureLocationTypeAndRedirects(request, h, options)
    expect(h.redirect).toHaveBeenCalledWith(SEARCH_LOCATION_ROUTE_CY)
  })

  test.skip('redirects to SEARCH_LOCATION_ROUTE_EN for English path', () => {
    options.str = SEARCH_LOCATION_PATH_EN
    configureLocationTypeAndRedirects(request, h, options)
    expect(h.redirect).toHaveBeenCalledWith(SEARCH_LOCATION_ROUTE_EN)
  })
})

describe('filteredAndSelectedLocationType', () => {
  let request, h, searchLocation

  beforeEach(() => {
    request = {
      yar: {
        set: vi.fn()
      }
    }
    h = { redirect: vi.fn() }
    searchLocation = {
      errorText: {
        uk: {
          fields: {
            title: 'UK Error Title',
            list: { text: 'Enter a location or postcode' }
          }
        },
        ni: {
          fields: {
            title: 'NI Error Title',
            list: { text: 'Enter a postcode' }
          }
        }
      }
    }
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
})
