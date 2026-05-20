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

function formatTime(date) {
  return date
    .toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    .replace('\u202f', '')
    .replace(' ', '')
    .toLowerCase()
}

function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatAlertStarted(isoString) {
  const alertDate = new Date(isoString)
  const diffMs = Date.now() - alertDate.getTime()
  const diffHours = Math.floor(diffMs / MS_PER_HOUR)
  const diffMins = Math.floor(diffMs / MS_PER_MINUTE)
  const time = formatTime(alertDate)
  const date = formatDate(alertDate)

  if (diffHours < 1) {
    return `About ${diffMins} minute${diffMins !== 1 ? 's' : ''} ago (${time}, ${date})`
  }
  return `About ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago (${time}, ${date})`
}

function formatAlertPeriodFrom(isoString) {
  const date = new Date(isoString)
  return `${formatTime(date)}, ${formatDate(date)}`
}

function buildPastBreachTitle(monitoringStation, region, isoString) {
  const date = new Date(isoString)
  return `${monitoringStation}, ${region} (${formatDate(date)})`
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
  const alertEndDate = new Date(
    new Date(item['alert-started']).getTime() + MS_IN_24_HOURS
  )
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
    alertPeriodTo: formatAlertPeriodFrom(alertEndDate.toISOString())
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
    return { activeBreaches: [], pastBreaches: [] }
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
