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
  LOCATION_NOT_FOUND
} from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'
import { getSearchTermsFromUrl } from '../../locations/helpers/get-search-terms-from-url.js'
import { transformKeys } from '../../locations/helpers/transform-summary-keys.js'
import { airQualityValues } from '../../locations/helpers/air-quality-values.js'
import { getNearestLocation } from '../../locations/helpers/get-nearest-location.js'
import { getIdMatch } from '../../locations/helpers/get-id-match.js'
import { getNIData } from '../../locations/helpers/get-ni-single-data.js'

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

const getLocationDetailsController = {
  handler: async (request, h) => {
    try {
      const { query } = request
      const locationId = request.params.id
      const searchTermsSaved = request.yar.get('searchTermsSaved')

      if (shouldRedirectToEnglish(query)) {
        return h.redirect(`/location/${locationId}/?lang=en`)
      }
      // Get the previous URL hit by the user from the referer header
      const previousUrl = getPreviousUrl(request)
      const currentUrl = request.url.href

      if (previousUrl === undefined && !searchTermsSaved) {
        request.yar.clear('locationData')
        return h.redirect(buildRedirectUrl(currentUrl)).takeover()
      }
      request.yar.clear('searchTermsSaved')
      const lang = LANG_CY
      const formattedDate = moment().format('DD MMMM YYYY').split(' ')
      const getMonth = calendarEnglish.findIndex(function (item) {
        return item.indexOf(formattedDate[1]) !== -1
      })
      const metaSiteUrl = getAirQualitySiteUrl(request)
      const {
        notFoundLocation,
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        daqi,
        multipleLocations
      } = welsh
      const locationData = request.yar.get('locationData') || []
      const { getForecasts, getMeasurements } = locationData
      const locationType = getLocationType(locationData)
      let distance
      if (locationData.locationType === LOCATION_TYPE_NI) {
        distance = getNearestLocation(
          locationData?.results,
          getForecasts,
          getMeasurements,
          locationType,
          0,
          lang
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
      const { forecastNum, nearestLocationsRange } = getNearestLocation(
        locationData?.results,
        getForecasts,
        getMeasurements,
        locationType,
        locationIndex,
        lang
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

        return h.view('locations/location', {
          result: locationDetails,
          airQuality,
          airQualityData: airQualityData.commonMessages,
          monitoringSites: nearestLocationsRange,
          siteTypeDescriptions,
          pollutantTypes,
          pageTitle: `${multipleLocations.titlePrefix} ${title} - ${multipleLocations.pageTitle}`,
          metaSiteUrl,
          description: `${daqi.description.a} ${headerTitle}${daqi.description.b}`,
          title: `${multipleLocations.titlePrefix} ${headerTitle}`,
          displayBacklink: true,
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
    } catch (error) {
      logger.error(`error on single location ${error.message}`)
      return h.status(500).render('error', {
        error: 'An error occurred while retrieving location details.'
      })
    }
  }
}

export { getLocationDetailsController }
