import { config } from '../../config/index.js'
import { catchFetchError } from '../common/helpers/catch-fetch-error.js'
import { buildBackendApiFetchOptions } from '../common/helpers/backend-api-helper.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  HTTP_STATUS_OK,
  DAQI_INDEX_HIGH_START,
  DAQI_INDEX_VERY_HIGH
} from '../data/constants.js'

const logger = createLogger()

const POLLUTANT_DISPLAY_NAMES = {
  'ozone (o3)': 'ozone',
  'sulphur dioxide (so2)': 'sulphur dioxide',
  'nitrogen dioxide (no2)': 'nitrogen dioxide',
  'particulate matter (pm2.5)': 'PM2.5',
  'particulate matter (pm10)': 'PM10'
}

const POLLUTANT_HREFS = {
  'ozone (o3)': '/pollutants/ozone',
  'sulphur dioxide (so2)': '/pollutants/sulphur-dioxide',
  'nitrogen dioxide (no2)': '/pollutants/nitrogen-dioxide',
  'particulate matter (pm2.5)': '/pollutants/particulate-matter-25',
  'particulate matter (pm10)': '/pollutants/particulate-matter-10'
}

function getPollutantDisplayName(rawName) {
  if (!rawName) {
    return rawName
  }
  return POLLUTANT_DISPLAY_NAMES[rawName.toLowerCase()] || rawName
}

function getPollutantHref(rawName) {
  if (!rawName) {
    return '#'
  }
  return POLLUTANT_HREFS[rawName.toLowerCase()] || '#'
}

function getReadableBand(daqiValue) {
  if (daqiValue >= DAQI_INDEX_VERY_HIGH) {
    return 'Very high'
  }
  if (daqiValue >= DAQI_INDEX_HIGH_START) {
    return 'High'
  }
  return 'High'
}

function buildPollutantsText(pollutantNames) {
  if (pollutantNames.length === 1) {
    return pollutantNames[0]
  }
  if (pollutantNames.length === 2) {
    return `${pollutantNames[0]} and ${pollutantNames[1]}`
  }
  const allButLast = pollutantNames.slice(0, -1)
  const last = pollutantNames[pollutantNames.length - 1]
  return `${allButLast.join(', ')} and ${last}`
}

function buildDaqiAlertResult(data) {
  const highestDaqi = Math.max(...data.map((item) => item.daqi))
  const highestReadableBand = getReadableBand(highestDaqi)
  const distinctSiteIds = new Set(data.map((item) => item.siteId))
  const isMultipleStations = distinctSiteIds.size > 1

  // Deduplicate by pollutant name — same pollutant may be reported by multiple stations
  const seenNames = new Set()
  const pollutants = data.reduce((acc, item) => {
    const name = getPollutantDisplayName(item['pollutant-name'])
    if (name && !seenNames.has(name)) {
      seenNames.add(name)
      acc.push({ name, href: getPollutantHref(item['pollutant-name']) })
    }
    return acc
  }, [])

  const pollutantsText = buildPollutantsText(pollutants.map((p) => p.name))
  return {
    highestDaqi,
    highestReadableBand,
    isMultipleStations,
    pollutants,
    pollutantsText
  }
}

async function fetchActiveAlerts(url, fetchOptions) {
  const [status, data] = await catchFetchError(url, fetchOptions)

  if (status !== HTTP_STATUS_OK || !Array.isArray(data) || data.length === 0) {
    logger.info(
      `DAQI alert API: no active alerts (status=${status}, items=${Array.isArray(data) ? data.length : 0})`
    )
    return null
  }

  const activeAlerts = data.filter((item) => item['active-breaches'] === true)
  if (activeAlerts.length === 0) {
    logger.info(
      'DAQI alert API: response contained items but none with active-breaches=true'
    )
    return null
  }

  logger.info(`DAQI alert API: ${activeAlerts.length} active alert(s) returned`)
  return activeAlerts
}

async function fetchDaqiAlert(
  lat,
  lon,
  _locationId,
  _locationName,
  _lang = 'en',
  request = null
) {
  if (!lat || !lon) {
    return null
  }

  const baseUrl = config.get('notify.alertBackendBaseUrl')
  const daqiAlertPath = config.get('notify.daqiAlertPath')
  const pathWithParams = `${daqiAlertPath}?current-day=true&lat=${lat}&long=${lon}`

  const { url, fetchOptions } = buildBackendApiFetchOptions(
    request,
    baseUrl,
    pathWithParams,
    { method: 'GET' }
  )

  logger.info(`DAQI alert API URL: ${url}`)

  const activeAlerts = await fetchActiveAlerts(url, fetchOptions)
  if (!activeAlerts) {
    return null
  }
  return buildDaqiAlertResult(activeAlerts)
}

export {
  fetchDaqiAlert,
  getPollutantDisplayName,
  getPollutantHref,
  getReadableBand,
  buildPollutantsText
}
