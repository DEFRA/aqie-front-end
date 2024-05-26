/* eslint-disable prettier/prettier */
import { proxyFetch } from '~/src/helpers/proxy-fetch.js'
import { config } from '~/src/config'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
// const options = { method: 'GET', headers: { 'Content-Type': 'text/json' } }
const logger = createLogger()
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
    logger.info(`userLocation 7 ${osPlacesApiKey}`)
    const osPlacesApiUrlFull = `${osPlacesApiUrl}${encodeURIComponent(
      userLocation
    )}&fq=${encodeURIComponent(filters)}&key=${osPlacesApiKey}`
    const forecastSummaryURL = config.get('forecastSummaryUrl')
    const forecastsAPIurl = config.get('forecastsApiUrl')
    const measurementsAPIurl = config.get('measurementsApiUrl')
    logger.info(`userLocation 8 ${forecastSummaryURL}`)
    logger.info(`userLocation 9 ${forecastsAPIurl}`)
    logger.info(`userLocation 9 ${measurementsAPIurl}`)
    const forecastSummaryRes = await proxyFetch(forecastSummaryURL).catch(
      (err) => {
        logger.info(`err 1 ${err}`)
      }
    )
    let getDailySummary
    if (forecastSummaryRes.ok) {
      getDailySummary = await forecastSummaryRes.json()
    }
    logger.info(`userLocation 9 ${getDailySummary}`)
    const forecastsRes = await proxyFetch(forecastsAPIurl).catch((err) => {
      logger.info(`err 1 ${err}`)
    })
    let getForecasts
    if (forecastsRes.ok) {
      getForecasts = await forecastsRes.json()
    }
    logger.info(`userLocation 9 ${getForecasts}`)
    const measurementsRes = await proxyFetch(measurementsAPIurl).catch(
      (err) => {
        logger.info(`err 1 ${err}`)
      }
    )
    let getMeasurements
    if (measurementsRes.ok) {
      getMeasurements = await measurementsRes.json()
    }
    logger.info(`userLocation 9 ${getMeasurements}`)
    const shouldCallApi = symbolsArr.some((symbol) =>
      userLocation.includes(symbol)
    )
    if (!shouldCallApi) {
      const osPlacesRes = await proxyFetch(osPlacesApiUrlFull).catch((err) => {
        logger.info(`err 1 ${err}`)
      })
      if (osPlacesRes.ok) {
        getOSPlaces = await osPlacesRes.json()
      }
    }
    logger.info(`userLocation 9 ${getOSPlaces}`)
    return { getDailySummary, getForecasts, getMeasurements, getOSPlaces }
  } else if (locationType === 'ni-location') {
    let getNIPlaces
    const postcodeNIURL = config.get('postcodeNortherIrelandUrl')
    const postcodeNortherIrelandURL = `${postcodeNIURL}${encodeURIComponent(userLocation)}`
    const northerIrelandRes = await proxyFetch(postcodeNortherIrelandURL)
    if (northerIrelandRes.ok) {
      getNIPlaces = await northerIrelandRes.json()
    }
    return { getNIPlaces }
  }
}

export { fetchData }
