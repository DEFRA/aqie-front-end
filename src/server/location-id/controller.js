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
import { getNearestLocation } from '~/src/server/locations/helpers/get-nearest-location'

const logger = createLogger()

const getLocationDetailsController = {
  handler: (request, h) => {
    try {
      const { query } = request
      const locationId = request.params.id
      let locationDetails = null
      logger.info(
        `::::::::::: getNIPlaces 4 locationId  ::::::::::: ${locationId}`
      )
      if (query?.lang && query?.lang === LANG_CY) {
        /* eslint-disable camelcase */
        return h.redirect(`/lleoliad/${locationId}/?lang=cy`)
      }
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
        daqi
      } = english
      const locationData = request.yar.get('locationData') || []
      let locationIndex = 0
      let locationType = ''
      locationDetails = locationData?.results?.find((item, index) => {
        if (item.GAZETTEER_ENTRY.ID === locationId.replace(/\s/g, '')) {
          locationIndex = index
          locationType = item.GAZETTEER_ENTRY?.LOCATION_TYPE
          return item.GAZETTEER_ENTRY.ID === locationId.replace(/\s/g, '')
        }
        return null
      })
      logger.info(
        `::::::::::: getNIPlaces 4 locationDetails  ::::::::::: ${JSON.stringify(locationDetails)}`
      )
      if (locationDetails) {
        let { title, headerTitle } = gazetteerEntryFilter(locationDetails)
        title = convertFirstLetterIntoUppercase(title)
        headerTitle = convertFirstLetterIntoUppercase(headerTitle)

        logger.info(
          `::::::::::: getNIPlaces 4 headerTitle  ::::::::::: ${headerTitle}`
        )
        logger.info(`::::::::::: getNIPlaces 4 title  ::::::::::: ${title}`)
        if (locationType !== LOCATION_TYPE_NI) {
          const { nearestLocationsRange, airQuality } = getNearestLocation(
            locationData.results,
            locationData.rawForecasts,
            locationData.measurements,
            LOCATION_TYPE_UK,
            locationIndex,
            request.query?.lang
          )
          return h.view('locations/location', {
            result: locationDetails,
            airQuality,
            airQualityData: airQualityData.commonMessages,
            monitoringSites: nearestLocationsRange,
            siteTypeDescriptions,
            pollutantTypes,
            pageTitle: `${english.multipleLocations.titlePrefix} ${title}`,
            metaSiteUrl,
            description: `${daqi.description.a} ${headerTitle}${daqi.description.b}`,
            title: `${english.multipleLocations.titlePrefix} ${headerTitle}`,
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
        } else {
          return h.view('locations/location', {
            result: locationDetails,
            airQuality: locationData.airQuality,
            airQualityData: airQualityData.commonMessages,
            monitoringSites: locationData.nearestLocationsRange,
            siteTypeDescriptions,
            pollutantTypes,
            pageTitle: title,
            metaSiteUrl,
            description: `${daqi.description.a} ${headerTitle}${daqi.description.b}`,
            title: headerTitle,
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
          metaSiteUrl,
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
