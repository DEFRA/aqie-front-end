import {
  siteTypeDescriptions,
  pollutantTypes
} from '~/src/server/data/en/monitoring-sites.js'
import * as airQualityData from '~/src/server/data/en/air-quality.js'
import { getAirQuality } from '~/src/server/data/en/air-quality.js'
import { getNearestLocation } from '~/src/server/locations/helpers/get-nearest-location'
import { english, calendarEnglish } from '~/src/server/data/en/en.js'
import { calendarWelsh } from '~/src/server/data/cy/cy.js'
import moment from 'moment-timezone'
import { firstLetterUppercase } from '~/src/server/common/helpers/stringUtils'
import { gazetteerEntryFilter } from '~/src/server/locations/helpers/gazetteer-util'
import { createLogger } from '~/src/server/common/helpers/logging/logger'

const logger = createLogger()

const getLocationDetailsController = {
  handler: (request, h) => {
    try {
      const { query } = request
      const locationId = request.params.id

      if (query?.lang && query?.lang === 'cy') {
        /* eslint-disable camelcase */
        return h.redirect(`/lleoliad/cy/${locationId}/?lang=cy`)
      }
      const lang = 'en'
      const formattedDate = moment().format('DD MMMM YYYY').split(' ')
      const getMonth = calendarEnglish.findIndex(function (item) {
        return item.indexOf(formattedDate[1]) !== -1
      })

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
      const locationDetails = locationData?.results?.find((item, index) => {
        if (item.GAZETTEER_ENTRY.ROUTE_PATH === locationId.replace(/\s/g, '')) {
          locationIndex = index
          return (
            item.GAZETTEER_ENTRY.ROUTE_PATH === locationId.replace(/\s/g, '')
          )
        }
        return null
      })

      if (locationDetails) {
        let { title, headerTitle } = gazetteerEntryFilter(locationDetails)
        const { forecastNum, nearestLocationsRange } = getNearestLocation(
          locationData.results,
          locationData.rawForecasts,
          locationData.measurements,
          'uk-location',
          locationIndex,
          request.query?.lang
        )
        const airQuality = getAirQuality(
          forecastNum[0][0].today,
          Object.values(forecastNum[0][1])[0],
          Object.values(forecastNum[0][2])[0],
          Object.values(forecastNum[0][3])[0],
          Object.values(forecastNum[0][4])[0]
        )
        title = firstLetterUppercase(title)
        headerTitle = firstLetterUppercase(headerTitle)

        return h.view('locations/location', {
          result: locationDetails,
          airQuality,
          airQualityData: airQualityData.commonMessages,
          monitoringSites: nearestLocationsRange,
          siteTypeDescriptions,
          pollutantTypes,
          pageTitle: title,
          title: headerTitle,
          displayBacklink: true,
          forecastSummary: locationData.forecastSummary.today,
          dailySummary: locationData.forecastSummary,
          footerTxt,
          phaseBanner,
          backlink,
          cookieBanner,
          daqi,
          welshMonth: calendarWelsh[getMonth],
          summaryDate:
            lang === 'cy' ? locationData.welshDate : locationData.englishDate,
          dailySummaryTexts: english.dailySummaryTexts,
          lang
        })
      } else {
        return h.view('location-not-found', {
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
