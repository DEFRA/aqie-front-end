import { getNearestLocation } from '~/src/server/locations/helpers/get-nearest-location'
import moment from 'moment-timezone'
import { getMonth } from '~/src/server/locations/helpers/location-type-util'
import { getAirQuality } from '~/src/server/data/en/air-quality.js'
import { english, calendarEnglish } from '~/src/server/data/en/en.js'
import { calendarWelsh } from '~/src/server/data/cy/cy.js'
import { firstLetterUppercase } from '~/src/server/common/helpers/stringUtils'
import { sentenceCase } from '~/src/server/common/helpers/sentence-case'
import * as airQualityData from '~/src/server/data/en/air-quality.js'
import {
  siteTypeDescriptions,
  pollutantTypes
} from '~/src/server/data/en/monitoring-sites.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { fetchData } from '~/src/server/locations/helpers/fetch-data'

const {
  footerTxt,
  phaseBanner,
  backlink,
  cookieBanner,
  notFoundLocation,
  multipleLocations,
  home,
  daqi
} = english

const logger = createLogger()

const selectNIUKLocationType = async (
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
) => {
  const { query, payload } = request
  const airQuality = getAirQuality(payload?.aq, 2, 4, 5, 7)
  const formattedDateSummary = moment(getDailySummary.issue_date)
    .format('DD MMMM YYYY')
    .split(' ')
  const getMonthSummary = calendarEnglish.findIndex(function (item) {
    return item.indexOf(formattedDateSummary[1]) !== -1
  })
  const englishDate = `${formattedDateSummary[0]} ${calendarEnglish[getMonthSummary]} ${formattedDateSummary[2]}`
  const welshDate = `${formattedDateSummary[0]} ${calendarWelsh[getMonthSummary]} ${formattedDateSummary[2]}`
  if (locationType === 'uk-location') {
    const { results } = getOSPlaces
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
        lang: 'en'
      })
    }

    let matches = results.filter((item) => {
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

    request.yar.set('locationData', {
      results: matches,
      rawForecasts: getForecasts?.forecasts,
      forecastNum: matches.length !== 0 ? forecastNum : 0,
      forecastSummary: getDailySummary,
      nearestLocationsRange: matches.length !== 0 ? nearestLocationsRange : [],
      measurements: getMeasurements?.measurements,
      englishDate,
      welshDate,
      getMonth
    })
    //
    if (matches.length === 1) {
      const locationDetails = matches[0]
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
      const airQuality = getAirQuality(
        forecastNum[0][0].today,
        Object.values(forecastNum[0][1])[0],
        Object.values(forecastNum[0][2])[0],
        Object.values(forecastNum[0][3])[0],
        Object.values(forecastNum[0][4])[0]
      )
      title = firstLetterUppercase(title)
      headerTitle = firstLetterUppercase(headerTitle)
      logger.info(
        `::::::::::: multipleLocations.title  1 ::::::::::: ${headerTitle}`
      )
      logger.info(`::::::::::: multipleLocations.title 1  ::::::::::: ${title}`)
      return h.view('locations/location', {
        result: matches[0],
        airQuality,
        airQualityData: airQualityData.commonMessages,
        monitoringSites: nearestLocationsRange,
        siteTypeDescriptions,
        pollutantTypes,
        displayBacklink: true,
        pageTitle: title,
        title: headerTitle,
        serviceName: 'Check air quality',
        forecastSummary: getDailySummary.today,
        dailySummary: getDailySummary,
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        daqi,
        welshMonth: calendarWelsh[getMonth],
        summaryDate: lang === 'cy' ? welshDate : englishDate,
        dailySummaryTexts: english.dailySummaryTexts,
        lang
      })
    } else if (matches.length > 1 && locationNameOrPostcode.length > 3) {
      userLocation = userLocation.toLowerCase()
      userLocation =
        userLocation.charAt(0).toUpperCase() + userLocation.slice(1)
      logger.info(
        `::::::::::: multipleLocations.title  1 ::::::::::: ${multipleLocations.title}`
      )
      logger.info(
        `::::::::::: multipleLocations.title 2  ::::::::::: ${multipleLocations.title}`
      )
      return h.view('multiple-results/multiple-locations', {
        results: matches,
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
        summaryDate: lang === 'cy' ? welshDate : englishDate,
        lang: 'en'
      })
    } else {
      return h.view('locations/location-not-found', {
        userLocation: locationNameOrPostcode,
        serviceName: notFoundLocation.heading,
        paragraph: notFoundLocation.paragraphs,
        pageTitle: `${notFoundLocation.paragraphs.a} ${locationNameOrPostcode} - ${multipleLocations.pageTitle}`,
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        lang
      })
    }
  } else if (locationType === 'ni-location') {
    const { getNIPlaces } = await fetchData(
      'ni-location',
      userLocation,
      request,
      h
    )
    logger.info(`::::::::::: getNIPlaces en  ::::::::::: ${getNIPlaces}`)
    logger.info(
      `::::::::::: getNIPlaces statusCode en  ::::::::::: ${getNIPlaces?.statusCode}`
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

    const { results } = getNIPlaces
    const { forecastNum, nearestLocationsRange, latlon } = getNearestLocation(
      results,
      getForecasts?.forecasts,
      getMeasurements?.measurements,
      'ni-location',
      0,
      lang
    )
    const locationData = {
      GAZETTEER_ENTRY: {
        NAME1: results[0].postcode,
        DISTRICT_BOROUGH: sentenceCase(results[0].administrativeArea),
        LONGITUDE: latlon.lon,
        LATITUDE: latlon.lat
      }
    }
    let title = ''
    let headerTitle = ''
    if (locationData) {
      if (locationData.GAZETTEER_ENTRY.NAME2) {
        title =
          locationData.GAZETTEER_ENTRY.NAME2 +
          ', ' +
          locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH +
          ' - ' +
          home.pageTitle
        headerTitle =
          locationData.GAZETTEER_ENTRY.NAME2 +
          ', ' +
          locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH
      } else {
        title =
          locationData.GAZETTEER_ENTRY.NAME1 +
          ', ' +
          locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH +
          ' - ' +
          home.pageTitle
        headerTitle =
          locationData.GAZETTEER_ENTRY.NAME1 +
          ', ' +
          locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH
      }
    }
    title = firstLetterUppercase(title)
    headerTitle = firstLetterUppercase(headerTitle)
    const airQuality = getAirQuality(
      forecastNum[0][0].today,
      Object.values(forecastNum[0][1])[0],
      Object.values(forecastNum[0][2])[0],
      Object.values(forecastNum[0][3])[0],
      Object.values(forecastNum[0][4])[0]
    )
    if (lang === 'en') {
      if (query?.lang === 'cy') {
        /* eslint-disable camelcase */
        return h.redirect(`/lleoliad?lang=cy`)
      }
    }

    return h.view('locations/location', {
      result: locationData,
      airQuality,
      airQualityData: airQualityData.commonMessages,
      monitoringSites: nearestLocationsRange,
      siteTypeDescriptions,
      pollutantTypes,
      pageTitle: title,
      title: headerTitle,
      displayBacklink: true,
      forecastSummary: getDailySummary.today,
      dailySummary: getDailySummary,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      daqi,
      welshMonth: calendarWelsh[getMonth],
      summaryDate: lang === 'cy' ? welshDate : englishDate,
      dailySummaryTexts: english.dailySummaryTexts,
      lang
    })
  }
  return null
}

export { selectNIUKLocationType }
