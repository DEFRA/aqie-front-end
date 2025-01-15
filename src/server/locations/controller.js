import { getAirQuality } from '~/src/server/data/en/air-quality.js'
import { english } from '~/src/server/data/en/en.js'
import {
  getLocationNameOrPostcode,
  handleRedirect,
  configureLocationTypeAndRedirects
} from '~/src/server/locations/helpers/location-type-util'

const getLocationDataController = {
  handler: async (request, h) => {
    const { query, payload, headers } = request
    const tempString = headers?.referer?.split('/')[3]
    const str = tempString?.split('?')[0]

    const redirectResponse = handleRedirect(query, h)
    if (redirectResponse) {
      return redirectResponse
    }
    const { searchLocation } = english
    const locationType = payload?.locationType
    const airQuality = getAirQuality(payload?.aq, 2, 4, 5, 7)
    const locationNameOrPostcode = getLocationNameOrPostcode(
      locationType,
      payload
    )
    return configureLocationTypeAndRedirects(request, h, {
      locationType,
      locationNameOrPostcode,
      str,
      query,
      searchLocation,
      airQuality
    })
  }
}

export { getLocationDataController }
