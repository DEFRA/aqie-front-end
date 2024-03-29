import axios from 'axios'
import {
  monitoringSites,
  siteTypeDescriptions,
  pollutantTypes
} from '../data/monitoring-sites.js'
import * as airQualityData from '../data/air-quality.js'
import { getAirQuality } from '../data/air-quality.js'

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
      return h.redirect('/aqie-front-end/search-location')
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
        return h.redirect('/aqie-front-end/search-location')
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
        return h.redirect('/aqie-front-end/search-location')
      }
      const airQuality = getAirQuality(request.payload.aq)

      if (locationType === 'uk-location') {
        const filters = [
          'LOCAL_TYPE:City',
          'LOCAL_TYPE:Town',
          'LOCAL_TYPE:Village',
          'LOCAL_TYPE:Suburban_Area',
          'LOCAL_TYPE:Postcode',
          'LOCAL_TYPE:Airport'
        ].join('+')

        const apiUrl = `https://api.os.uk/search/names/v1/find?query=${encodeURIComponent(
          userLocation
        )}&fq=${encodeURIComponent(filters)}&key=vvR3FiaNjSWCnFzSKBst23TX6efl0oL9`
        const shouldCallApi = symbolsArr.some((symbol) =>
          userLocation.includes(symbol)
        )
        const response = !shouldCallApi ? await axios.get(apiUrl) : { data: [] }

        const { results } = response?.data

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

        request.yar.set('locationData', { data: matches })

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
          return h.view('locations/location', {
            result: matches[0],
            airQuality,
            airQualityData: airQualityData.commonMessages,
            monitoringSites,
            siteTypeDescriptions,
            pollutantTypes,
            displayBacklink: true,
            pageTitle: title,
            serviceName: 'Check local air quality'
          })
        } else if (matches.length > 1 && locationNameOrPostcode.length > 3) {
          return h.view('locations/multiple-locations', {
            results: matches,
            userLocation: locationNameOrPostcode,
            airQuality,
            airQualityData: airQualityData.commonMessages,
            monitoringSites,
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
        const postcodeApiUrl = `https://api.postcodes.io/postcodes?q=${encodeURIComponent(userLocation)}`
        const response = await axios.get(postcodeApiUrl)
        const { result } = response.data

        if (!result || result.length === 0) {
          return h.view('locations/location-not-found', {
            userLocation: locationNameOrPostcode
          })
        }

        const locationData = {
          GAZETTEER_ENTRY: {
            NAME1: result[0].postcode,
            DISTRICT_BOROUGH: result[0].admin_district
          }
        }
        let title = ''
        if (locationData) {
          title =
            locationData.GAZETTEER_ENTRY.NAME1 +
            ', ' +
            locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH
        }
        return h.view('locations/location', {
          result: locationData,
          airQuality,
          airQualityData: airQualityData.commonMessages,
          monitoringSites,
          siteTypeDescriptions,
          pollutantTypes,
          pageTitle: title,
          displayBacklink: true
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
      const locationId = request.path.split('/')[3]
      const locationData = request.yar.get('locationData') || []
      const locationDetails = locationData.data.find(
        (item) => item.GAZETTEER_ENTRY.ID === locationId
      )

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
        const airQuality =
          getAirQuality(/* Retrieved from session or another source */)
        return h.view('locations/location', {
          result: locationDetails,
          airQuality,
          airQualityData: airQualityData.commonMessages,
          monitoringSites,
          siteTypeDescriptions,
          pollutantTypes,
          pageTitle: title,
          displayBacklink: true
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
