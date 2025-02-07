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
  LOCATION_TYPE_NI,
  LOCATION_TYPE_UK
} from '~/src/server/data/constants'
import { getAirQualitySiteUrl } from '~/src/server/common/helpers/get-site-url'
import { getNearestLocation } from '~/src/server/locations/helpers/get-nearest-location'
import { getSearchTermsFromUrl } from '~/src/server/locations/helpers/get-search-terms-from-url'
import { airQUalityValues } from '~/src/server/locations/helpers/air-quality-values'
import { transformKeys } from '~/src/server/locations/helpers/generate-daily-summary-with-calendar-day.js'

const logger = createLogger()

const getLocationDetailsController = {
  handler: (request, h) => {
    try {
      const { query, headers } = request
      const locationId = request.params.id
      let locationDetails = null
      const searchTermsSaved = request.yar.get('searchTermsSaved')

      if (query?.lang && query?.lang === LANG_EN && !query?.searchTerms) {
        logger.info(
          'Redirecting to English location page in location-id controller'
        )
        /* eslint-disable camelcase */
        return h.redirect(`/location/${locationId}/?lang=en`)
      }
      // Get the previous URL hit by the user from the referer header
      const previousUrl = headers.referer || headers.referrer
      const currentUrl = request.url.href

      const { searchTerms, secondSearchTerm, searchTermsLocationType } =
        getSearchTermsFromUrl(currentUrl)
      if (previousUrl === undefined && !searchTermsSaved) {
        logger.info(
          'Redirecting to Welsh location middleware from location-id controller'
        )
        return h
          .redirect(
            `/lleoliad?lang=cy&searchTerms=${encodeURIComponent(searchTerms)}&secondSearchTerm=${encodeURIComponent(secondSearchTerm)}&searchTermsLocationType=${encodeURIComponent(searchTermsLocationType)}`
          )
          .takeover()
      }
      logger.info(
        `::::::::::: getNIPlaces 4 locationId cy  ::::::::::: ${locationId}`
      )
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

      let locationIndex = 0
      locationDetails = locationData?.results?.find((item, index) => {
        if (item.GAZETTEER_ENTRY.ID === locationId.replace(/\s/g, '')) {
          locationIndex = index
          return item.GAZETTEER_ENTRY.ID === locationId.replace(/\s/g, '')
        }
        return null
      })
      logger.info(
        `::::::::::: getNIPlaces 4 locationDetails cy  ::::::::::: ${JSON.stringify(locationDetails)}`
      )
      logger.info(
        `::::::::::: getNIPlaces 4 locationData cy  ::::::::::: ${JSON.stringify(locationData)}`
      )
      logger.info(
        `::::::::::: getNIPlaces 4 locationDetails cy  ::::::::::: ${JSON.stringify(locationDetails)}`
      )
      if (locationDetails) {
        let { title, headerTitle } = gazetteerEntryFilter(locationDetails)
        title = convertFirstLetterIntoUppercase(title)
        headerTitle = convertFirstLetterIntoUppercase(headerTitle)
        if (locationData.locationType === LOCATION_TYPE_UK) {
          const { nearestLocationsRange, airQuality } = getNearestLocation(
            locationData.results,
            locationData.rawForecasts,
            locationData.measurements,
            LOCATION_TYPE_UK,
            locationIndex,
            lang
          )
          logger.info(
            `::::::::LANG-FROM-LOCATION-ID-CY_CONTROLLER:::::::::::: ,
            ${lang}`
          )
          const { transformedDailySummary } = transformKeys(
            locationData.dailySummary,
            lang
          )
          logger.info(
            `::::::::transformedDailySummary-FROM-LOCATION-ID-CY-CONTROLLER::::::::::: ,
             ${JSON.stringify(transformedDailySummary)}`
          )
          return h.view('locations/location', {
            result: locationDetails,
            airQuality,
            airQualityData: airQualityData.commonMessages,
            monitoringSites: nearestLocationsRange,
            siteTypeDescriptions,
            pollutantTypes,
            pageTitle: `${multipleLocations.titlePrefix} ${title}`,
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
            serviceName: notFoundLocation.heading,
            summaryDate:
              lang === LANG_CY
                ? locationData.welshDate ?? locationData.summaryDate
                : locationData.englishDate ?? locationData.summaryDate,
            dailySummaryTexts: welsh.dailySummaryTexts,
            lang
          })
        } else if (locationData.locationType === LOCATION_TYPE_NI) {
          logger.info(`:::::::::::NIPlaces lang cy NI  ::::::::::: ${lang}`)
          logger.info(
            `:::::::::::NIPlaces locationData cy NI  ::::::::::: ${JSON.stringify(locationData)}`
          )
          logger.info(
            `:::::::::::NIPlaces locationData.results  cy NI ::::::::::: ${JSON.stringify(locationData?.results)}`
          )
          logger.info(
            `:::::::::::NIPlaces locationDetails  cy NI ::::::::::: ${JSON.stringify(locationDetails)}`
          )
          const airQuality = airQUalityValues(locationData.forecastNum, lang)

          return h.view('locations/location', {
            result: locationDetails,
            airQuality,
            airQualityData: airQualityData.commonMessages,
            monitoringSites: locationData.nearestLocationsRange,
            siteTypeDescriptions,
            pollutantTypes,
            pageTitle: `${multipleLocations.titlePrefix} ${title}`,
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
                ? locationData.welshDate ?? locationData.summaryDate
                : locationData.englishDate ?? locationData.summaryDate,
            dailySummaryTexts: welsh.dailySummaryTexts,
            lang
          })
        }
      } else {
        return h.view('location-not-found/index', {
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
