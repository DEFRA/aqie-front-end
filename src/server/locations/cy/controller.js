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
import { sentenceCase } from '~/src/server/common/helpers/sentence-case'
import { firstLetterUppercase } from '~/src/server/common/helpers/stringUtils'
import {
  LANG_CY,
  LANG_EN,
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI
} from '~/src/server/data/constants'

const logger = createLogger()

const getLocationDataController = {
  handler: async (request, h) => {
    const { query, path } = request
    const tempString = request?.headers?.referer?.split('/')[3]
    const str = tempString?.split('?')[0]
    let lang = query?.lang?.slice(0, 2)
    if (lang !== LANG_CY && lang !== LANG_EN && path === '/lleoliad') {
      lang = LANG_CY
    }
    if (query?.lang && query?.lang === LANG_EN) {
      return h.redirect(`/location?lang=en`)
    }

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
    if (locationType === LOCATION_TYPE_UK) {
      locationNameOrPostcode = request.payload.engScoWal.trim()
    } else if (locationType === LOCATION_TYPE_NI) {
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
        return h.redirect(`/chwilio-lleoliad/cy?lang=cy`)
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
      if (!userLocation && locationType === LOCATION_TYPE_UK) {
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
        request.yar.set('locationType', LOCATION_TYPE_UK)
        return h.redirect(`/chwilio-lleoliad/cy?lang=cy`)
      }
      if (!userLocation && locationType === LOCATION_TYPE_NI) {
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
        request.yar.set('locationType', LOCATION_TYPE_NI)
        return h.redirect(`/chwilio-lleoliad/cy?lang=cy`)
      }
      locationType = request.yar.get('locationType')
      const { getDailySummary, getForecasts, getMeasurements, getOSPlaces } =
        await fetchData(LOCATION_TYPE_UK, userLocation, request)
      logger.info(
        `::::::::::: getDailySummary 2  ::::::::::: ${JSON.stringify(getDailySummary)}`
      )
      const formattedDateSummary = moment(getDailySummary?.issue_date)
        .format('DD MMMM YYYY')
        .split(' ')
      const getMonthSummary = calendarEnglish.findIndex(function (item) {
        return item.indexOf(formattedDateSummary[1]) !== -1
      })
      const englishDate = `${formattedDateSummary[0]} ${calendarEnglish[getMonthSummary]} ${formattedDateSummary[2]}`
      const welshDate = `${formattedDateSummary[0]} ${calendarWelsh[getMonthSummary]} ${formattedDateSummary[2]}`

      if (locationType === LOCATION_TYPE_UK) {
        const { results } = getOSPlaces

        if (!results || results.length === 0) {
          return h.view('location-not-found/index', {
            userLocation: locationNameOrPostcode,
            pageTitle: `${notFoundLocation.paragraphs.a} ${userLocation} - ${home.pageTitle}`,
            paragraph: notFoundLocation.paragraphs,
            serviceName: searchLocation.serviceName,
            footerTxt,
            phaseBanner,
            backlink,
            cookieBanner,
            lang
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
          LOCATION_TYPE_UK,
          0,
          lang
        )

        const pollutantDate =
          nearestLocationsRange[0]?.pollutants[
            Object.keys(nearestLocationsRange[0]?.pollutants)[
              Object.keys(nearestLocationsRange[0]?.pollutants).length - 1
            ]
          ]?.time.date

        const formattedDate = moment(pollutantDate)
          .format('DD MMMM YYYY')
          .split(' ')
        const getMonth = calendarEnglish.findIndex(function (item) {
          return item.indexOf(formattedDate[1]) !== -1
        })
        request.yar.set('locationData', {
          results: matches,
          rawForecasts: getForecasts?.forecasts,
          forecastNum: matches.length !== 0 ? forecastNum : 0,
          forecastSummary: getDailySummary,
          nearestLocationsRange:
            matches.length !== 0 ? nearestLocationsRange : [],
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
                headerTitle =
                  locationDetails.GAZETTEER_ENTRY.NAME1 +
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
            backlink,
            daqi,
            phaseBanner,
            footerTxt,
            cookieBanner,
            serviceName: multipleLocations.serviceName,
            forecastSummary: getDailySummary.today,
            dailySummary: getDailySummary,
            welshMonth: calendarWelsh[getMonth],
            summaryDate: lang === LANG_CY ? welshDate : englishDate,
            dailySummaryTexts: welsh.dailySummaryTexts,
            lang
          })
        } else if (matches.length > 1 && locationNameOrPostcode.length > 3) {
          if (lang === LANG_EN) {
            return h.redirect(`/location`)
          }
          userLocation = userLocation.toLowerCase()
          userLocation =
            userLocation.charAt(0).toUpperCase() + userLocation.slice(1)

          return h.view('multiple-results/multiple-locations', {
            results: matches,
            paragraphs: multipleLocations.paragraphs,
            userLocation: locationNameOrPostcode,
            airQuality,
            airQualityData: airQualityData.commonMessages,
            monitoringSites: nearestLocationsRange,
            siteTypeDescriptions,
            pollutantTypes,
            pageTitle: `${multipleLocations.title} ${userLocation} -  ${home.pageTitle}`,
            title: multipleLocations.title,
            serviceName: multipleLocations.serviceName,
            forecastSummary: getDailySummary.today,
            summaryDate: lang === LANG_CY ? welshDate : englishDate,
            dailySummary: getDailySummary,
            footerTxt,
            phaseBanner,
            backlink,
            cookieBanner,
            welshMonth: calendarWelsh[getMonth],
            lang: request.query?.lang ?? lang
          })
        } else {
          return h.view('location-not-found/index', {
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
      } else if (locationType === LOCATION_TYPE_NI) {
        const { getNIPlaces } = await fetchData(
          LOCATION_TYPE_NI,
          userLocation,
          request
        )
        logger.info(
          `::::::::::: getNIPlaces statusCode cy ::::::::: ${getNIPlaces?.statusCode}`
        )
        if (
          getOSPlaces?.statusCode !== 200 &&
          getNIPlaces?.statusCode !== undefined
        ) {
          return h.view('error/index', {
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
          return h.view('location-not-found/index', {
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
            DISTRICT_BOROUGH: sentenceCase(results[0].administrativeArea),
            LONGITUDE: results[0].xCoordinate,
            LATITUDE: results[0].yCoordinate
          }
        }
        const { forecastNum, nearestLocationsRange } = getNearestLocation(
          results,
          getForecasts?.forecasts,
          getMeasurements?.measurements,
          LOCATION_TYPE_NI,
          0,
          lang
        )
        const pollutantDate =
          nearestLocationsRange[0]?.pollutants[
            Object.keys(nearestLocationsRange[0]?.pollutants)[
              Object.keys(nearestLocationsRange[0]?.pollutants).length - 1
            ]
          ]?.time.date
        const formattedDate = moment(pollutantDate)
          .format('DD MMMM YYYY')
          .split(' ')
        const getMonth = calendarEnglish.findIndex(function (item) {
          return item.indexOf(formattedDate[1]) !== -1
        })
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
        if (query?.lang === LANG_EN) {
          return h.redirect(`/location`)
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
        return h.view('locations/location', {
          result: locationData,
          airQuality,
          airQualityData: airQualityData.commonMessages,
          monitoringSites: nearestLocationsRange,
          siteTypeDescriptions,
          pollutantTypes,
          displayBacklink: true,
          forecastSummary: getDailySummary.today,
          summaryDate: lang === LANG_CY ? welshDate : englishDate,
          dailySummary: getDailySummary,
          daqi,
          nearestLocationsRange,
          title: headerTitle,
          pageTitle: title,
          serviceName: multipleLocations.serviceName,
          footerTxt,
          phaseBanner,
          backlink,
          cookieBanner,
          welshMonth: calendarWelsh[getMonth],
          dailySummaryTexts: welsh.dailySummaryTexts,
          lang: request.query?.lang ?? lang
        })
      }
    } catch (error) {
      logger.error(`error from location refresh ${error.message}`)
      return h.view('error/index', {
        footerTxt,
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

export { getLocationDataController }
