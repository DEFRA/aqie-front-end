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
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI
} from '~/src/server/data/constants'
import { getAirQualitySiteUrl } from '~/src/server/common/helpers/get-site-url'
import { getSearchTermsFromUrl } from '~/src/server/locations/helpers/get-search-terms-from-url'
import { airQualityValues } from '~/src/server/locations/helpers/air-quality-values.js'

const logger = createLogger()

const getLocationDetailsController = {
  handler: (request, h) => {
    try {
      const { query, headers } = request
      const locationId = request.params.id
      let locationDetails = null
      const searchTermsSaved = request.yar.get('searchTermsSaved')

      if (query?.lang && query?.lang === LANG_CY && !query?.searchTerms) {
        logger.info(
          'Redirecting to Welsh location page in location-id controller'
        )
        /* eslint-disable camelcase */
        return h.redirect(`/lleoliad/${locationId}/?lang=cy`)
      }
      // Get the previous URL hit by the user from the referer header
      const previousUrl = headers.referer || headers.referrer
      const currentUrl = request.url.href

      const { searchTerms, secondSearchTerm, searchTermsLocationType } =
        getSearchTermsFromUrl(currentUrl)
      logger.info(
        `::::::::::: getNIPlaces previousUrl  ::::::::::: ${previousUrl}`
      )
      logger.info(
        `::::::::::: getNIPlaces !searchTermsSaved  ::::::::::: ${!searchTermsSaved}`
      )
      if (previousUrl === undefined && !searchTermsSaved) {
        logger.info(
          'Redirecting to English location middleware from location-id controller'
        )
        return h
          .redirect(
            `/location?lang=en&searchTerms=${encodeURIComponent(searchTerms)}&secondSearchTerm=${encodeURIComponent(secondSearchTerm)}&searchTermsLocationType=${encodeURIComponent(searchTermsLocationType)}`
          )
          .takeover()
      }
      logger.info(
        `::::::::::: getNIPlaces 4 locationId en  ::::::::::: ${locationId}`
      )
      request.yar.clear('searchTermsSaved')
      const lang = LANG_EN
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
      locationDetails = locationData?.results?.find((item) => {
        if (item.GAZETTEER_ENTRY.ID === locationId.replace(/\s/g, '')) {
          return item.GAZETTEER_ENTRY.ID === locationId.replace(/\s/g, '')
        }
        return null
      })
      logger.info(
        `::::::::::: getNIPlaces 4 locationDetails en  ::::::::::: ${JSON.stringify(locationDetails)}`
      )
      logger.info(
        `::::::::::: getNIPlaces 4 locationData en  ::::::::::: ${JSON.stringify(locationData)}`
      )
      if (locationDetails) {
        let { title, headerTitle } = gazetteerEntryFilter(locationDetails)
        title = convertFirstLetterIntoUppercase(title)
        headerTitle = convertFirstLetterIntoUppercase(headerTitle)

        logger.info(
          `::::::::::: getNIPlaces 4 headerTitle  ::::::::::: ${headerTitle}`
        )
        logger.info(`::::::::::: getNIPlaces 4 title  ::::::::::: ${title}`)
        logger.info(
          `:: locationDetails?.GAZETTEER_ENTRY  :::: ${locationDetails?.GAZETTEER_ENTRY}`
        )
        if (locationData.locationType === LOCATION_TYPE_UK) {
          logger.info(`::::::::::: getNIPlaces 4 LOCATION_TYPE_UK  :::::::::::`)
          logger.info(`:::::::::::NIPlaces lang en UK  ::::::::::: ${lang}`)
          logger.info(
            `:::::::::::NIPlaces locationData en UK  ::::::::::: ${JSON.stringify(locationData)}`
          )
          logger.info(
            `:::::::::::NIPlaces locationData.results  en UK ::::::::::: ${JSON.stringify(locationData.results)}`
          )
          logger.info(
            `:::::::::::NIPlaces locationDetails  en UK ::::::::::: ${JSON.stringify(locationDetails)}`
          )
          const { airQuality } = airQualityValues(
            locationData.forecastNum,
            lang
          )
          return h.view('locations/location', {
            result: locationDetails,
            airQuality,
            airQualityData: airQualityData.commonMessages,
            monitoringSites: locationData.monitoringSites,
            siteTypeDescriptions,
            pollutantTypes,
            pageTitle: `${multipleLocations.titlePrefix} ${title}`,
            metaSiteUrl,
            description: `${daqi.description.a} ${headerTitle}${daqi.description.b}`,
            title: `${multipleLocations.titlePrefix} ${headerTitle}`,
            displayBacklink: true,
            transformedDailySummary: locationData.transformedDailySummary,
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
            dailySummaryTexts: english.dailySummaryTexts,
            lang
          })
        } else if (locationData.locationType === LOCATION_TYPE_NI) {
          logger.info(`::::::::::: getNIPlaces 4 LOCATION_TYPE_NI  :::::::::::`)
          logger.info(`:::::::::::NIPlaces lang en NI  ::::::::::: ${lang}`)
          logger.info(
            `:::::::::::NIPlaces locationData en NI  ::::::::::: ${JSON.stringify(locationData)}`
          )
          logger.info(
            `:::::::::::NIPlaces locationData.results  en NI ::::::::::: ${JSON.stringify(locationData?.results)}`
          )
          logger.info(
            `:::::::::::NIPlaces locationDetails  en NI ::::::::::: ${JSON.stringify(locationDetails)}`
          )

          logger.info(
            `::::::::::: getNIPlaces 4 monitoringSites NI  ::::::::::: ${JSON.stringify(locationData.monitoringSites)}`
          )
          const { airQuality } = airQualityValues(
            locationData.forecastNum,
            lang
          )
          logger.info(
            `::::::::::: getNIPlaces 4 airQuality NI  ::::::::::: ${JSON.stringify(airQuality)}`
          )

          return h.view('locations/location', {
            result: locationDetails,
            airQuality,
            airQualityData: airQualityData.commonMessages,
            monitoringSites: locationData?.monitoringSites,
            siteTypeDescriptions,
            pollutantTypes,
            pageTitle: `${multipleLocations.titlePrefix} ${title}`,
            metaSiteUrl,
            description: `${daqi.description.a} ${headerTitle}${daqi.description.b}`,
            title: `${multipleLocations.titlePrefix} ${headerTitle}`,
            displayBacklink: true,
            transformedDailySummary: locationData.transformedDailySummary,
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
            dailySummaryTexts: english.dailySummaryTexts,
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
