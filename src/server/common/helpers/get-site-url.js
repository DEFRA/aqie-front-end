import { config } from '../../../config/index.js'
import { createLogger } from './logging/logger.js'

const logger = createLogger()
function getAirQualitySiteUrl(request) {
  let airQualityUrl = config.get('airQualityDomainUrl') + request.path

  if (request.query) {
    const queryParams = new URLSearchParams(request.query).toString()
    airQualityUrl += queryParams ? `?${queryParams}` : ''
  }

  logger.info(`Complete URL with query params:::::::: , ${airQualityUrl}`)
  return airQualityUrl
}

export { getAirQualitySiteUrl }
