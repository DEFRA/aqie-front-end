import { showLocationPage } from '~/src/server/locations/helpers/show-location-page'

describe('showLocationPage', () => {
  let h

  beforeEach(() => {
    h = {
      view: jest.fn()
    }
  })

  it('should render the locations/location view with the correct data', async () => {
    const locationString = 'locations/location'
    const data = {
      results: [],
      airQuality: {},
      airQualityData: {},
      monitoringSites: [],
      siteTypeDescriptions: {},
      pollutantTypes: [],
      pageTitle: 'Page Title',
      displayBacklink: true,
      forecastSummary: 'Forecast Summary',
      summaryDate: '2025-01-28'
    }

    await showLocationPage(
      data.results,
      data.airQuality,
      data.airQualityData,
      data.monitoringSites,
      data.siteTypeDescriptions,
      data.pollutantTypes,
      data.pageTitle,
      data.displayBacklink,
      null,
      data.forecastSummary,
      data.summaryDate,
      null,
      locationString,
      h
    )

    expect(h.view).toHaveBeenCalledWith(locationString, {
      result: data.results,
      airQuality: data.airQuality,
      airQualityData: data.airQualityData,
      monitoringSites: data.monitoringSites,
      siteTypeDescriptions: data.siteTypeDescriptions,
      pollutantTypes: data.pollutantTypes,
      pageTitle: data.pageTitle,
      displayBacklink: data.displayBacklink,
      forecastSummary: data.forecastSummary,
      summaryDate: data.summaryDate
    })
  })

  it('should render the multiple-results/multiple-locations view with the correct data', async () => {
    const locationString = 'multiple-results/multiple-locations'
    const data = {
      results: [],
      airQuality: {},
      airQualityData: {},
      monitoringSites: [],
      siteTypeDescriptions: {},
      pollutantTypes: [],
      pageTitle: 'Page Title',
      serviceName: 'Service Name',
      userLocation: 'User Location'
    }

    await showLocationPage(
      data.results,
      data.airQuality,
      data.airQualityData,
      data.monitoringSites,
      data.siteTypeDescriptions,
      data.pollutantTypes,
      data.pageTitle,
      null,
      data.serviceName,
      null,
      null,
      data.userLocation,
      locationString,
      h
    )

    expect(h.view).toHaveBeenCalledWith(locationString, {
      results: data.results,
      airQuality: data.airQuality,
      airQualityData: data.airQualityData,
      monitoringSites: data.monitoringSites,
      siteTypeDescriptions: data.siteTypeDescriptions,
      pollutantTypes: data.pollutantTypes,
      pageTitle: data.pageTitle,
      serviceName: data.serviceName,
      userLocation: data.userLocation
    })
  })

  it('should not render any view if locationString does not match', async () => {
    const locationString = 'unknown/location'
    const data = {
      results: [],
      airQuality: {},
      airQualityData: {},
      monitoringSites: [],
      siteTypeDescriptions: {},
      pollutantTypes: [],
      pageTitle: 'Page Title',
      serviceName: 'Service Name',
      userLocation: 'User Location'
    }

    await showLocationPage(
      data.results,
      data.airQuality,
      data.airQualityData,
      data.monitoringSites,
      data.siteTypeDescriptions,
      data.pollutantTypes,
      data.pageTitle,
      null,
      data.serviceName,
      null,
      null,
      data.userLocation,
      locationString,
      h
    )

    expect(h.view).not.toHaveBeenCalled()
  })
})
