import {
  siteTypeDescriptions,
  pollutantTypes
} from '~/src/server/data/cy/monitoring-sites.js'
import * as airQualityData from '~/src/server/data/cy/air-quality.js'
import { getAirQuality } from '~/src/server/data/cy/air-quality.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { getNearestLocation } from '~/src/server/locations/helpers/get-nearest-location'
import { fetchData } from '~/src/server/locations/helpers/fetch-data'
import { welsh, calendarWelsh } from '~/src/server/data/cy/cy.js'
import { calendarEnglish } from '~/src/server/data/en/en.js'
import moment from 'moment-timezone'

const logger = createLogger()
const getLocationDataController = {
  handler: async (request, h) => {
    const { query } = request
    const lang = 'cy'
    // Extract query parameters using URLSearchParams
    /* eslint-disable camelcase */
    const urlParams = new URLSearchParams(request.url.search)
    let userId = urlParams.get('userId')
    let utm_source = urlParams.get('utm_source')
    const tempString = request?.headers?.referer?.split('/')[3]
    const str = tempString?.split('?')[0]
    if (query?.lang && query?.lang === 'en') {
      return h.redirect(
        `/location?lang=en&userId=${userId}&utm_source=${utm_source}`
      )
    }
    const formattedDate = moment().format('DD MMMM YYYY').split(' ')
    const getMonth = calendarEnglish.findIndex(function (item) {
      return item.indexOf(formattedDate[1]) !== -1
    })
    const englishDate = `${formattedDate[0]} ${calendarEnglish[getMonth]} ${formattedDate[2]}`
    const welshDate = `${formattedDate[0]} ${calendarWelsh[getMonth]} ${formattedDate[2]}`

    const {
      searchLocation,
      notFoundLocation,
      multipleLocations,
      footerTxt,
      phaseBanner,
      backlink,
      home,
      cookieBanner,
      daqi
    } = welsh
    let locationType = request?.payload?.locationType
    const airQuality = getAirQuality(request.payload?.aq, 2, 4, 5, 7)
    let locationNameOrPostcode = ''
    if (locationType === 'uk-location') {
      locationNameOrPostcode = request.payload.engScoWal.trim()
    } else if (locationType === 'ni-location') {
      locationNameOrPostcode = request.payload.ni
    }
    if (!locationType && str !== 'chwilio-lleoliad') {
      locationType = request.yar.get('locationType')
      locationNameOrPostcode = request.yar.get('locationNameOrPostcode')
    } else {
      request.yar.set('locationType', locationType)
      request.yar.set('locationNameOrPostcode', locationNameOrPostcode)
      request.yar.set('airQuality', airQuality)
    }
    if (!locationNameOrPostcode && !locationType) {
      userId = request.yar.set('userId', userId)
      utm_source = request.yar.set('utm_source', utm_source)
      request.yar.set('errors', {
        errors: {
          titleText: searchLocation.errorText.radios.title, // 'There is a problem',
          errorList: [
            {
              text: searchLocation.errorText.radios.list.text, // 'Select where you want to check',
              href: '#locationType'
            }
          ]
        }
      })
      request.yar.set('errorMessage', {
        errorMessage: { text: searchLocation.errorText.radios.list.text } // 'Select where you want to check' }
      })
      request.yar.set('locationType', '')
      if (str === 'chwilio-lleoliad') {
        return h.redirect(
          `/chwilio-lleoliad/cy?lang=cy&userId=${query?.userId}&utm_source=${query?.utm_source}`
        )
      }
    }
    try {
      let userLocation = locationNameOrPostcode.toUpperCase() // Use 'let' to allow reassignment
      // Regex patterns to check for full and partial postcodes
      const fullPostcodePattern = /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2})$/
      const partialPostcodePattern = /^([A-Z]{1,2}\d[A-Z\d]?)$/
      // Insert a space for full postcodes without a space
      if (
        fullPostcodePattern.test(userLocation) &&
        !userLocation.includes(' ')
      ) {
        const spaceIndex = userLocation.length - 3
        userLocation = `${userLocation.slice(0, spaceIndex)} ${userLocation.slice(
          spaceIndex
        )}`
      }
      if (!userLocation && locationType === 'uk-location') {
        request.yar.set('errors', {
          errors: {
            titleText: searchLocation.errorText.uk.fields.title, // 'There is a problem',
            errorList: [
              {
                text: searchLocation.errorText.uk.fields.list.text, // 'Enter a location or postcode',
                href: '#engScoWal'
              }
            ]
          }
        })
        request.yar.set('errorMessage', {
          errorMessage: {
            text: searchLocation.errorText.uk.fields.list.text // 'Enter a location or postcode'
          }
        })
        request.yar.set('locationType', 'uk-location')
        return h.redirect(
          `/chwilio-lleoliad/cy?lang=cy&userId=${query?.userId}&utm_source=${query?.utm_source}`
        )
      }
      if (!userLocation && locationType === 'ni-location') {
        request.yar.set('errors', {
          errors: {
            titleText: searchLocation.errorText.ni.fields.title, // 'There is a problem',
            errorList: [
              {
                text: searchLocation.errorText.ni.fields.list.text, // 'Enter a postcode',
                href: '#ni'
              }
            ]
          }
        })
        request.yar.set('errorMessage', {
          errorMessage: {
            text: searchLocation.errorText.ni.fields.list.text // 'Enter a postcode'
          }
        })
        request.yar.set('locationType', 'ni-location')
        return h.redirect(
          `/chwilio-lleoliad/cy?lang=cy&userId=${query?.userId}&utm_source=${query?.utm_source}`
        )
      }
      locationType = request.yar.get('locationType')
      const { getDailySummary, getForecasts, getMeasurements, getOSPlaces } =
        await fetchData('uk-location', userLocation, request)
      if (locationType === 'uk-location') {
        const { results } = getOSPlaces

        if (!results || results.length === 0) {
          return h.view('locations/location-not-found', {
            userLocation: locationNameOrPostcode,
            pageTitle: `${notFoundLocation.paragraphs.a} ${userLocation} - ${home.pageTitle}`,
            paragraph: notFoundLocation.paragraphs,
            serviceName: searchLocation.serviceName,
            footerTxt,
            phaseBanner,
            backlink,
            cookieBanner,
            lang: request.query?.lang ?? lang
          })
        }

        let matches = results.filter((item) => {
          const name = item?.GAZETTEER_ENTRY.NAME1.toUpperCase().replace(
            /\s+/g,
            ''
          )
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
            matches[0].GAZETTEER_ENTRY.NAME1 =
              locationNameOrPostcode.toUpperCase() // Set the name to the partial postcode
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
          data: matches,
          rawForecasts: getForecasts?.forecasts,
          forecastNum: matches.length !== 0 ? forecastNum : 0,
          forecastSummary: getDailySummary,
          nearestLocationsRange:
            matches.length !== 0 ? nearestLocationsRange : [],
          measurements: getMeasurements?.measurements
        })
        //

        if (matches.length === 1) {
          const locationDetails = matches[0]
          let title = ''
          if (locationDetails) {
            if (locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH) {
              if (locationDetails.GAZETTEER_ENTRY.NAME2) {
                title =
                  locationDetails.GAZETTEER_ENTRY.NAME2 +
                  ', ' +
                  locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH +
                  '-' +
                  home.pageTitle
              } else {
                title =
                  locationDetails.GAZETTEER_ENTRY.NAME1 +
                  ', ' +
                  locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH +
                  '-' +
                  home.pageTitle
              }
            } else {
              title =
                locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY +
                '-' +
                home.pageTitle
            }
          }
          const airQuality = getAirQuality(
            forecastNum[0][0].today,
            Object.values(forecastNum[0][1])[0],
            Object.values(forecastNum[0][2])[0],
            Object.values(forecastNum[0][3])[0],
            Object.values(forecastNum[0][4])[0]
          )

          return h.view('locations/location', {
            userId,
            utm_source,
            result: matches[0],
            name2:
              matches[0].GAZETTEER_ENTRY?.NAME2 ??
              matches[0].GAZETTEER_ENTRY?.NAME1,
            airQuality,
            airQualityData: airQualityData.commonMessages,
            monitoringSites: nearestLocationsRange,
            siteTypeDescriptions,
            pollutantTypes,
            displayBacklink: true,
            pageTitle: title,
            backlink,
            daqi,
            phaseBanner,
            footerTxt,
            cookieBanner,
            serviceName: multipleLocations.serviceName,
            forecastSummary: getDailySummary.today,
            summaryDate: getDailySummary.issue_date,
            dailySummary: getDailySummary,
            languageDate: lang === 'cy' ? welshDate : englishDate,
            dailySummaryTexts: welsh.dailySummaryTexts,
            lang: request.query?.lang ?? lang
          })
        } else if (matches.length > 1 && locationNameOrPostcode.length > 3) {
          if (lang === 'en') {
            return h.redirect(
              `/location&userId=${query?.userId}&utm_source=${query?.utm_source}`
            )
          }
          return h.view('locations/multiple-locations', {
            userId: query?.userId,
            utm_source: query?.utm_source,
            results: matches,
            title: multipleLocations.title,
            paragraphs: multipleLocations.paragraphs,
            name2:
              matches[0].GAZETTEER_ENTRY?.NAME2 ??
              matches[0].GAZETTEER_ENTRY?.NAME1,
            userLocation: locationNameOrPostcode,
            airQuality,
            airQualityData: airQualityData.commonMessages,
            monitoringSites: nearestLocationsRange,
            siteTypeDescriptions,
            pollutantTypes,
            pageTitle: `${multipleLocations.title} ${userLocation} -  ${home.pageTitle}`,
            serviceName: multipleLocations.serviceName,
            forecastSummary: getDailySummary.today,
            summaryDate: getDailySummary.issue_date,
            dailySummary: getDailySummary,
            footerTxt,
            phaseBanner,
            backlink,
            cookieBanner,
            languageDate: lang === 'cy' ? welshDate : englishDate,
            lang: request.query?.lang ?? lang
          })
        } else {
          return h.view('locations/location-not-found', {
            userId: query?.userId,
            utm_source: query?.utm_source,
            userLocation: locationNameOrPostcode,
            pageTitle: `${notFoundLocation.paragraphs.a} ${locationNameOrPostcode} - ${home.pageTitle}`,
            paragraph: notFoundLocation.paragraphs,
            footerTxt,
            serviceName: searchLocation.serviceName,
            phaseBanner,
            backlink,
            cookieBanner,
            lang: request.query?.lang ?? lang
          })
        }
      } else if (locationType === 'ni-location') {
        const { getNIPlaces } = await fetchData(
          'ni-location',
          userLocation,
          request
        )
        logger.info(
          `::::::::::: getNIPlaces statusCode cy ::::::::: ${getNIPlaces?.statusCode}`
        )
        if (getOSPlaces?.statusCode === 500) {
          return h.view('error/index', {
            userId: query?.userId,
            utm_source: query?.utm_source,
            footerTxt,
            pageTitle: `${notFoundLocation.paragraphs.h} ${locationNameOrPostcode} - ${home.pageTitle}`,
            url: request.path,
            phaseBanner,
            displayBacklink: false,
            cookieBanner,
            serviceName: welsh.multipleLocations.serviceName,
            notFoundUrl: welsh.notFoundUrl,
            lang
          })
        }

        if (!getNIPlaces?.results || getNIPlaces?.results.length === 0) {
          return h.view('locations/location-not-found', {
            userId: query?.userId,
            utm_source: query?.utm_source,
            userLocation: locationNameOrPostcode,
            pageTitle: `${notFoundLocation.paragraphs.a} ${userLocation} -  ${home.pageTitle}`,
            paragraph: notFoundLocation.paragraphs,
            footerTxt,
            serviceName: searchLocation.serviceName,
            phaseBanner,
            backlink,
            cookieBanner,
            lang: request.query?.lang ?? lang
          })
        }
        const { results } = getNIPlaces
        const locationData = {
          GAZETTEER_ENTRY: {
            NAME1: results[0].postcode,
            DISTRICT_BOROUGH: results[0].administrativeArea,
            LONGITUDE: results[0].xCoordinate,
            LATITUDE: results[0].yCoordinate
          }
        }
        const { forecastNum, nearestLocationsRange } = getNearestLocation(
          results,
          getForecasts?.forecasts,
          getMeasurements?.measurements,
          'ni-location',
          0,
          lang
        )
        let title = ''
        if (locationData) {
          if (locationData.GAZETTEER_ENTRY.NAME2) {
            title =
              locationData.GAZETTEER_ENTRY.NAME2 +
              ', ' +
              locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH +
              '-' +
              home.pageTitle
          } else {
            title =
              locationData.GAZETTEER_ENTRY.NAME1 +
              ', ' +
              locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH +
              '-' +
              home.pageTitle
          }
        }
        if (query?.lang === 'en') {
          return h.redirect(
            `/location&userId=${query?.userId}&utm_source=${query?.utm_source}`
          )
        }
        const airQuality = getAirQuality(
          forecastNum[0][0].today,
          Object.values(forecastNum[0][1])[0],
          Object.values(forecastNum[0][2])[0],
          Object.values(forecastNum[0][3])[0],
          Object.values(forecastNum[0][4])[0]
        )
        return h.view('locations/location', {
          userId: query?.userId,
          utm_source: query?.utm_source,
          result: locationData,
          airQuality,
          airQualityData: airQualityData.commonMessages,
          monitoringSites: nearestLocationsRange,
          siteTypeDescriptions,
          pollutantTypes,
          displayBacklink: true,
          forecastSummary: getDailySummary.today,
          summaryDate: getDailySummary.issue_date,
          dailySummary: getDailySummary,
          daqi,
          nearestLocationsRange,
          title,
          pageTitle: title, // `${multipleLocations.title} ${userLocation} - ${home.pageTitle}`,
          serviceName: multipleLocations.serviceName,
          footerTxt,
          phaseBanner,
          backlink,
          cookieBanner,
          languageDate: lang === 'cy' ? welshDate : englishDate,
          dailySummaryTexts: welsh.dailySummaryTexts,
          lang: request.query?.lang ?? lang
        })
      }
    } catch (error) {
      logger.error(`error from location refresh ${error.message}`)
      return h.view('error/index', {
        userId: query?.userId,
        utm_source: query?.utm_source,
        footerTxt,
        pageTitle: `${notFoundLocation.paragraphs.h} ${locationNameOrPostcode} - ${home.pageTitle}`,
        url: request.path,
        phaseBanner,
        displayBacklink: false,
        cookieBanner,
        serviceName: welsh.multipleLocations.serviceName,
        notFoundUrl: welsh.notFoundUrl,
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
      // Extract query parameters using URLSearchParams
      const urlParams = new URLSearchParams(request.url.search)
      const userId = urlParams.get('userId')
      const utm_source = urlParams.get('utm_source')

      if (query?.lang && query?.lang === 'en') {
        return h.redirect(
          `/location/${locationId}?userId=${userId}&utm_source=${utm_source}&lang=${query?.lang}`
        )
      }
      const lang = 'cy'
      const formattedDate = moment().format('DD MMMM YYYY').split(' ')
      const calendarWelsh = [
        'Ionawr',
        'Chwefror',
        'Mawrth',
        'Ebrill',
        'Mai',
        'Mehefin',
        'Gorffennaf',
        'Awst',
        'Medi',
        'Hydref',
        'Tachwedd',
        'Rhagfyr'
      ]
      const calendarEnglish = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ]
      const getMonth = calendarEnglish.findIndex(function (item) {
        return item.indexOf(formattedDate[1]) !== -1
      })
      const englishDate = `${formattedDate[0]} ${calendarEnglish[getMonth]} ${formattedDate[2]}`
      const welshDate = `${formattedDate[0]} ${calendarWelsh[getMonth]} ${formattedDate[2]}`
      const {
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        notFoundLocation,
        searchLocation,
        daqi,
        home
      } = welsh
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
        let title = ''
        if (locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH) {
          if (locationDetails.GAZETTEER_ENTRY.NAME2) {
            title =
              locationDetails.GAZETTEER_ENTRY.NAME2 +
              ', ' +
              locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH +
              '-' +
              home.pageTitle
          } else {
            title =
              locationDetails.GAZETTEER_ENTRY.NAME1 +
              ', ' +
              locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH +
              '-' +
              home.pageTitle
          }
        } else {
          title =
            locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY +
            '-' +
            home.pageTitle
        }
        const { forecastNum, nearestLocationsRange } = getNearestLocation(
          locationData.data,
          locationData.rawForecasts,
          locationData.measurements,
          'uk-location',
          locationIndex,
          lang
        )
        const airQuality = getAirQuality(
          forecastNum[0][0].today,
          Object.values(forecastNum[0][1])[0],
          Object.values(forecastNum[0][2])[0],
          Object.values(forecastNum[0][3])[0],
          Object.values(forecastNum[0][4])[0]
        )
        return h.view('locations/location', {
          userId,
          utm_source,
          result: locationDetails,
          airQuality,
          airQualityData: airQualityData.commonMessages,
          monitoringSites: nearestLocationsRange,
          siteTypeDescriptions,
          pollutantTypes,
          pageTitle: title,
          daqi,
          displayBacklink: true,
          forecastSummary: locationData.forecastSummary.today,
          summaryDate: locationData.forecastSummary.issue_date,
          dailySummary: locationData.forecastSummary,
          footerTxt,
          phaseBanner,
          serviceName: searchLocation.serviceName,
          backlink,
          cookieBanner,
          languageDate: lang === 'cy' ? welshDate : englishDate,
          dailySummaryTexts: welsh.dailySummaryTexts,
          lang
        })
      } else {
        return h.view('location-not-found', {
          userId,
          utm_source,
          paragraph: notFoundLocation.paragraphs,
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
