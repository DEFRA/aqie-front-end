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
import { sentenceCase } from '~/src/server/common/helpers/sentence-case'
import { firstLetterUppercase } from '~/src/server/common/helpers/stringUtils'

const logger = createLogger()

const getLocationDataController = {
  handler: async (request, h) => {
    const { query } = request
    // Extract query parameters using URLSearchParams
    /* eslint-disable camelcase */
    const lang = 'en'
    const tempString = request?.headers?.referer?.split('/')[3]
    const str = tempString?.split('?')[0]
    if (query?.lang && query?.lang === 'cy') {
      /* eslint-disable camelcase */
      return h.redirect(`/lleoliad/cy?lang=cy`)
    }
    const formattedDate = moment().format('DD MMMM YYYY').split(' ')
    const getMonth = calendarEnglish.findIndex(function (item) {
      return item.indexOf(formattedDate[1]) !== -1
    })
    const {
      searchLocation,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      notFoundLocation,
      multipleLocations,
      home,
      daqi
    } = english
    let locationType = request?.payload?.locationType
    const airQuality = getAirQuality(request.payload?.aq, 2, 4, 5, 7)
    let locationNameOrPostcode = ''
    if (locationType === 'uk-location') {
      locationNameOrPostcode = request.payload.engScoWal.trim()
    } else if (locationType === 'ni-location') {
      locationNameOrPostcode = request.payload.ni
    }
    if (!locationType && str !== 'search-location') {
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
      request.yar.get('', '')

      if (query?.lang === 'cy') {
        return h.redirect(`/lleoliad/cy?lang=cy`)
      }
      if (str === 'search-location') {
        return h.redirect(`/search-location?lang=en`)
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
        return h.redirect(`/search-location`)
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
        return h.redirect(`/search-location`)
      }
      locationType = request.yar.get('locationType')
      const { getDailySummary, getForecasts, getMeasurements, getOSPlaces } =
        await fetchData(locationType, userLocation, request, h)

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

        if (
          !results ||
          results.length === 0 ||
          getOSPlaces === 'wrong postcode'
        ) {
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
          data: matches,
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
          logger.info(
            `::::::::::: multipleLocations.title 1  ::::::::::: ${title}`
          )
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
          return h.view('locations/multiple-locations', {
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
        const { forecastNum, nearestLocationsRange, latlon } =
          getNearestLocation(
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
            return h.redirect(`/lleoliad/cy?lang=cy`)
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
      let title = ''
      let headerTitle = ''
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
        if (locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH) {
          if (locationDetails.GAZETTEER_ENTRY.NAME2) {
            title =
              locationDetails.GAZETTEER_ENTRY.NAME2 +
              ', ' +
              locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH +
              ' - ' +
              english.multipleLocations.pageTitle
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
              english.multipleLocations.pageTitle
            headerTitle =
              locationDetails.GAZETTEER_ENTRY.NAME1 +
              ', ' +
              locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH
          }
        } else {
          if (locationDetails.GAZETTEER_ENTRY.NAME2) {
            title =
              locationDetails.GAZETTEER_ENTRY.NAME2 +
              ', ' +
              locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY +
              ' - ' +
              english.multipleLocations.pageTitle
            headerTitle =
              locationDetails.GAZETTEER_ENTRY.NAME2 +
              ', ' +
              locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY
          } else {
            title =
              locationDetails.GAZETTEER_ENTRY.NAME1 +
              ', ' +
              locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY +
              ' - ' +
              english.multipleLocations.pageTitle
            headerTitle =
              locationDetails.GAZETTEER_ENTRY.NAME1 +
              ', ' +
              locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY
          }
        }

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
