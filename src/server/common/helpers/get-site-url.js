import { config } from '../../../config/index.js'

function getAirQualitySiteUrl(request) {
  let airQualityUrl = config.get('airQualityDomainUrl') + request.path

  if (request.query) {
    const queryParams = new URLSearchParams(request.query).toString()
    airQualityUrl += queryParams ? `?${queryParams}` : ''
  }

  return airQualityUrl
}

export { getAirQualitySiteUrl }
