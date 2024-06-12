import {
  siteTypeDescriptions,
  pollutantTypes
} from '~/src/server/data/monitoring-sites.js'
import * as airQualityData from '~/src/server/data/air-quality.js'
import { getAirQuality } from '~/src/server/data/air-quality.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { getNearestLocation } from '~/src/server/locations/helpers/get-nearest-location'
import { fetchData } from '~/src/server/locations/helpers/fetch-data'

const logger = createLogger()
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
      const airQuality = getAirQuality(request.payload.aq)
      const { getDailySummary, getForecasts, getMeasurements, getOSPlaces } =
        await fetchData('uk-location', userLocation)
      if (locationType === 'uk-location') {
        const { results } = getOSPlaces

        if (!results || results.length === 0) {
          return h.view('locations/location-not-found', {
            userLocation: locationNameOrPostcode,
            pageTitle: `We could not find ${userLocation} - Check local air quality - GOV.UK`
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
          0
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
            summaryDate: getDailySummary.issue_date
          })
        } else if (matches.length > 1 && locationNameOrPostcode.length > 3) {
          return h.view('locations/multiple-locations', {
            results: matches,
            name2: matches[0].GAZETTEER_ENTRY?.NAME2,
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
        const { getNIPlaces } = await fetchData('ni-location', userLocation)
        const { result } = getNIPlaces

        if (!result || result.length === 0) {
          return h.view('locations/location-not-found', {
            userLocation: locationNameOrPostcode,
            pageTitle: `We could not find ${userLocation} - Check local air quality - GOV.UK`
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
          0
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
          nearestLocationsRange
        })
      }
    } catch (error) {
      logger.info(`error from location refresh ${error.message}`)
      return h.view('error/index', {
        msError: error.message
      })
    }
  }
}

const getLocationDetailsController = {
  handler: (request, h) => {
    try {
      const locationId = request.params.id
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
          forecastSummary: locationData.forecastSummary.today,
          summaryDate: locationData.forecastSummary.issue_date
        })
      } else {
        return h.view('location-not-found')
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
