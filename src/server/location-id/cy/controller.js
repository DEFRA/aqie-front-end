import {
  siteTypeDescriptions,
  pollutantTypes
} from '~/src/server/data/cy/monitoring-sites.js'
import * as airQualityData from '~/src/server/data/cy/air-quality.js'
import { calendarEnglish } from '~/src/server/data/en/en.js'
import { welsh, calendarWelsh } from '~/src/server/data/cy/cy.js'
import moment from 'moment-timezone'
import { convertFirstLetterIntoUppercase } from '~/src/server/locations/helpers/convert-first-letter-into-upper-case'
import { gazetteerEntryFilter } from '~/src/server/locations/helpers/gazetteer-util'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import {
  LANG_CY,
  LANG_EN,
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI,
  LOCATION_NOT_FOUND
} from '~/src/server/data/constants'
import { getAirQualitySiteUrl } from '~/src/server/common/helpers/get-site-url'
import { getSearchTermsFromUrl } from '~/src/server/locations/helpers/get-search-terms-from-url'
import { transformKeys } from '~/src/server/locations/helpers/transform-summary-keys.js'
import { airQualityValues } from '~/src/server/locations/helpers/air-quality-values.js'
import { getNearestLocation } from '~/src/server/locations/helpers/get-nearest-location'
import { getIdMatch } from '~/src/server/locations/helpers/get-id-match'
import { getNIData } from '~/src/server/locations/helpers/get-ni-single-data'
import { compareLastElements } from '~/src/server/locations/helpers/convert-string'

const logger = createLogger()

const getLocationDetailsController = {
  handler: async (request, h) => {
    try {
      const { query, headers } = request
      const locationId = request.params.id
      const searchTermsSaved = request.yar.get('searchTermsSaved')

      if (query?.lang && query?.lang === LANG_EN && !query?.searchTerms) {
        /* eslint-disable camelcase */
        return h.redirect(`/location/${locationId}/?lang=en`)
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
        return h
          .redirect(
            `/lleoliad?lang=cy&searchTerms=${encodeURIComponent(searchTerms)}&secondSearchTerm=${encodeURIComponent(secondSearchTerm)}&searchTermsLocationType=${encodeURIComponent(searchTermsLocationType)}`
          )
          .takeover()
      }
      request.yar.clear('searchTermsSaved')

      const lang = query?.lang ?? LANG_CY
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
        // Get the date from the locationData
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
