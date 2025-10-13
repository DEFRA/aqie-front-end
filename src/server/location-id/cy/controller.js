import {
  siteTypeDescriptions,
  pollutantTypes
} from '../../data/cy/monitoring-sites.js'
import * as airQualityData from '../../data/cy/air-quality.js'
import { calendarEnglish } from '../../data/en/en.js'
import { welsh, calendarWelsh } from '../../data/cy/cy.js'
import moment from 'moment-timezone'
import { convertFirstLetterIntoUppercase } from '../../locations/helpers/convert-first-letter-into-upper-case.js'
import { gazetteerEntryFilter } from '../../locations/helpers/gazetteer-util.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import {
  LANG_CY,
  LANG_EN,
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI,
  LOCATION_NOT_FOUND,
  REDIRECT_STATUS_CODE,
  HTTP_STATUS_INTERNAL_SERVER_ERROR
} from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'
import { getSearchTermsFromUrl } from '../../locations/helpers/get-search-terms-from-url.js'
import { transformKeys } from '../../locations/helpers/transform-summary-keys.js'
import { airQualityValues } from '../../locations/helpers/air-quality-values.js'
import { getNearestLocation } from '../../locations/helpers/get-nearest-location.js'
import { getIdMatch } from '../../locations/helpers/get-id-match.js'
import { getNIData } from '../../locations/helpers/get-ni-single-data.js'
import sizeof from 'object-sizeof'
import { config } from '../../../config/index.js'

const logger = createLogger()

function shouldRedirectToEnglish(query) {
  return query?.lang && query?.lang === LANG_EN && !query?.searchTerms
}

function getPreviousUrl(request) {
  return request.headers.referer || request.headers.referrer
}

function buildRedirectUrl(currentUrl) {
  const { searchTerms, secondSearchTerm, searchTermsLocationType } =
    getSearchTermsFromUrl(currentUrl)
  return `/lleoliad?lang=cy&searchTerms=${encodeURIComponent(searchTerms)}&secondSearchTerm=${encodeURIComponent(secondSearchTerm)}&searchTermsLocationType=${encodeURIComponent(searchTermsLocationType)}`
}

function getLocationType(locationData) {
  return locationData.locationType === LOCATION_TYPE_UK
    ? LOCATION_TYPE_UK
    : LOCATION_TYPE_NI
}

// Common Welsh UI components
const WELSH_UI_COMPONENTS = {
  notFoundLocation: welsh.notFoundLocation,
  footerTxt: welsh.footerTxt,
  phaseBanner: welsh.phaseBanner,
  backlink: welsh.backlink,
  cookieBanner: welsh.cookieBanner,
  daqi: welsh.daqi,
  multipleLocations: welsh.multipleLocations
}

// Helper to initialize Welsh controller variables
function initializeWelshVariables(request) {
  request.yar.clear('searchTermsSaved')
  const lang = LANG_CY
  const formattedDate = moment().format('DD MMMM YYYY').split(' ')
  const getMonth = calendarEnglish.findIndex((item) =>
    item.includes(formattedDate[1])
  )
  const metaSiteUrl = getAirQualitySiteUrl(request)

  return {
    lang,
    getMonth,
    metaSiteUrl,
    ...WELSH_UI_COMPONENTS
  }
}

// Helper to process Welsh location data
async function processWelshLocationData(
  locationData,
  locationId,
  lang,
  useNewRicardoMeasurementsEnabled
) {
  const { getForecasts } = locationData
  const locationType = getLocationType(locationData)
  let distance

  if (locationData.locationType === LOCATION_TYPE_NI) {
    distance = getNearestLocation(
      locationData?.results,
      getForecasts,
      locationType,
      0,
      lang,
      useNewRicardoMeasurementsEnabled
    )
  }

  const indexNI = 0
  const { resultNI } = getNIData(locationData, distance, locationType)
  const { locationIndex, locationDetails } = getIdMatch(
    locationId,
    locationData,
    resultNI,
    locationType,
    indexNI
  )

  const { forecastNum, nearestLocationsRange, nearestLocation } =
    await getNearestLocation(
      locationData?.results,
      getForecasts,
      locationType,
      locationIndex,
      lang,
      useNewRicardoMeasurementsEnabled
    )

  return {
    locationDetails,
    forecastNum,
    nearestLocationsRange,
    nearestLocation
  }
}

// Helper to render Welsh location view
function renderWelshLocationView(h, viewData) {
  const {
    locationDetails,
    airQuality,
    airQualityData,
    nearestLocationsRange,
    siteTypeDescriptions,
    pollutantTypes,
    pageTitle,
    metaSiteUrl,
    description,
    title,
    transformedDailySummary,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    daqi,
    welshMonth,
    summaryDate,
    dailySummaryTexts,
    serviceName,
    lang
  } = viewData

  return h.view('locations/location', {
    result: locationDetails,
    airQuality,
    airQualityData: airQualityData.commonMessages,
    monitoringSites: nearestLocationsRange,
    siteTypeDescriptions,
    pollutantTypes,
    pageTitle,
    metaSiteUrl,
    description,
    title,
    displayBacklink: true,
    transformedDailySummary,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    daqi,
    welshMonth,
    summaryDate,
    dailySummaryTexts,
    serviceName,
    lang
  })
}

// Helper to render Welsh not found view
function renderWelshNotFoundView(
  h,
  { notFoundLocation, footerTxt, phaseBanner, backlink, cookieBanner, lang }
) {
  return h.view(LOCATION_NOT_FOUND, {
    paragraph: notFoundLocation.paragraphs,
    serviceName: notFoundLocation.heading,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    lang
  })
}

const getLocationDetailsController = {
  handler: async (request, h) => {
    try {
      const { query } = request
      const locationId = request.params.id
      const searchTermsSaved = request.yar.get('searchTermsSaved')
      const useNewRicardoMeasurementsEnabled = config.get(
        'useNewRicardoMeasurementsEnabled'
      )

      if (shouldRedirectToEnglish(query)) {
        return h.redirect(`/location/${locationId}/?lang=en`)
      }
      // Get the previous URL hit by the user from the referer header
      const previousUrl = getPreviousUrl(request)
      const currentUrl = request.url.href

      if (previousUrl === undefined && !searchTermsSaved) {
        request.yar.clear('locationData')
        return h
          .redirect(buildRedirectUrl(currentUrl))
          .code(REDIRECT_STATUS_CODE)
          .takeover()
      }

      // Initialize Welsh variables
      const {
        lang,
        getMonth,
        metaSiteUrl,
        notFoundLocation,
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        daqi,
        multipleLocations
      } = initializeWelshVariables(request)

      const locationData = request.yar.get('locationData') || []

      // Process Welsh location data
      const {
        locationDetails,
        forecastNum,
        nearestLocationsRange,
        nearestLocation
      } = await processWelshLocationData(
        locationData,
        locationId,
        lang,
        useNewRicardoMeasurementsEnabled
      )

      if (locationDetails) {
        let { title, headerTitle } = gazetteerEntryFilter(locationDetails)
        title = convertFirstLetterIntoUppercase(title)
        headerTitle = convertFirstLetterIntoUppercase(headerTitle)
        const { transformedDailySummary } = transformKeys(
          locationData.dailySummary,
          lang
        )
        const { airQuality } = airQualityValues(forecastNum, lang)

        logger.info(
          `Before Session (yar) size in MB for geForecasts: ${(sizeof(request.yar._store) / (1024 * 1024)).toFixed(2)} MB`
        )
        // Replace the large getForecasts with a single-record version
        locationData.getForecasts = nearestLocation
        // Replace the large getMeasurements with a filtered version
        locationData.getMeasurements = nearestLocationsRange
        // Save the updated locationData back into session
        request.yar.set('locationData', locationData)
        logger.info(
          `After Session (yar) size in MB for geForecasts: ${(sizeof(request.yar._store) / (1024 * 1024)).toFixed(2)} MB`
        )

        return renderWelshLocationView(h, {
          locationDetails,
          airQuality,
          airQualityData,
          nearestLocationsRange,
          siteTypeDescriptions,
          pollutantTypes,
          pageTitle: `${multipleLocations.titlePrefix} ${title} - ${multipleLocations.pageTitle}`,
          metaSiteUrl,
          description: `${daqi.description.a} ${headerTitle}${daqi.description.b}`,
          title: `${multipleLocations.titlePrefix} ${headerTitle}`,
          transformedDailySummary,
          footerTxt,
          phaseBanner,
          backlink,
          cookieBanner,
          daqi,
          welshMonth: calendarWelsh[getMonth],
          summaryDate:
            lang === LANG_CY
              ? (locationData.welshDate ?? locationData.summaryDate)
              : (locationData.englishDate ?? locationData.summaryDate),
          dailySummaryTexts: welsh.dailySummaryTexts,
          serviceName: multipleLocations.serviceName,
          lang
        })
      } else {
        return renderWelshNotFoundView(h, {
          notFoundLocation,
          footerTxt,
          phaseBanner,
          backlink,
          cookieBanner,
          lang
        })
      }
    } catch (error) {
      logger.error(`error on single location ${error.message}`)
      return h
        .response('Internal Server Error')
        .code(HTTP_STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}

export { getLocationDetailsController }
