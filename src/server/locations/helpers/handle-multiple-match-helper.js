import { handleMultipleMatches } from './middleware-helpers.js'
import {
  siteTypeDescriptions,
  pollutantTypes
} from '../../data/en/monitoring-sites.js'
// Helper function to handle multiple matches
const handleMultipleMatchesHelper = (h, request, params, selectedMatches) => {
  const {
    locationNameOrPostcode,
    userLocation,
    getForecasts,
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
