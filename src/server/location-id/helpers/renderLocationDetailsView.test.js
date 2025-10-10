import { describe, it, expect, vi, beforeEach } from 'vitest'
import renderLocationDetailsView from './renderLocationDetailsView.js'
import { gazetteerEntryFilter } from '../../locations/helpers/gazetteer-util.js'
import { convertFirstLetterIntoUppercase } from '../../locations/helpers/convert-first-letter-into-upper-case.js'
import { transformKeys } from '../../locations/helpers/transform-summary-keys.js'
import { airQualityValues } from '../../locations/helpers/air-quality-values.js'
import { LANG_CY } from '../../data/constants.js'

// '' Mock all the dependencies
vi.mock('../../locations/helpers/gazetteer-util.js', () => ({
  gazetteerEntryFilter: vi.fn()
}))

vi.mock(
  '../../locations/helpers/convert-first-letter-into-upper-case.js',
  () => ({
    convertFirstLetterIntoUppercase: vi.fn()
  })
)

vi.mock('../../locations/helpers/transform-summary-keys.js', () => ({
  transformKeys: vi.fn()
}))

vi.mock('../../locations/helpers/air-quality-values.js', () => ({
  airQualityValues: vi.fn()
}))

vi.mock('../../data/en/monitoring-sites.js', () => ({
  siteTypeDescriptions: { site1: 'Description 1' },
  pollutantTypes: { NO2: 'Nitrogen Dioxide' }
}))

vi.mock('../../data/en/air-quality.js', () => ({
  commonMessages: { good: 'Good air quality' }
}))

describe('renderLocationDetailsView', () => {
  const mockGazetteerEntryFilter = vi.mocked(gazetteerEntryFilter)
  const mockConvertFirstLetterIntoUppercase = vi.mocked(
    convertFirstLetterIntoUppercase
  )
  const mockTransformKeys = vi.mocked(transformKeys)
  const mockAirQualityValues = vi.mocked(airQualityValues)

  let mockH, locationDetails, config

  beforeEach(() => {
    mockH = {
      view: vi.fn().mockReturnValue('rendered-view')
    }

    locationDetails = {
      id: '123',
      name: 'Test Location',
      latitude: 51.5074,
      longitude: -0.1278
    }

    config = {
      forecastNum: 1,
      nearestLocationsRange: [],
      locationData: {
        dailySummary: { date: '2024-01-15' },
        welshDate: '15 Ionawr 2024',
        englishDate: '15 January 2024'
      },
      lang: 'en',
      metaSiteUrl: 'https://example.com',
      english: {
        footerTxt: 'Footer',
        phaseBanner: 'Beta',
        backlink: 'Back',
        cookieBanner: 'Cookies',
        dailySummaryTexts: { today: 'Today' }
      },
      multipleLocations: {
        titlePrefix: 'Air quality in',
        pageTitle: 'Check local air quality',
        serviceName: 'Air Quality Service'
      },
      daqi: {
        description: { a: 'Air quality in', b: ' is good' }
      },
      calendarWelsh: { 0: 'Ionawr' },
      getMonth: 0
    }

    // Setup mocks
    mockGazetteerEntryFilter.mockReturnValue({
      title: 'test location',
      headerTitle: 'test location'
    })
    mockConvertFirstLetterIntoUppercase.mockReturnValue('Test Location')
    mockTransformKeys.mockReturnValue({
      transformedDailySummary: { transformedDate: '2024-01-15' }
    })
    mockAirQualityValues.mockReturnValue({
      airQuality: { level: 'good' }
    })
  })

  it('should render location details view with all required data', () => {
    const result = renderLocationDetailsView(locationDetails, config, mockH)

    expect(mockGazetteerEntryFilter).toHaveBeenCalledWith(locationDetails)
    expect(mockConvertFirstLetterIntoUppercase).toHaveBeenCalledWith(
      'test location'
    )
    expect(mockTransformKeys).toHaveBeenCalledWith(
      config.locationData.dailySummary,
      'en'
    )
    expect(mockAirQualityValues).toHaveBeenCalledWith(1, 'en')

    expect(mockH.view).toHaveBeenCalledWith(
      'locations/location',
      expect.objectContaining({
        result: locationDetails,
        airQuality: { level: 'good' },
        pageTitle: 'Air quality in Test Location - Check local air quality',
        title: 'Air quality in Test Location',
        description: 'Air quality in Test Location is good',
        displayBacklink: true,
        lang: 'en'
      })
    )

    expect(result).toBe('rendered-view')
  })

  it('should handle Welsh language correctly', () => {
    config.lang = LANG_CY

    const result = renderLocationDetailsView(locationDetails, config, mockH)

    expect(mockTransformKeys).toHaveBeenCalledWith(
      config.locationData.dailySummary,
      LANG_CY
    )
    expect(mockAirQualityValues).toHaveBeenCalledWith(1, LANG_CY)

    expect(mockH.view).toHaveBeenCalledWith(
      'locations/location',
      expect.objectContaining({
        lang: LANG_CY,
        summaryDate: '15 Ionawr 2024',
        welshMonth: 'Ionawr'
      })
    )

    expect(result).toBe('rendered-view')
  })
})
