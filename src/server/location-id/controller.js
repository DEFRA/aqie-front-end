import {
  siteTypeDescriptions,
  pollutantTypes
} from '../data/en/monitoring-sites.js'
import * as airQualityData from '../data/en/air-quality.js'
import {
  LANG_CY,
  LANG_EN,
  LOCATION_NOT_FOUND,
  LOCATION_TYPE_NI,
  LOCATION_TYPE_UK,
  REDIRECT_STATUS_CODE
} from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { english, calendarEnglish } from '../data/en/en.js'
import { calendarWelsh } from '../data/cy/cy.js'
import moment from 'moment-timezone'
import { convertFirstLetterIntoUppercase } from '../locations/helpers/convert-first-letter-into-upper-case.js'
import { gazetteerEntryFilter } from '../locations/helpers/gazetteer-util.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getSearchTermsFromUrl } from '../locations/helpers/get-search-terms-from-url.js'
import { transformKeys } from '../locations/helpers/transform-summary-keys.js'
import { airQualityValues } from '../locations/helpers/air-quality-values.js'
import { getNearestLocation } from '../locations/helpers/get-nearest-location.js'
import { getIdMatch } from '../locations/helpers/get-id-match.js'
import { getNIData } from '../locations/helpers/get-ni-single-data.js'
import { compareLastElements } from '../locations/helpers/convert-string.js'

const logger = createLogger()

const getLocationDetailsController = {
  handler: async (request, h) => {
    try {
      const { query, headers } = request
      const locationId = request.params.id
      const searchTermsSaved = request.yar.get('searchTermsSaved')

      if (query?.lang && query?.lang === LANG_CY && !query?.searchTerms) {
        return h
          .redirect(`/lleoliad/${locationId}/?lang=cy`)
          .code(REDIRECT_STATUS_CODE)
      }
      // Get the previous URL hit by the user from the referer header
      const previousUrl = headers.referer || headers.referrer
      const currentUrl = request.url.href
      const isPreviousAndCurrentUrlEqual = compareLastElements(
        previousUrl,
        currentUrl
      )
      if (
        (previousUrl === undefined && !searchTermsSaved) ||
        (isPreviousAndCurrentUrlEqual && !searchTermsSaved)
      ) {
        const { searchTerms, secondSearchTerm, searchTermsLocationType } =
          getSearchTermsFromUrl(currentUrl)
        request.yar.clear('locationData')
        console.log('redirectioning to location search 1')
        return h
          .redirect(
            `/location?lang=en&searchTerms=${encodeURIComponent(searchTerms)}&secondSearchTerm=${encodeURIComponent(
              secondSearchTerm
            )}&searchTermsLocationType=${encodeURIComponent(
              searchTermsLocationType
            )}`
          )
          .code(REDIRECT_STATUS_CODE)
          .takeover()
      }
      request.yar.clear('searchTermsSaved')

      const lang = query?.lang ?? LANG_EN
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
      } = english
      const locationData = request.yar.get('locationData') || []
      const { getForecasts, getMeasurements } = locationData
      const locationType =
        locationData.locationType === LOCATION_TYPE_UK
          ? LOCATION_TYPE_UK
          : LOCATION_TYPE_NI
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
              ? locationData.welshDate
              : locationData.englishDate,
          dailySummaryTexts: english.dailySummaryTexts,
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
      return h.response('Internal Server Error').code(500)
    }
  }
}

export { getLocationDetailsController }
