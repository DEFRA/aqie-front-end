import {
  siteTypeDescriptions,
  pollutantTypes
} from '~/src/server/data/monitoring-sites.js'
import * as airQualityData from '~/src/server/data/air-quality.js'
import { getAirQuality } from '~/src/server/data/air-quality.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { getNearestLocation } from '~/src/server/locations/helpers/get-nearest-location'
import { fetchData } from '~/src/server/locations/helpers/fetch-data'
import { welsh } from '~/src/server/data/cy/cy.js'

const logger = createLogger()
const getLocationDataController = {
  handler: async (request, h) => {
    const { query } = request
    const { referer } = request.headers
    let lang = referer.slice(-2)
    if (lang === 'on') {
      lang = 'en'
    }
    const {
      searchLocation,
      notFoundLocation,
      multipleLocations,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner
    } = welsh
    let locationType = request?.payload?.locationType
    const airQuality = getAirQuality(request.payload?.aq)
    let locationNameOrPostcode = ''
    if (locationType === 'uk-location') {
      locationNameOrPostcode = request.payload.engScoWal
    } else if (locationType === 'ni-location') {
      locationNameOrPostcode = request.payload.ni
    }
    if (Object.values(query).length === 0) {
      request.yar.set('locationType', locationType)
      request.yar.set('locationNameOrPostcode', locationNameOrPostcode)
      request.yar.set('airQuality', airQuality)
    } else {
      locationType = request.yar.get('locationType')
      locationNameOrPostcode = request.yar.get('locationNameOrPostcode')
      request.yar.get('airQuality', airQuality)
    }
    if (!locationNameOrPostcode && !locationType) {
      request.yar.set('errors', {
        errors: {
          titleText: searchLocation.errorText.radios.title, // 'There is a problem',
          errorList: [
            {
              text: searchLocation.errorText.radios.list.text, // 'Select where you want to check',
              href: '#itembox'
            }
          ]
        }
      })
      request.yar.set('errorMessage', {
        errorMessage: { text: searchLocation.errorText.radios.list.text } // 'Select where you want to check' }
      })
      request.yar.set('locationType', '')
      return h.redirect('/search-location?lang=' + query?.lang)
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
        return h.redirect('/search-location?lang=' + query?.lang)
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
        return h.redirect('/search-location?lang=' + query?.lang)
      }

      const { getDailySummary, getForecasts, getMeasurements, getOSPlaces } =
        await fetchData('uk-location', userLocation)
      if (locationType === 'uk-location') {
        const { results } = getOSPlaces

        if (!results || results.length === 0) {
          return h.view('locations/location-not-found', {
            userLocation: locationNameOrPostcode,
            pageTitle: `We could not find ${userLocation} - Check local air quality - GOV.UK`,
            paragraph: notFoundLocation.paragraphs,
            footerTxt,
            phaseBanner,
            backlink,
            cookieBanner,
            lang: request.query.lang
          })
        }

        let matches = results.filter((item) => {
          const name = item?.GAZETTEER_ENTRY.NAME1.toUpperCase()
          const name2 = item?.GAZETTEER_ENTRY.NAME2?.toUpperCase()
          return (
            name.includes(userLocation) ||
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
          getForecasts.forecasts,
          getMeasurements.measurements,
          'uk-location',
          0,
          lang
        )
        request.yar.set('locationData', {
          data: matches,
          rawForecasts: getForecasts.forecasts,
          forecastNum: matches.length !== 0 ? forecastNum : 0,
          forecastSummary: getDailySummary,
          nearestLocationsRange:
            matches.length !== 0 ? nearestLocationsRange : [],
          measurements: getMeasurements.measurements
        })
        //
        if (matches.length === 1) {
          const locationDetails = matches[0]
          let title = ''
          if (locationDetails) {
            if (locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY) {
              if (locationDetails.GAZETTEER_ENTRY.NAME2) {
                title =
                  locationDetails.GAZETTEER_ENTRY.NAME2 +
                  ', ' +
                  locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY
              } else {
                title =
                  locationDetails.GAZETTEER_ENTRY.NAME1 +
                  ', ' +
                  locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY
              }
            } else {
              title = locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH
            }
          }
          //
          const airQuality = getAirQuality(forecastNum[0])
          return h.view('locations/location', {
            result: matches[0],
            name2: matches[0].GAZETTEER_ENTRY?.NAME2,
            airQuality,
            airQualityData: airQualityData.commonMessages,
            monitoringSites: nearestLocationsRange,
            siteTypeDescriptions,
            pollutantTypes,
            displayBacklink: true,
            pageTitle: title,
            serviceName: 'Check local air quality',
            forecastSummary: getDailySummary.today,
            summaryDate: getDailySummary.issue_date,
            lang: request.query.lang ?? lang
          })
        } else if (matches.length > 1 && locationNameOrPostcode.length > 3) {
          return h.view('locations/multiple-locations', {
            results: matches,
            title: multipleLocations.title,
            paragraphs: multipleLocations.paragraphs,
            name2: matches[0].GAZETTEER_ENTRY?.NAME2,
            userLocation: locationNameOrPostcode,
            airQuality,
            airQualityData: airQualityData.commonMessages,
            monitoringSites: nearestLocationsRange,
            siteTypeDescriptions,
            pollutantTypes,
            pageTitle: `${multipleLocations.heading} ${userLocation}`,
            serviceName: multipleLocations.serviceName,
            lang: request.query.lang ?? lang
          })
        } else {
          return h.view('locations/location-not-found', {
            userLocation: locationNameOrPostcode,
            pageTitle: `${notFoundLocation.heading} ${locationNameOrPostcode} - Check local air quality - GOV.UK`,
            paragraph: notFoundLocation.paragraphs,
            footerTxt,
            phaseBanner,
            backlink,
            cookieBanner,
            lang: request.query.lang ?? lang
          })
        }
      } else if (locationType === 'ni-location') {
        const { getNIPlaces } = await fetchData('ni-location', userLocation)
        const { result } = getNIPlaces

        if (!result || result.length === 0) {
          return h.view('locations/location-not-found', {
            userLocation: locationNameOrPostcode,
            pageTitle: `${notFoundLocation.heading} ${userLocation} - Check local air quality - GOV.UK`,
            paragraph: notFoundLocation.paragraphs,
            footerTxt,
            phaseBanner,
            backlink,
            cookieBanner,
            lang: request.query.lang ?? lang
          })
        }
        const locationData = {
          GAZETTEER_ENTRY: {
            NAME1: result[0].postcode,
            DISTRICT_BOROUGH: result[0].admin_district,
            LONGITUDE: result[0].longitude,
            LATITUDE: result[0].latitude
          }
        }
        const { forecastNum, nearestLocationsRange } = getNearestLocation(
          result,
          getForecasts.forecasts,
          getMeasurements.measurements,
          'Ireland',
          0,
          lang
        )
        let title = ''
        if (locationData) {
          if (locationData.GAZETTEER_ENTRY.NAME2) {
            title =
              locationData.GAZETTEER_ENTRY.NAME2 +
              ', ' +
              locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH
          } else {
            title =
              locationData.GAZETTEER_ENTRY.NAME1 +
              ', ' +
              locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH
          }
        }
        const airQuality = getAirQuality(forecastNum[0])
        return h.view('locations/location', {
          result: locationData,
          airQuality,
          airQualityData: airQualityData.commonMessages,
          monitoringSites: nearestLocationsRange,
          siteTypeDescriptions,
          pollutantTypes,
          pageTitle: title,
          displayBacklink: true,
          forecastSummary: getDailySummary.today,
          summaryDate: getDailySummary.issue_date,
          nearestLocationsRange,
          lang: request.query?.lang ?? lang
        })
      }
    } catch (error) {
      logger.info(`error from location refresh ${error.message}`)
      return h.view('error/index', {
        msError: error.message,
        lang: request.query?.lang
      })
    }
  }
}

const getLocationDetailsController = {
  handler: (request, h) => {
    try {
      const locationId = request.params.id
      const { referer } = request.headers
      let lang = referer.slice(-2)
      if (lang === 'on') {
        lang = 'en'
      }
      const {
        notFoundLocation,
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner
      } = welsh
      const locationData = request.yar.get('locationData') || []
      let locationIndex = 0
      const locationDetails = locationData?.data?.find((item, index) => {
        if (item.GAZETTEER_ENTRY.ID === locationId) {
          locationIndex = index
          return item.GAZETTEER_ENTRY.ID === locationId
        }
        return null
      })

      if (locationDetails) {
        let title = ''
        if (locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY) {
          if (locationDetails.GAZETTEER_ENTRY.NAME2) {
            title =
              locationDetails.GAZETTEER_ENTRY.NAME2 +
              ', ' +
              locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY
          } else {
            title =
              locationDetails.GAZETTEER_ENTRY.NAME1 +
              ', ' +
              locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY
          }
        } else {
          title = locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH
        }
        const { forecastNum, nearestLocationsRange } = getNearestLocation(
          locationData.data,
          locationData.rawForecasts,
          locationData.measurements,
          'uk-location',
          locationIndex,
          lang
        )
        const airQuality = getAirQuality(forecastNum[0])
        return h.view('locations/location', {
          result: locationDetails,
          airQuality,
          airQualityData: airQualityData.commonMessages,
          monitoringSites: nearestLocationsRange,
          siteTypeDescriptions,
          pollutantTypes,
          pageTitle: title,
          displayBacklink: true,
          forecastSummary: locationData.forecastSummary.today,
          summaryDate: locationData.forecastSummary.issue_date,
          footerTxt,
          phaseBanner,
          backlink,
          cookieBanner,
          lang: request.query.lang ?? lang
        })
      } else {
        return h.view('location-not-found', {
          paragraph: notFoundLocation.paragraphs,
          footerTxt,
          phaseBanner,
          backlink,
          cookieBanner,
          lang: request.query.lang ?? lang
        })
      }
    } catch (error) {
      logger.info(`error on single location ${error.message}`)
      return h.status(500).render('error', {
        error: 'An error occurred while retrieving location details.'
      })
    }
  }
}

export { getLocationDataController, getLocationDetailsController }
