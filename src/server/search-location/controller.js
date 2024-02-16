import axios from 'axios'
import { getAirQuality } from '../data/air-quality.js'
import {
  monitoringSites,
  siteTypeDescriptions,
  pollutantTypes
} from '../data/monitoring-sites.js'
import * as airQualityData from '../data/air-quality.js'
import { config } from '~/src/config'

const apiKey = 'vvR3FiaNjSWCnFzSKBst23TX6efl0oL9'

const prefix = config.get('appPathPrefix')

const getLocationDataController = {
  handler: async (request, h) => {
    const originalUserLocation = request.payload.location.trim()
    try {
      let userLocation = originalUserLocation.toUpperCase() // Use 'let' to allow reassignment
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

      const aqValue = request.payload.aq
      const airQuality = getAirQuality(aqValue)

      if (!userLocation) {
        return h.view('search-location.njk', {
          errors: {
            titleText: 'There is a problem',
            errorList: [
              {
                text: 'Enter a location or postcode',
                href: 'enter-location.html#location'
              }
            ]
          },
          searchParams: {
            label: {
              text: 'Where do you want to check?',
              classes: 'govuk-label--l govuk-!-margin-bottom-6',
              isPageHeading: true
            },
            hint: {
              text: 'Enter a location or postcode'
            },
            id: 'location',
            name: 'location',
            errorMessage: {
              text: 'Enter a location or postcode'
            }
          }
        })
      }

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
      )}&fq=${encodeURIComponent(filters)}&key=${apiKey}`

      const response = await axios.get(apiUrl)

      const { results } = response.data

      if (!results || results.length === 0) {
        return h.view('location-not-found.njk', {
          userLocation: originalUserLocation
        })
      }

      let matches = results.filter((item) => {
        const name = item.GAZETTEER_ENTRY.NAME1.toUpperCase()
        return name.includes(userLocation) || userLocation.includes(name)
      })

      // If it's a partial postcode and there are matches, use the first match and adjust the title
      if (
        partialPostcodePattern.test(originalUserLocation.toUpperCase()) &&
        matches.length > 0 &&
        originalUserLocation.length <= 3
      ) {
        matches[0].GAZETTEER_ENTRY.NAME1 = originalUserLocation.toUpperCase() // Set the name to the partial postcode
        matches = [matches[0]]
      }

      request.yar.set('locationData', { data: matches })

      if (matches.length === 1) {
        return h.view('location/index', {
          result: matches[0],
          airQuality,
          airQualityData: airQualityData.commonMessages,
          monitoringSites,
          siteTypeDescriptions,
          pollutantTypes,
          locationType: 'single location',
          serviceName: 'Check local air quality',
          prefix
        })
      } else if (matches.length > 1 && originalUserLocation.length > 3) {
        return h.view('locations/multiple-locations', {
          results: matches,
          userLocation: originalUserLocation,
          airQuality,
          airQualityData: airQualityData.commonMessages,
          monitoringSites,
          siteTypeDescriptions,
          pollutantTypes,
          serviceName: 'Check local air quality',
          prefix
        })
      } else {
        return h.view('location-not-found.njk', {
          prefix,
          userLocation: originalUserLocation
        })
      }
    } catch (error) {
      return h.status(400).render('error.njk', {
        error: 'An error occurred while fetching location data.',
        userLocation: originalUserLocation,
        prefix
      })
    }
  }
}

const searchLocationController = {
  handler: (request, h) => {
    return h.view('search-location/index', {
      pageTitle: 'Check local air quality',
      heading: 'Check local air quality',
      page: 'search-location',
      serviceName: 'Check local air quality',
      searchParams: {
        label: {
          text: 'Where do you want to check?',
          classes: 'govuk-label--l govuk-!-margin-bottom-6',
          isPageHeading: true
        },
        hint: {
          text: 'Enter a location or postcode'
        },
        id: 'location',
        name: 'location'
      },
      prefix
    })
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
        const airQuality =
          getAirQuality(/* Retrieved from session or another source */)
        return h.view('locations/location', {
          result: locationDetails,
          airQuality,
          airQualityData: airQualityData.commonMessages,
          monitoringSites,
          siteTypeDescriptions,
          pollutantTypes,
          locationType: 'single location',
          serviceName: 'Check local air quality'
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

export {
  getLocationDataController,
  searchLocationController,
  getLocationDetailsController
}
