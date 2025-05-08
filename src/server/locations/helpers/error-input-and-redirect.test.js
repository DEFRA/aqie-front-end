import { handleErrorInputAndRedirect } from '~/src/server/locations/helpers/error-input-and-redirect'
import { getAirQuality } from '~/src/server/data/en/air-quality'
import { english } from '~/src/server/data/en/en'

import { getLocationNameOrPostcode } from '~/src/server/locations/helpers/location-type-util'
import { LOCATION_TYPE_UK, LANG_EN } from '~/src/server/data/constants'

jest.mock('~/src/server/data/en/air-quality')
jest.mock('~/src/server/locations/helpers/location-type-util')
jest.mock('~/src/server/common/helpers/logging/logger')

describe('handleErrorInputAndRedirect', () => {
  let request, h
  const mockContent = english
  const mockAirQuality = {
    today: {
      advice: 'Enjoy your usual outdoor activities.',
      atrisk: {
        adults: 'Enjoy your usual outdoor activities.',
        asthma: 'Enjoy your usual outdoor activities.',
        oldPeople: 'Enjoy your usual outdoor activities.'
      },
      band: 'low',
      outlook:
        'The current spell of unsettled weather will continue, helping to keep air pollution levels low across the UK during today.',
      readableBand: 'low',
      value: 2
    },
    day2: {
      advice: 'Enjoy your usual outdoor activities.',
      atrisk: {
        adults: 'Enjoy your usual outdoor activities.',
        asthma: 'Enjoy your usual outdoor activities.',
        oldPeople: 'Enjoy your usual outdoor activities.'
      },
      band: 'low',
      outlook:
        'The current spell of unsettled weather will continue, helping to keep air pollution levels low across the UK during today.',
      readableBand: 'low',
      value: 2
    },
    day3: {
      advice: 'Enjoy your usual outdoor activities.',
      atrisk: {
        adults: 'Enjoy your usual outdoor activities.',
        asthma: 'Enjoy your usual outdoor activities.',
        oldPeople: 'Enjoy your usual outdoor activities.'
      },
      band: 'low',
      outlook:
        'The current spell of unsettled weather will continue, helping to keep air pollution levels low across the UK during today.',
      readableBand: 'low',
      value: 2
    },
    day4: {
      advice: 'Enjoy your usual outdoor activities.',
      atrisk: {
        adults: 'Enjoy your usual outdoor activities.',
        asthma: 'Enjoy your usual outdoor activities.',
        oldPeople: 'Enjoy your usual outdoor activities.'
      },
      band: 'low',
      outlook:
        'The current spell of unsettled weather will continue, helping to keep air pollution levels low across the UK during today.',
      readableBand: 'low',
      value: 2
    },
    day5: {
      advice: 'Enjoy your usual outdoor activities.',
      atrisk: {
        adults: 'Enjoy your usual outdoor activities.',
        asthma: 'Enjoy your usual outdoor activities.',
        oldPeople: 'Enjoy your usual outdoor activities.'
      },
      band: 'low',
      outlook:
        'The current spell of unsettled weather will continue, helping to keep air pollution levels low across the UK during today.',
      readableBand: 'low',
      value: 2
    }
  }
  beforeEach(() => {
    request = {
      path: '/',
      headers: { referer: 'http://localhost:3000/search-location?lang=en' },
      payload: {
        locationType: LOCATION_TYPE_UK,
        engScoWal: 'slough',
        ni: '',
        aq: ''
      },
      yar: {
        get: jest.fn((key) => {
          if (key === 'locationType') {
            return LOCATION_TYPE_UK // Mock the expected return value
          }
          return undefined
        }),
        set: jest.fn()
      }
    }
    h = {
      redirect: jest.fn().mockReturnValue({ takeover: jest.fn() }),
      view: jest.fn()
    }
    getAirQuality.mockReturnValue(mockAirQuality)
    getLocationNameOrPostcode.mockReturnValue('slough')
  })

  it('should handle successful redirection with valid search location input', () => {
    const result = handleErrorInputAndRedirect(request, h, LANG_EN, 'slough')
    expect(request.yar.set).toHaveBeenCalledWith(
      'locationType',
      LOCATION_TYPE_UK
    )
    expect(request.yar.set).toHaveBeenCalledWith(
      'locationNameOrPostcode',
      'slough'
    )
    expect(request.yar.set).toHaveBeenCalledWith('airQuality', mockAirQuality)
    expect(request.yar.get).toHaveBeenCalledWith('locationType')
    expect(request.yar.get).toHaveReturnedWith(LOCATION_TYPE_UK)
    expect(result).toEqual({
      locationType: 'uk-location',
      userLocation: 'SLOUGH',
      locationNameOrPostcode: 'slough'
    })
  })

  it('should handle missing location type', () => {
    request.payload.locationType = ''
    getLocationNameOrPostcode.mockReturnValue('')

    const result = handleErrorInputAndRedirect(request, h, LANG_EN, '')
    expect(request.yar.set).toHaveBeenCalledWith('errors', expect.any(Object))
    expect(request.yar.set).toHaveBeenCalledWith(
      'errorMessage',
      expect.any(Object)
    )
    expect(h.redirect).toHaveBeenCalledWith('/search-location?lang=en')
    expect(result).toBeUndefined()
  })

  it('should handle missing location type and name/postcode', () => {
    request.payload.locationType = ''
    request.payload.locationNameOrPostcode = ''
    request.payload.engScoWal = ''
    getLocationNameOrPostcode.mockReturnValue('')

    const result = handleErrorInputAndRedirect(request, h, LANG_EN, '')
    expect(request.yar.set).toHaveBeenCalledWith('errors', expect.any(Object))
    expect(request.yar.set).toHaveBeenCalledWith(
      'errorMessage',
      expect.any(Object)
    )
    expect(h.redirect).toHaveBeenCalledWith('/search-location?lang=en')
    expect(result).toBeUndefined()
  })

  it.skip('should handle invalid postcode', () => {
    request.payload.locationNameOrPostcode = 'INVALID'
    request.payload.engScoWal = 'INVALID'
    getLocationNameOrPostcode.mockReturnValue('INVALID')

    const result = handleErrorInputAndRedirect(request, h, LANG_EN, 'INVALID')
    expect(request.yar.set).toHaveBeenCalledWith(
      'errors',
      expect.objectContaining({
        errors: expect.objectContaining({
          titleText: expect.any(String),
          errorList: expect.arrayContaining([
            expect.objectContaining({
              text: expect.any(String),
              href: expect.any(String)
            })
          ])
        })
      })
    )
    expect(request.yar.set).toHaveBeenCalledWith(
      'errorMessage',
      expect.objectContaining({
        errorMessage: expect.objectContaining({
          text: expect.any(String)
        })
      })
    )
    expect(result).toBe('view rendered')
    expect(h.view).toHaveBeenCalledWith('error/index', {
      pageTitle: mockContent.notFoundUrl.serviceAPI.pageTitle,
      url: request.path,
      notFoundUrl: mockContent.notFoundUrl,
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: 'en'
    })
  })
})
