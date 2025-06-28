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
  transformedDailySummary,
  summaryDate,
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
      transformedDailySummary,
      summaryDate
    })
  } else if (locationString === 'multiple-results/multiple-locations') {
    return h.view(locationString, {
      results,
      airQuality,
      airQualityData,
      monitoringSites,
      siteTypeDescriptions,
      pollutantTypes,
      pageTitle,
      serviceName,
      userLocation
    })
  }
}
export { showLocationPage }
