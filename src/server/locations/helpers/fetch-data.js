/* eslint-disable prettier/prettier */
import { proxyFetch } from '~/src/helpers/proxy-fetch.js'
import { config } from '~/src/config'
import { createLogger } from '~/src/server/common/helpers/logging/logger'

const logger = createLogger()

const options = { method: 'GET', headers: { 'Content-Type': 'text/json' } }
async function fetchData(locationType, userLocation) {
  const symbolsArr = ['%', '$', '&', '#', '!', '¬', '`']
  let getOSPlaces = { data: [] }
  if (locationType === 'uk-location') {
    const filters = [
      'LOCAL_TYPE:City',
      'LOCAL_TYPE:Town',
      'LOCAL_TYPE:Village',
      'LOCAL_TYPE:Suburban_Area',
      'LOCAL_TYPE:Postcode',
      'LOCAL_TYPE:Airport'
    ].join('+')
    const osPlacesApiUrl = config.get('osPlacesApiUrl')
    const osPlacesApiKey = config.get('osPlacesApiKey')
    logger.info(`osPlacesApiUrlPartial: ${osPlacesApiUrl}`)
    const osPlacesApiUrlFull = `${osPlacesApiUrl}${encodeURIComponent(
      userLocation
    )}&fq=${encodeURIComponent(filters)}&key=${osPlacesApiKey}`
    const forecastSummaryURL = config.get('forecastSummaryUrl')
    const forecastsAPIurl = config.get('forecastsApiUrl')
    const measurementsAPIurl = config.get('measurementsApiUrl')
    const forecastSummaryRes = await proxyFetch(forecastSummaryURL, options)
    let getDailySummary
    if (forecastSummaryRes.ok) {
      getDailySummary = await forecastSummaryRes.json()
    }
    logger.info(`forecastsAPIurl: ${forecastsAPIurl}`)
    const forecastsRes = await proxyFetch(forecastsAPIurl, options)
    let getForecasts
    if (forecastsRes.ok) {
      getForecasts = await forecastsRes.json()
    }
    logger.info(`measurementsAPIurl: ${measurementsAPIurl}`)
    const measurementsRes = await proxyFetch(measurementsAPIurl, options)
    let getMeasurements
    if (measurementsRes.ok) {
      getMeasurements = await measurementsRes.json()
    }
    const shouldCallApi = symbolsArr.some((symbol) =>
      userLocation.includes(symbol)
    )
    if (!shouldCallApi) {
      logger.info(`osPlacesApiUrlFull: ${osPlacesApiUrlFull}`)
      const osPlacesRes = await proxyFetch(osPlacesApiUrlFull, options)
      if (osPlacesRes.ok) {
        getOSPlaces = await osPlacesRes.json()
      }
    }

    return { getDailySummary, getForecasts, getMeasurements, getOSPlaces }
  } else if (locationType === 'ni-location') {
    let getNIPlaces
    const postcodeNIURL = config.get('postcodeNortherIrelandUrl')
    logger.info(`postcodeNIURL: ${postcodeNIURL}`)
    logger.info(`userLocation: ${userLocation}`)
    const postcodeNortherIrelandURL = `${postcodeNIURL}${encodeURIComponent(userLocation)}`
    logger.info(`postcodeNortherIrelandURL: ${postcodeNortherIrelandURL}`)
    const northerIrelandRes = await proxyFetch(postcodeNortherIrelandURL)
    if (northerIrelandRes.ok) {
      getNIPlaces = await northerIrelandRes.json()
    }
    return { getNIPlaces }
  }
}

export { fetchData }
