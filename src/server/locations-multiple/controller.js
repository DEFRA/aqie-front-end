import {
  siteTypeDescriptions,
  pollutantTypes
} from '~/src/server/data/en/monitoring-sites.js'
import * as airQualityData from '~/src/server/data/en/air-quality.js'
import { getAirQuality } from '~/src/server/data/en/air-quality.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { getNearestLocation } from '~/src/server/locations/helpers/get-nearest-location'
import { fetchData } from '~/src/server/locations/helpers/fetch-data'
import { english, calendarEnglish } from '~/src/server/data/en/en.js'
import { calendarWelsh } from '~/src/server/data/cy/cy.js'
import moment from 'moment-timezone'
import { firstLetterUppercase } from '~/src/server/common/helpers/stringUtils'
import { LANG_EN } from '~/src/server/data/constants'
import {
  getLocationNameOrPostcode,
  handleRedirect,
  configureLocationTypeAndRedirects,
  filteredAndSelectedLocationType
} from '~/src/server/locations/helpers/location-type-util'
import { selectNIUKLocationType } from '~/src/server/locations/helpers/uk-ni-select-util'
import { gazetteerEntryFilter } from '~/src/server/locations/helpers/gazetteer-util'

const logger = createLogger()

const getLocationDataController = {
  handler: async (request, h) => {
    const { query, payload, headers } = request
    const lang = LANG_EN
    const tempString = headers?.referer?.split('/')[3]
    const str = tempString?.split('?')[0]
    const partialPostcodePattern = /^([A-Z]{1,2}\d[A-Z\d]?)$/

    const redirectResponse = handleRedirect(query, h)
    if (redirectResponse) return redirectResponse
    const { searchLocation, footerTxt, phaseBanner, cookieBanner } = english
    const locationType = payload?.locationType
    const airQuality = getAirQuality(payload?.aq, 2, 4, 5, 7)
    const locationNameOrPostcode = getLocationNameOrPostcode(
      locationType,
      payload
    )
    const userLocation = locationNameOrPostcode.toUpperCase()
    configureLocationTypeAndRedirects(
      request,
      h,
      locationType,
      locationNameOrPostcode,
      str,
      query,
      searchLocation,
      airQuality
    )
    filteredAndSelectedLocationType(
      locationType,
      userLocation,
      request,
      searchLocation,
      h
    )
    try {
      const { getDailySummary, getForecasts, getMeasurements, getOSPlaces } =
        await fetchData(locationType, userLocation, request, h)

      return selectNIUKLocationType(
        request,
        getForecasts,
        getMeasurements,
        getDailySummary,
        locationType,
        userLocation,
        locationNameOrPostcode,
        getOSPlaces,
        partialPostcodePattern,
        lang,
        h
      )
    } catch (error) {
      logger.error(
        `error from location refresh outside fetch APIs: ${error.message}`
      )
      let statusCode = 500
      if (
        error.message ===
        "Cannot read properties of undefined (reading 'access_token')"
      ) {
        statusCode = 401
      }
      return h.view('error/index', {
        pageTitle: english.notFoundUrl.serviceAPI.pageTitle,
        footerTxt,
        url: request.path,
        phaseBanner,
        displayBacklink: false,
        cookieBanner,
        serviceName: english.multipleLocations.serviceName,
        notFoundUrl: english.notFoundUrl,
        statusCode,
        lang
      })
    }
  }
}

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
      const locationDetails = locationData?.data?.find((item, index) => {
        if (item.GAZETTEER_ENTRY.ID === locationId.replace(/\s/g, '')) {
          locationIndex = index
          return item.GAZETTEER_ENTRY.ID === locationId.replace(/\s/g, '')
        }
        return null
      })

      if (locationDetails) {
        let { title, headerTitle } = gazetteerEntryFilter(locationDetails)
        const { forecastNum, nearestLocationsRange } = getNearestLocation(
          locationData.data,
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

export { getLocationDataController, getLocationDetailsController }
