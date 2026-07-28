import { config } from '../../config/index.js'
import { catchFetchError } from '../common/helpers/catch-fetch-error.js'
import { buildBackendApiFetchOptions } from '../common/helpers/backend-api-helper.js'

const DATA_SOURCE_EN = 'Automatic Urban and Rural Network (AURN)'
const DATA_SOURCE_CY = 'Rhwydwaith Awtomatig Trefol a Gwledig (AURN)'
const MS_IN_24_HOURS = 24 * 60 * 60 * 1000
const MS_PER_HOUR = 1000 * 60 * 60
const MS_PER_MINUTE = 1000 * 60
const DAYS_IN_YEAR = 365
const HTTP_STATUS_OK = 200

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

const POLLUTANT_MAP = {
  'ozone (o3)': {
    displayName: 'Ozone',
    linkEn: '/pollutants/ozone?lang=en',
    linkCy: '/llygryddion/oson/cy?lang=cy'
  },
  'nitrogen dioxide (no2)': {
    displayName: 'Nitrogen dioxide',
    linkEn: '/pollutants/nitrogen-dioxide?lang=en',
    linkCy: '/llygryddion/nitrogen-deuocsid/cy?lang=cy'
  },
  'sulphur dioxide (so2)': {
    displayName: 'Sulphur dioxide',
    linkEn: '/pollutants/sulphur-dioxide?lang=en',
    linkCy: '/llygryddion/sylffwr-deuocsid/cy?lang=cy'
  },
  'particulate matter (pm2.5)': {
    displayName: 'PM2.5',
    linkEn: '/pollutants/particulate-matter-25?lang=en',
    linkCy: '/llygryddion/mater-gronynnol-25/cy?lang=cy'
  },
  'particulate matter (pm10)': {
    displayName: 'PM10',
    linkEn: '/pollutants/particulate-matter-10?lang=en',
    linkCy: '/llygryddion/mater-gronynnol-10/cy?lang=cy'
  }
}

function getPollutantInfo(rawName, lang) {
  const key = rawName.toLowerCase()
  const info = POLLUTANT_MAP[key]
  if (!info) {
    return { displayName: rawName, link: '#' }
  }
  return {
    displayName: info.displayName,
    link: lang === 'cy' ? info.linkCy : info.linkEn
  }
}

// Manually derives day/month/year/hour/minute from an ISO date string, based
// on the backend's offset convention:
//   - "+01:00" suffix (BST) => add 1 hour to the raw UTC time before display.
//   - "Z" / "+00:00" suffix (UTC/GMT) => display the raw UTC time as-is.
// We do NOT rely on a timezone library's DST resolution, since the backend
// explicitly tells us the offset to apply via the ISO string itself.
export function getAdjustedDateTimeParts(dateString) {
  if (!dateString) {
    return undefined
  }

  const match = dateString.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/
  )

  if (!match) {
    return undefined
  }

  const [, year, month, day, hour, minute, second, offset] = match

  const baseUtcMs = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  )

  const addOneHour = offset === '+01:00'
  const adjustedMs = addOneHour ? baseUtcMs + MS_PER_HOUR : baseUtcMs

  const adjustedDate = new Date(adjustedMs)

  const adjustedHour = adjustedDate.getUTCHours()
  const adjustedMinute = adjustedDate.getUTCMinutes()
  const period = adjustedHour >= 12 ? 'pm' : 'am'
  let displayHour = adjustedHour % 12
  if (displayHour === 0) {
    displayHour = 12
  }
  const displayMinute = String(adjustedMinute).padStart(2, '0')

  return {
    time: `${displayHour}:${displayMinute}${period}`,
    day: String(adjustedDate.getUTCDate()),
    month: MONTH_NAMES[adjustedDate.getUTCMonth()],
    year: String(adjustedDate.getUTCFullYear()),
    adjustedDate,
    adjustedMs
  }
}

// Formats an already-adjusted UTC instant (ms) directly, without applying
// any further offset adjustment. Used when we've derived a new instant via
// arithmetic on an already-adjusted time (e.g. alertPeriodFrom + 24h), so the
// BST adjustment carries through consistently instead of being re-applied
// or dropped.
function formatAdjustedInstant(ms) {
  const date = new Date(ms)
  const hour = date.getUTCHours()
  const minute = date.getUTCMinutes()
  const period = hour >= 12 ? 'pm' : 'am'
  let displayHour = hour % 12
  if (displayHour === 0) {
    displayHour = 12
  }
  const displayMinute = String(minute).padStart(2, '0')
  const day = date.getUTCDate()
  const month = MONTH_NAMES[date.getUTCMonth()]
  const year = date.getUTCFullYear()

  return `${displayHour}:${displayMinute}${period}, ${day} ${month} ${year}`
}

function formatTime(isoString) {
  const parts = getAdjustedDateTimeParts(isoString)
  return parts ? parts.time : ''
}

function formatDate(isoString) {
  const parts = getAdjustedDateTimeParts(isoString)
  return parts ? `${parts.day} ${parts.month} ${parts.year}` : ''
}

function formatAlertStarted(isoString) {
  const alertDate = new Date(isoString)
  const diffMs = Date.now() - alertDate.getTime()
  const diffHours = Math.floor(diffMs / MS_PER_HOUR)
  const diffMins = Math.floor(diffMs / MS_PER_MINUTE)
  const time = formatTime(isoString)
  const date = formatDate(isoString)

  if (diffHours < 1) {
    return `About ${diffMins} minute${diffMins !== 1 ? 's' : ''} ago (${time}, ${date})`
  }
  return `About ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago (${time}, ${date})`
}

function formatAlertPeriodFrom(isoString) {
  return `${formatTime(isoString)}, ${formatDate(isoString)}`
}

function buildPastBreachTitle(monitoringStation, region, isoString) {
  return `${monitoringStation}, ${region} (${formatDate(isoString)})`
}

function groupBySamplingId(items) {
  const grouped = new Map()
  let ungroupedIndex = 0

  for (const item of items) {
    const samplingId = item['sampling-id']
    const id = samplingId ?? `__ungrouped_${ungroupedIndex}`
    if (!samplingId) {
      ungroupedIndex += 1
    }
    if (!grouped.has(id)) {
      grouped.set(id, [])
    }
    grouped.get(id).push(item)
  }

  return Array.from(grouped.values())
}

function mapGroupToActiveBreach(items, lang) {
  const sorted = [...items].sort(
    (a, b) => new Date(a['alert-started']) - new Date(b['alert-started'])
  )
  const earliest = sorted[0]
  const latest = sorted[sorted.length - 1]

  const { displayName, link } = getPollutantInfo(
    earliest['pollutant-name'],
    lang
  )

  return {
    region: earliest['region'],
    monitoringLocation: earliest['monitoring-station-name'],
    pollutantName: displayName,
    pollutantLink: link,
    alertStartedText: formatAlertStarted(earliest['alert-started']),
    ...(items.length > 1
      ? { lastUpdatedText: formatAlertStarted(latest['alert-started']) }
      : {})
  }
}

function mapToPastBreach(item, lang) {
  const { displayName, link } = getPollutantInfo(item['pollutant-name'], lang)

  // Derive alertPeriodTo from the already BST-adjusted instant used for
  // alertPeriodFrom, so the +1h offset carries through consistently rather
  // than being dropped when adding 24 hours.
  const startParts = getAdjustedDateTimeParts(item['alert-started'])
  const startAdjustedMs = startParts
    ? startParts.adjustedMs
    : new Date(item['alert-started']).getTime()
  const alertEndMs = startAdjustedMs + MS_IN_24_HOURS

  return {
    title: buildPastBreachTitle(
      item['monitoring-station-name'],
      item['region'],
      item['alert-started']
    ),
    alertRegion: item['region'],
    monitoringArea: item['monitoring-station-name'],
    pollutantName: displayName,
    pollutantLink: link,
    dataSource: lang === 'cy' ? DATA_SOURCE_CY : DATA_SOURCE_EN,
    alertPeriodFrom: formatAlertPeriodFrom(item['alert-started']),
    alertPeriodTo: formatAdjustedInstant(alertEndMs)
  }
}

async function fetchBreaches(lang = 'en', request = null) {
  const baseUrl = config.get('notify.alertBackendBaseUrl')
  const breachesPath = config.get('notify.breachesPath')
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - DAYS_IN_YEAR * MS_IN_24_HOURS)
    .toISOString()
    .split('T')[0]
  const pathWithParams = `${breachesPath}?start-date=${startDate}&end-date=${endDate}`

  const { url, fetchOptions } = buildBackendApiFetchOptions(
    request,
    baseUrl,
    pathWithParams,
    { method: 'GET' }
  )

  const [status, data] = await catchFetchError(url, fetchOptions)

  if (status !== HTTP_STATUS_OK || !Array.isArray(data)) {
    return { activeBreaches: [], pastBreaches: [], apiError: true }
  }

  const activeBreaches = groupBySamplingId(
    data.filter((item) => item['active-breaches'] === true)
  ).map((group) => mapGroupToActiveBreach(group, lang))

  const pastBreaches = data
    .filter((item) => item['active-breaches'] === false)
    .filter((item) => {
      const d = new Date(item['alert-started'])
      return item['alert-started'] && !isNaN(d.getTime())
    })
    .map((item) => mapToPastBreach(item, lang))

  return { activeBreaches, pastBreaches }
}

function groupActiveByRegion(activeBreaches) {
  const regionMap = new Map()

  for (const breach of activeBreaches) {
    if (!regionMap.has(breach.region)) {
      regionMap.set(breach.region, [])
    }
    regionMap.get(breach.region).push(breach)
  }

  return Array.from(regionMap.entries()).map(([region, breaches]) => ({
    region,
    breaches
  }))
}

export {
  fetchBreaches,
  groupBySamplingId,
  mapGroupToActiveBreach,
  groupActiveByRegion
}
