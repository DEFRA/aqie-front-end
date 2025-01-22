import {
  siteTypeDescriptions,
  pollutantTypes
} from '~/src/server/data/cy/monitoring-sites.js'
import * as airQualityData from '~/src/server/data/cy/air-quality.js'
import { getNearestLocation } from '~/src/server/locations/helpers/get-nearest-location'
import { english, calendarEnglish } from '~/src/server/data/en/en.js'
import { welsh, calendarWelsh } from '~/src/server/data/cy/cy.js'
import moment from 'moment-timezone'
import { firstLetterUppercase } from '~/src/server/common/helpers/stringUtils'
import { gazetteerEntryFilter } from '~/src/server/locations/helpers/gazetteer-util'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { LANG_CY, LANG_EN, LOCATION_TYPE_UK } from '~/src/server/data/constants'

const logger = createLogger()

const getLocationDetailsController = {
  handler: (request, h) => {
    try {
      const { query } = request
      const locationId = request.params.id

      if (query?.lang && query?.lang === LANG_EN) {
        /* eslint-disable camelcase */
        return h.redirect(`/location/${locationId}/?lang=en`)
      }
      const lang = LANG_CY
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
      } = welsh
      const locationData = request.yar.get('locationData') || []

      let locationIndex = 0
      const locationDetails = locationData?.results?.find((item, index) => {
        if (item.GAZETTEER_ENTRY.ID === locationId.replace(/\s/g, '')) {
          locationIndex = index
          return item.GAZETTEER_ENTRY.ID === locationId.replace(/\s/g, '')
        }
        return null
      })

      if (locationDetails) {
        let { title, headerTitle } = gazetteerEntryFilter(locationDetails)
        const { nearestLocationsRange, airQuality } = getNearestLocation(
          locationData.results,
          locationData.rawForecasts,
          locationData.measurements,
          LOCATION_TYPE_UK,
          locationIndex,
          request.query?.lang
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
          forecastSummary: locationData.forecastSummary,
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
