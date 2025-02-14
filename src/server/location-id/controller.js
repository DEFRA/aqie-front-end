import {
  siteTypeDescriptions,
  pollutantTypes
} from '~/src/server/data/en/monitoring-sites.js'
import * as airQualityData from '~/src/server/data/en/air-quality.js'
import { english, calendarEnglish } from '~/src/server/data/en/en.js'
import { calendarWelsh } from '~/src/server/data/cy/cy.js'
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
import { getSearchTermsFromUrl } from '~/src/server/locations/helpers/get-search-terms-from-url'
import { transformKeys } from '~/src/server/locations/helpers/transform-summary-keys.js'
import { airQualityValues } from '~/src/server/locations/helpers/air-quality-values.js'

const logger = createLogger()

const getLocationDetailsController = {
  handler: async (request, h) => {
    try {
      const { query, headers } = request
      const locationId = request.params.id
      let locationDetails = null
      const searchTermsSaved = request.yar.get('searchTermsSaved')

      if (query?.lang && query?.lang === LANG_CY && !query?.searchTerms) {
        /* eslint-disable camelcase */
        return h.redirect(`/lleoliad/${locationId}/?lang=cy`)
      }
      // Get the previous URL hit by the user from the referer header
      const previousUrl = headers.referer || headers.referrer
      const currentUrl = request.url.href

      const { searchTerms, secondSearchTerm, searchTermsLocationType } =
        getSearchTermsFromUrl(currentUrl)
      if (previousUrl === undefined && !searchTermsSaved) {
        return h
          .redirect(
            `/location?lang=en&searchTerms=${encodeURIComponent(searchTerms)}&secondSearchTerm=${encodeURIComponent(secondSearchTerm)}&searchTermsLocationType=${encodeURIComponent(searchTermsLocationType)}`
          )
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

      const locationType =
        locationData.locationType === LOCATION_TYPE_UK
          ? LOCATION_TYPE_UK
          : LOCATION_TYPE_NI

      locationDetails = locationData?.results?.find((item) => {
        if (item.GAZETTEER_ENTRY.ID === locationId.replace(/\s/g, '')) {
          return item.GAZETTEER_ENTRY.ID === locationId.replace(/\s/g, '')
        }
        return null
      })
      logger.info(
        `locationData in location id 0 ${JSON.stringify(locationData)}`
      )
      logger.info(
        `locationDetails in location id ${JSON.stringify(locationDetails)}`
      )
      if (locationDetails) {
        let { title, headerTitle } = gazetteerEntryFilter(locationDetails)
        title = convertFirstLetterIntoUppercase(title)
        headerTitle = convertFirstLetterIntoUppercase(headerTitle)
        const { transformedDailySummary } = transformKeys(
          locationData.dailySummary,
          lang
        )

        logger.info(`locationType in location-id ${locationType}`)
        logger.info(
          `locationData in location id ${JSON.stringify(locationData)}`
        )
        const { airQuality } = airQualityValues(locationData.forecastNum, lang)
        logger.info(`locationData results ${JSON.stringify(locationData)})`)
        const { nearestLocationsRangeEnglish, nearestLocationsRangeWelsh } =
          locationData
        logger.info(
          `nearestLocationsRangeEnglish location-id ${JSON.stringify(nearestLocationsRangeEnglish?.nearestLocationsRange)})`
        )
        logger.info(
          `nearestLocationsRangeWelsh location-id ${JSON.stringify(nearestLocationsRangeWelsh?.nearestLocationsRange)})`
        )

        return h.view('locations/location', {
          result: locationDetails,
          airQuality,
          airQualityData: airQualityData.commonMessages,
          monitoringSites:
            lang === LANG_EN
              ? nearestLocationsRangeEnglish?.nearestLocationsRange
              : nearestLocationsRangeWelsh?.nearestLocationsRange,
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
              ? locationData.welshDate
              : locationData.englishDate,
          dailySummaryTexts: english.dailySummaryTexts,
          lang
        })
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
