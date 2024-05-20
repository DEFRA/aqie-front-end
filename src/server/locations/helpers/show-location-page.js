/* eslint-disable prettier/prettier */
async function showLocationPage(
  results,
  airQuality,
  airQualityData,
  monitoringSites,
  siteTypeDescriptions,
  pollutantTypes,
  pageTitle,
  displayBacklink,
  serviceName,
  forecastSummary,
  summaryDate,
  googleSiteTagId,
  userLocation,
  locationString,
  h
) {
  if (locationString === 'locations/location') {
    return h.view(locationString, {
      result: results,
      airQuality,
      airQualityData,
      monitoringSites,
      siteTypeDescriptions,
      pollutantTypes,
      pageTitle,
      displayBacklink,
      forecastSummary,
      summaryDate,
      googleSiteTagId
    })
  } else if (locationString === 'locations/multiple-locations')
    return h.view(locationString, {
      results,
      airQuality,
      airQualityData,
      monitoringSites,
      siteTypeDescriptions,
      pollutantTypes,
      pageTitle,
      serviceName,
      googleSiteTagId,
      userLocation
    })
}
export { showLocationPage }
