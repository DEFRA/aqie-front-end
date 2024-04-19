import {
  siteTypeDescriptions,
  pollutantTypes
} from '../data/monitoring-sites.js'
import * as airQualityData from '../data/air-quality.js'
import { getAirQuality } from '../data/air-quality.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { getNearestLocation } from './helpers/get-nearest-location.js'
import { config } from '~/src/config'
import { proxyFetch } from '~/src/helpers/proxy-fetch.js'

const logger = createLogger()
const symbolsArr = ['%', '$', '&', '#', '!', '¬', '`']
const getLocationDataController = {
  handler: async (request, h) => {
    const locationType = request?.payload?.locationType
    let locationNameOrPostcode = ''
    if (locationType === 'uk-location') {
      locationNameOrPostcode = request.payload.engScoWal
    } else if (locationType === 'ni-location') {
      locationNameOrPostcode = request.payload.ni
    }

    if (!locationNameOrPostcode && !locationType) {
      request.yar.set('errors', {
        errors: {
          titleText: 'There is a problem',
          errorList: [
            {
              text: 'Select where you want to check',
              href: '#itembox'
            }
          ]
        }
      })
      request.yar.set('errorMessage', {
        errorMessage: { text: 'Select where you want to check' }
      })
      request.yar.set('locationType', '')
      return h.redirect('/search-location')
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
            titleText: 'There is a problem',
            errorList: [
              {
                text: 'Enter a location or postcode',
                href: '#engScoWal'
              }
            ]
          }
        })
        request.yar.set('errorMessage', {
          errorMessage: {
            text: 'Enter a location or postcode'
          }
        })
        request.yar.set('locationType', 'uk-location')
        return h.redirect('/search-location')
      }
      if (!userLocation && locationType === 'ni-location') {
        request.yar.set('errors', {
          errors: {
            titleText: 'There is a problem',
            errorList: [
              {
                text: 'Enter a postcode',
                href: '#ni'
              }
            ]
          }
        })
        request.yar.set('errorMessage', {
          errorMessage: {
            text: 'Enter a postcode'
          }
        })
        request.yar.set('locationType', 'ni-location')
        return h.redirect('/search-location')
      }
      const forecastsAPIurl = config.get('forecastsApiUrl')
      const measurementsAPIurl = config.get('measurementsApiUrl')
      const airQuality = getAirQuality(request.payload.aq)
      const forecastSummaryURL = config.get('forecastSummaryUrl')
      let forecastSummaryRes
      try {
        forecastSummaryRes = await proxyFetch(forecastSummaryURL).then((res) =>
          res.json()
        )
      } catch (error) {
        logger.info('ERRRRRORRR ', error)
      }
      const forecastSummary = forecastSummaryRes.today
      const forecastsRes = await proxyFetch(forecastsAPIurl).then((res) =>
        res.json()
      )
      const { forecasts } = forecastsRes
      const measurementsRes = await proxyFetch(measurementsAPIurl).then((res) =>
        res.json()
      )
      const { measurements } = measurementsRes
      if (locationType === 'uk-location') {
        const filters = [
          'LOCAL_TYPE:City',
          'LOCAL_TYPE:Town',
          'LOCAL_TYPE:Village',
          'LOCAL_TYPE:Suburban_Area',
          'LOCAL_TYPE:Postcode',
          'LOCAL_TYPE:Airport'
        ].join('+')

        const osPlacesApiUrl = `${config.get('osPlacesApiUrl')}${encodeURIComponent(
          userLocation
        )}&fq=${encodeURIComponent(filters)}&key=${config.get('osPlacesApiKey')}`

        const shouldCallApi = symbolsArr.some((symbol) =>
          userLocation.includes(symbol)
        )
        let response
        if (!shouldCallApi) {
          response = await proxyFetch(osPlacesApiUrl).then((res) => res.json())
        } else {
          response = { data: [] }
        }
        //
        const { results } = response

        if (!results || results.length === 0) {
          return h.view('locations/location-not-found', {
            userLocation: locationNameOrPostcode
          })
        }

        let matches = results.filter((item) => {
          const name = item.GAZETTEER_ENTRY.NAME1.toUpperCase()
          return name.includes(userLocation) || userLocation.includes(name)
        })

        // If it's a partial postcode and there are matches, use the first match and adjust the title
        if (
          partialPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
          matches.length > 0 &&
          locationNameOrPostcode.length <= 3
        ) {
          matches[0].GAZETTEER_ENTRY.NAME1 =
            locationNameOrPostcode.toUpperCase() // Set the name to the partial postcode
          matches = [matches[0]]
        }
        const { forecastNum, nearestLocationsRange } = getNearestLocation(
          matches,
          forecasts,
          measurements,
          'uk-location',
          0
        )
        request.yar.set('locationData', {
          data: matches,
          rawForecasts: forecasts,
          forecastNum,
          forecastSummary,
          nearestLocationsRange,
          measurements
        })
        //
        if (matches.length === 1) {
          const locationDetails = matches[0]
          let title = ''
          if (locationDetails) {
            if (locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY) {
              title =
                locationDetails.GAZETTEER_ENTRY.NAME1 +
                ', ' +
                locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY
            } else {
              title = locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH
            }
          }
          //
          const airQuality = getAirQuality(forecastNum[0])
          return h.view('locations/location', {
            result: matches[0],
            airQuality,
            airQualityData: airQualityData.commonMessages,
            monitoringSites: nearestLocationsRange,
            siteTypeDescriptions,
            pollutantTypes,
            displayBacklink: true,
            pageTitle: title,
            serviceName: 'Check local air quality',
            forecastSummary
          })
        } else if (matches.length > 1 && locationNameOrPostcode.length > 3) {
          return h.view('locations/multiple-locations', {
            results: matches,
            userLocation: locationNameOrPostcode,
            airQuality,
            airQualityData: airQualityData.commonMessages,
            monitoringSites: nearestLocationsRange,
            siteTypeDescriptions,
            pollutantTypes,
            pageTitle: `Locations matching ${userLocation}`,
            serviceName: 'Check local air quality'
          })
        } else {
          return h.view('locations/location-not-found', {
            userLocation: locationNameOrPostcode,
            pageTitle: `We could not find ${locationNameOrPostcode} - Check local air quality - GOV.UK`
          })
        }
      } else if (locationType === 'ni-location') {
        const postcodeNIURL = config.get('postcodeNortherIrelandUrl')
        const postcodeNortherIrelandURL = `${postcodeNIURL}${encodeURIComponent(userLocation)}`
        const response = await proxyFetch(postcodeNortherIrelandURL).then(
          (res) => res.json()
        )
        const { result } = response
        if (!result || result.length === 0) {
          return h.view('locations/location-not-found', {
            userLocation: locationNameOrPostcode
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
          forecasts,
          measurements,
          'Ireland',
          0
        )
        let title = ''
        if (locationData) {
          title =
            locationData.GAZETTEER_ENTRY.NAME1 +
            ', ' +
            locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH
        }
        logger.info(
          `coordinates latitude: ${locationData.GAZETTEER_ENTRY.LATITUDE} longitude: ${locationData.GAZETTEER_ENTRY.LONGITUDE}`
        )
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
          forecastSummary,
          nearestLocationsRange
        })
      }
    } catch (error) {
      return h.view('error/index', {
        userLocation: locationNameOrPostcode
      })
    }
  }
}

const getLocationDetailsController = {
  handler: (request, h) => {
    try {
      const locationId = request.path.split('/')[2]
      const locationData = request.yar.get('locationData') || []
      let locationIndex = 0
      const locationDetails = locationData.data.find((item, index) => {
        if (item.GAZETTEER_ENTRY.ID === locationId) {
          locationIndex = index
          return item.GAZETTEER_ENTRY.ID === locationId
        }
        return null
      })

      if (locationDetails) {
        let title = ''
        if (locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY) {
          title =
            locationDetails.GAZETTEER_ENTRY.NAME1 +
            ', ' +
            locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY
        } else {
          title = locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH
        }
        const { forecastNum, nearestLocationsRange } = getNearestLocation(
          locationData.data,
          locationData.rawForecasts,
          locationData.measurements,
          'uk-location',
          locationIndex
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
          forecastSummary: locationData.forecastSummary
        })
      } else {
        return h.view('location-not-found')
      }
    } catch (error) {
      return h.status(500).render('error', {
        error: 'An error occurred while retrieving location details.'
      })
    }
  }
}

export { getLocationDataController, getLocationDetailsController }
