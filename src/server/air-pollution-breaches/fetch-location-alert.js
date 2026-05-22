import { config } from '../../config/index.js'
import { catchFetchError } from '../common/helpers/catch-fetch-error.js'
import { buildBackendApiFetchOptions } from '../common/helpers/backend-api-helper.js'

const HTTP_STATUS_OK = 200

const POLLUTANT_DISPLAY_NAMES = {
  'ozone (o3)': 'ozone',
  'nitrogen dioxide (no2)': 'nitrogen dioxide',
  'sulphur dioxide (so2)': 'sulphur dioxide',
  'particulate matter (pm2.5)': 'PM2.5',
  'particulate matter (pm10)': 'PM10'
}

function getPollutantDisplayName(rawName) {
  if (!rawName) {
    return rawName
  }
  return POLLUTANT_DISPLAY_NAMES[rawName.toLowerCase()] || rawName
}

function buildPollutantsText(pollutants) {
  if (pollutants.length === 1) {
    return pollutants[0]
  }
  if (pollutants.length === 2) {
    return `${pollutants[0]} and ${pollutants[1]}`
  }
  const allButLast = pollutants.slice(0, -1)
  const last = pollutants[pollutants.length - 1]
  return `${allButLast.join(', ')} and ${last}`
}

async function fetchLocationAlert(
  lat,
  lon,
  locationId,
  locationName,
  lang = 'en',
  request = null
) {
  if (!lat || !lon) {
    return null
  }

  // Visual testing: append ?mockAlert=Ozone or ?mockAlert=Ozone,Sulphur%20dioxide to the location URL
  // if (request?.query?.mockAlert) {
  //   const mockPollutants = request.query.mockAlert
  //     .split(',')
  //     .map((p) => p.trim())
  //     .filter(Boolean)
  //   return {
  //     pollutantsText: buildPollutantsText(mockPollutants),
  //     breachesPageUrl: `/air-pollution-breaches?lang=${lang}&locationId=${encodeURIComponent(locationId)}&locationName=${encodeURIComponent(locationName)}`
  //   }
  // }

  const baseUrl = config.get('notify.alertBackendBaseUrl')
  const breachesPath = config.get('notify.breachesPath')
  const pathWithParams = `${breachesPath}?current-day=true&lat=${lat}&long=${lon}`

  const { url, fetchOptions } = buildBackendApiFetchOptions(
    request,
    baseUrl,
    pathWithParams,
    { method: 'GET' }
  )

  const [status, data] = await catchFetchError(url, fetchOptions)

  if (status !== HTTP_STATUS_OK || !Array.isArray(data) || data.length === 0) {
    return null
  }

  const activeBreaches = data.filter((item) => item['active-breaches'] === true)
  if (activeBreaches.length === 0) {
    return null
  }

  const pollutants = [
    ...new Set(
      activeBreaches.map((item) =>
        getPollutantDisplayName(item['pollutant-name'])
      )
    )
  ]
  const pollutantsText = buildPollutantsText(pollutants)
  const breachesPageUrl = `/air-pollution-breaches?lang=${lang}&locationId=${encodeURIComponent(locationId)}&locationName=${encodeURIComponent(locationName)}`

  return { pollutantsText, breachesPageUrl }
}

export { fetchLocationAlert, getPollutantDisplayName, buildPollutantsText }
