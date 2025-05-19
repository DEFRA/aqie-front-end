import { handleMultipleMatches } from '~/src/server/locations/helpers/middleware-helpers'
import {
  siteTypeDescriptions,
  pollutantTypes
} from '~/src/server/data/en/monitoring-sites.js'
// Helper function to handle multiple matches
const handleMultipleMatchesHelper = (h, request, params, selectedMatches) => {
  const {
    locationNameOrPostcode,
    userLocation,
    getForecasts,
    getMeasurements,
    getDailySummary,
    airQualityData,
    transformedDailySummary,
    calendarWelsh,
    month,
    welshDate,
    englishDate,
    locationType,
    lang,
    english
  } = params
  const { multipleLocations, backlink, cookieBanner, phaseBanner, footerTxt } =
    english

  return handleMultipleMatches(h, request, {
    selectedMatches,
    locationNameOrPostcode,
    userLocation,
    getForecasts,
    getMeasurements,
    multipleLocations,
    airQualityData,
    siteTypeDescriptions,
    pollutantTypes,
    getDailySummary,
    transformedDailySummary,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    calendarWelsh,
    month,
    welshDate,
    englishDate,
    locationType,
    lang
  })
}

export { handleMultipleMatchesHelper }
