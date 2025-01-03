import * as airQualityData from '~/src/server/data/cy/air-quality.js'
import {
  getLocationNameOrPostcode,
  getMonth
} from '~/src/server/locations/helpers/location-type-util'
import { fetchData } from '~/src/server/locations/helpers/fetch-data'
import moment from 'moment-timezone'
import { welsh, calendarWelsh } from '~/src/server/data/cy/cy.js'
import { english, calendarEnglish } from '~/src/server/data/en/en.js'
import { firstLetterUppercase } from '~/src/server/common/helpers/stringUtils'
import { getNearestLocation } from '~/src/server/locations/helpers/get-nearest-location'
import { LANG_CY } from '~/src/server/data/constants'
import { convertStringToHyphenatedLowercaseWords } from '~/src/server/locations/helpers/convert-string'
import { getAirQuality } from '~/src/server/data/cy/air-quality.js'
import {
  siteTypeDescriptions,
  pollutantTypes
} from '~/src/server/data/cy/monitoring-sites.js'
import { routesTitles } from '~/src/server/locations/helpers/routes-titles-util'
import { createLogger } from '~/src/server/common/helpers/logging/logger'

const logger = createLogger()

const searchMiddlewareCy = async (request, h) => {
  const partialPostcodePattern = /^([A-Z]{1,2}\d[A-Z\d]?)$/
  const lang = LANG_CY
  const {
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    notFoundLocation,
    multipleLocations,
    home
  } = welsh

  const { payload } = request
  const locationType = payload?.locationType
  const locationNameOrPostcode = getLocationNameOrPostcode(
    locationType,
    payload
  )
  let userLocation = locationNameOrPostcode.toUpperCase()
  const { getDailySummary, getForecasts, getMeasurements, getOSPlaces } =
    await fetchData(locationType, userLocation, request, h)
  const { results } = getOSPlaces
  let matches = []
  if (locationType === 'uk-location') {
    if (!results || results.length === 0 || getOSPlaces === 'wrong postcode') {
      return h.view('locations/location-not-found', {
        userLocation: locationNameOrPostcode,
        serviceName: notFoundLocation.heading,
        paragraph: notFoundLocation.paragraphs,
        pageTitle: `${notFoundLocation.paragraphs.a} ${userLocation} - ${home.pageTitle}`,
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        lang: 'cy'
      })
    }

    matches = results.filter((item) => {
      const name = item?.GAZETTEER_ENTRY.NAME1.toUpperCase().replace(/\s+/g, '')
      const name2 = item?.GAZETTEER_ENTRY.NAME2?.toUpperCase().replace(
        /\s+/g,
        ''
      )
      return (
        name.includes(userLocation.replace(/\s+/g, '')) ||
        userLocation.includes(name) ||
        userLocation.includes(name2)
      )
    })
    // If it's a partial postcode and there are matches, use the first match and adjust the title
    if (
      partialPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
      matches.length > 0 &&
      locationNameOrPostcode.length <= 3
    ) {
      if (matches[0].GAZETTEER_ENTRY.NAME2) {
        matches[0].GAZETTEER_ENTRY.NAME1 = matches[0].GAZETTEER_ENTRY.NAME2
      } else {
        matches[0].GAZETTEER_ENTRY.NAME1 = locationNameOrPostcode.toUpperCase() // Set the name to the partial postcode
      }
      matches = [matches[0]]
    }

    const { forecastNum, nearestLocationsRange } = getNearestLocation(
      matches,
      getForecasts?.forecasts,
      getMeasurements?.measurements,
      'uk-location',
      0,
      lang
    )
    const formattedDateSummary = moment(getDailySummary.issue_date)
      .format('DD MMMM YYYY')
      .split(' ')
    const getMonthSummary = calendarEnglish.findIndex(function (item) {
      return item.indexOf(formattedDateSummary[1]) !== -1
    })

    const airQuality = getAirQuality(
      forecastNum[0][0].today,
      Object.values(forecastNum[0][1])[0],
      Object.values(forecastNum[0][2])[0],
      Object.values(forecastNum[0][3])[0],
      Object.values(forecastNum[0][4])[0]
    )

    const englishDate = `${formattedDateSummary[0]} ${calendarEnglish[getMonthSummary]} ${formattedDateSummary[2]}`
    const welshDate = `${formattedDateSummary[0]} ${calendarWelsh[getMonthSummary]} ${formattedDateSummary[2]}`

    if (matches.length === 1) {
      const refactoredForRouteTitle = routesTitles(
        matches,
        locationNameOrPostcode
      )
      const locationDetails = refactoredForRouteTitle[0]
      let title = ''
      let headerTitle = ''
      if (locationDetails) {
        if (locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH) {
          if (locationDetails.GAZETTEER_ENTRY.NAME2) {
            title =
              locationDetails.GAZETTEER_ENTRY.NAME2 +
              ', ' +
              locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH +
              ' - ' +
              home.pageTitle
            headerTitle =
              locationDetails.GAZETTEER_ENTRY.NAME2 +
              ', ' +
              locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH
          } else {
            title =
              locationDetails.GAZETTEER_ENTRY.NAME1 +
              ', ' +
              locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH +
              ' - ' +
              home.pageTitle
            headerTitle =
              locationDetails.GAZETTEER_ENTRY.NAME1 +
              ', ' +
              locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH
          }
        } else {
          title =
            locationNameOrPostcode +
            ', ' +
            locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY +
            ' - ' +
            home.pageTitle
          headerTitle =
            locationNameOrPostcode +
            ', ' +
            locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY
        }
      }
      const headerTitleRoute =
        convertStringToHyphenatedLowercaseWords(headerTitle)
      const titleRoute = convertStringToHyphenatedLowercaseWords(title)
      title = firstLetterUppercase(title)
      headerTitle = firstLetterUppercase(headerTitle)

      request.yar.set('locationData', {
        results: refactoredForRouteTitle,
        rawForecasts: getForecasts?.forecasts,
        forecastNum: matches.length !== 0 ? forecastNum : 0,
        forecastSummary: getDailySummary,
        nearestLocationsRange:
          matches.length !== 0 ? nearestLocationsRange : [],
        measurements: getMeasurements?.measurements,
        englishDate,
        welshDate,
        getMonth,
        title,
        headerTitle,
        titleRoute,
        headerTitleRoute
      })
      return h.redirect(`/lleoliad/${headerTitleRoute}`).takeover()
    } else if (matches.length > 1 && locationNameOrPostcode.length > 3) {
      userLocation = userLocation.toLowerCase()
      userLocation =
        userLocation.charAt(0).toUpperCase() + userLocation.slice(1)

      const refactoredForRouteTitle = routesTitles(
        matches,
        locationNameOrPostcode
      )

      request.yar.set('locationData', {
        results: refactoredForRouteTitle,
        rawForecasts: getForecasts?.forecasts,
        measurements: getMeasurements?.measurements,
        multipleLocations,
        title: multipleLocations.title,
        paragraphs: multipleLocations.paragraphs,
        userLocation: locationNameOrPostcode,
        airQuality,
        airQualityData: airQualityData.commonMessages,
        monitoringSites: nearestLocationsRange,
        siteTypeDescriptions,
        pollutantTypes,
        pageTitle: `${multipleLocations.title} ${userLocation} -  ${multipleLocations.pageTitle}`,
        serviceName: multipleLocations.serviceName,
        forecastSummary: getDailySummary.today,
        dailySummary: getDailySummary,
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        welshMonth: calendarWelsh[getMonth],
        calendarWelsh,
        summaryDate: lang === 'cy' ? welshDate : englishDate,
        lang
      })

      return h.redirect('canlyniadau-lluosog').takeover()
    }
  } else if (locationType === 'ni-location') {
    const { getNIPlaces } = await fetchData(
      'ni-location',
      userLocation,
      request,
      h
    )
    logger.info(`::::::::::: getNIPlaces cy  ::::::::::: ${getNIPlaces}`)
    logger.info(
      `::::::::::: getNIPlaces statusCode cy  ::::::::::: ${getNIPlaces?.statusCode}`
    )
    if (
      getOSPlaces?.statusCode !== 200 &&
      getOSPlaces?.statusCode !== undefined
    ) {
      return h.view('error/index', {
        footerTxt,
        url: request.path,
        phaseBanner,
        displayBacklink: false,
        cookieBanner,
        serviceName: english.multipleLocations.serviceName,
        notFoundUrl: english.notFoundUrl,
        statusCode:
          getOSPlaces?.statusCode ||
          getForecasts?.statusCode ||
          getMeasurements?.statusCode ||
          getDailySummary?.statusCode,
        lang
      })
    }
    if (!getNIPlaces?.results || getNIPlaces?.results.length === 0) {
      return h.view('locations/location-not-found', {
        userLocation: locationNameOrPostcode,
        serviceName: notFoundLocation.heading,
        paragraph: notFoundLocation.paragraphs,
        pageTitle: `${notFoundLocation.paragraphs.a} ${userLocation} - ${home.pageTitle}`,
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        lang
      })
    }

    // const locationData = {
    //   GAZETTEER_ENTRY: {
    //     NAME1: results[0].postcode,
    //     DISTRICT_BOROUGH: sentenceCase(results[0].administrativeArea),
    //     LONGITUDE: latlon.lon,
    //     LATITUDE: latlon.lat
    //   }
    // }

    // let title = ''
    // let headerTitle = ''
    // if (locationData) {
    //   if (locationData.GAZETTEER_ENTRY.NAME2) {
    //     title =
    //       locationData.GAZETTEER_ENTRY.NAME2 +
    //       ', ' +
    //       locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH +
    //       ' - ' +
    //       home.pageTitle
    //     headerTitle =
    //       locationData.GAZETTEER_ENTRY.NAME2 +
    //       ', ' +
    //       locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH
    //   } else {
    //     title =
    //       locationData.GAZETTEER_ENTRY.NAME1 +
    //       ', ' +
    //       locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH +
    //       ' - ' +
    //       home.pageTitle
    //     headerTitle =
    //       locationData.GAZETTEER_ENTRY.NAME1 +
    //       ', ' +
    //       locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH
    //   }
    // }
    // title = firstLetterUppercase(title)
    // headerTitle = firstLetterUppercase(headerTitle)

    return h.redirect(`/location/${matches[0].id}`).takeover()
  }
}

export { searchMiddlewareCy }
